from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from bson import ObjectId
from typing import Any, Dict, List, Optional
from bson.errors import InvalidId
from models.users_model import RoleEnum
from config.database import donors_collection, donations_collection
from models.donors_model import DonationApprovalEnum, DonorSchema
from models.donations_model import DonationSchema
from pymongo.errors import PyMongoError
from middleware.require_auth import verify_token

router = APIRouter(prefix="/admin/donor", tags=["Admin Donor Router"])

# Endpoint Description: Get All Donors of a Donation (with 9 Donors per page (pagination))
# Contributed by: Kelvin James Beliber
@router.get("/{donation_id}")
async def get_donors_by_donation(
    donation_id: str,
    skip: int = Query(0, description="The number of donors to skip for pagination."),
    limit: int = Query(9, description="The number of donors to return."),
    user: dict = Depends(verify_token)
):
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Need admin privileges")

    try:
        donation_obj_id = ObjectId(donation_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid donation ID format")

    query = {"driveId": donation_obj_id}

    if limit == 0:
        donors = list(donors_collection.find(query).skip(skip))
    else:
        donors = list(donors_collection.find(query).skip(skip).limit(limit))

    total_count = donors_collection.count_documents(query)

    if not donors:
        raise HTTPException(status_code=404, detail="No donors found for this donation")

    for donor in donors:
        donor["_id"] = str(donor["_id"])
        donor["driveId"] = str(donor["driveId"])
        if donor.get("userId"):
            donor["userId"] = str(donor["userId"])

    return {
        "donors": donors,
        "hasMore": skip + (limit if limit != 0 else total_count) < total_count,
        "total": total_count,
        "skip": skip,
        "limit": limit
    }

@router.get("/{donor_id}/details", response_model=DonorSchema)
async def get_donor_details( 
    donor_id: str, 
    admin_user: dict = Depends(verify_token)
):
    if admin_user.get("role") != RoleEnum.admin.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required.")

    try:
        contribution_oid = ObjectId(donor_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Donor Contribution ID format.")

    donor_contribution_doc: Optional[Dict[str, Any]]
    try:
        donor = donors_collection.find_one({"_id": contribution_oid})
    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error occurred while fetching donor contribution: {str(e)}")

    if not donor_contribution_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Donor contribution with ID {donor_id} not found.")


    try:
        return donor 
    except Exception as e: 
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error processing donor contribution data: {str(e)}")

# if prev == Pending and curr == Approved : +amount
# if prev == Rejected and curr == Approved : +amount
# if prev == Approved and curr == Rejected : -amount
# if prev == Pending and curr == Rejected : no change
# if prev == Approved and curr == Pending : -amount
# if prev == Rejected and curr == Pending : no change

# Endpoint Description: Get _______
# Contributed by: Lawrence Combalicer, Aaron Zamora
def get_donation_change(prev_status, new_status, amount: float) -> float:
    if prev_status == DonationApprovalEnum.pending.value and new_status == DonationApprovalEnum.approved.value:
        return amount
    elif prev_status == DonationApprovalEnum.rejected.value and new_status == DonationApprovalEnum.approved.value:
        return amount
    elif prev_status == DonationApprovalEnum.approved.value and new_status == DonationApprovalEnum.rejected.value:
        return -amount
    elif prev_status == DonationApprovalEnum.approved.value and new_status == DonationApprovalEnum.pending.value:
        return -amount
    # No change for:
    # pending -> rejected
    # rejected -> pending
    return 0


@router.patch("/approve/{donor_id}")
async def approve_donor_contribution(donor_id: str, admin_user: dict = Depends(verify_token)):
    if admin_user.get("role") != RoleEnum.admin.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required.")

    try:
        contribution_oid = ObjectId(donor_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Contribution ID format.")

    donor_contribution = donors_collection.find_one({"_id": contribution_oid})
    if not donor_contribution:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor contribution not found.")

    prev_status = donor_contribution.get("status")
    if prev_status == DonationApprovalEnum.approved.value:
        return {"message": "Donor already verified"}

    amount = donor_contribution.get("amount", 0)
    donation_drive_id = donor_contribution.get("driveId")


    update_data = {"status": DonationApprovalEnum.approved.value, "updated_at": datetime.utcnow()}

    try:
        # Adjust accumulated donations
        delta = get_donation_change(prev_status, DonationApprovalEnum.approved.value, amount)
        if delta != 0:
            donations_collection.update_one(
                {"_id": ObjectId(donation_drive_id)},
                {"$inc": {"raised_funds": delta}}
            )

        donors_collection.update_one({"_id": contribution_oid}, {"$set": update_data})

        return {"message": "Donor contribution approved successfully"}
    
    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Unexpected error: {str(e)}")
    
@router.patch("/reject/{donor_id}")
async def reject_donor_contribution(donor_id: str, admin_user: dict = Depends(verify_token)):
    if admin_user.get("role") != RoleEnum.admin.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required.")

    try:
        contribution_oid = ObjectId(donor_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Contribution ID format.")

    donor_contribution = donors_collection.find_one({"_id": contribution_oid})
    if not donor_contribution:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor contribution not found.")

    prev_status = donor_contribution.get("status")
    if prev_status == DonationApprovalEnum.rejected.value:
        return {"message": "Donor contribution already rejected"}

    amount = donor_contribution.get("amount", 0)
    donation_drive_id = donor_contribution.get("driveId")

    update_data = {"status": DonationApprovalEnum.rejected.value, "updated_at": datetime.utcnow()}

    try:
        delta = get_donation_change(prev_status, DonationApprovalEnum.rejected.value, amount)
        print(f"Delta: {delta}")
        if delta != 0:
            donations_collection.update_one(
                {"_id": ObjectId(donation_drive_id)},
                {"$inc": {"raised_funds": delta}}
            )

        donors_collection.update_one({"_id": contribution_oid}, {"$set": update_data})

        return {"message": "Donor contribution rejected successfully"}

    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Unexpected error: {str(e)}")
    
@router.patch("/pending/{donor_id}")
async def set_donor_contribution_pending(donor_id: str, admin_user: dict = Depends(verify_token)):
    if admin_user.get("role") != RoleEnum.admin.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required.")

    try:
        contribution_oid = ObjectId(donor_id)
    except InvalidId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Contribution ID format.")

    donor_contribution = donors_collection.find_one({"_id": contribution_oid})
    if not donor_contribution:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor contribution not found.")

    prev_status = donor_contribution.get("status")
    if prev_status == DonationApprovalEnum.pending.value:
        return {"message": "Donor contribution is already pending."}

    amount = donor_contribution.get("amount", 0)
    donation_drive_id = donor_contribution.get("driveId")

    update_data = {"status": DonationApprovalEnum.pending.value, "updated_at": datetime.utcnow()}

    try:
        # Adjust accumulated donations
        delta = get_donation_change(prev_status, DonationApprovalEnum.pending.value, amount)
        if delta != 0:
            donations_collection.update_one(
                {"_id": ObjectId(donation_drive_id)},
                {"$inc": {"raised_funds": delta}}
            )

        donors_collection.update_one({"_id": contribution_oid}, {"$set": update_data})

        return {"message": "Donor contribution set to pending successfully"}
    
    except PyMongoError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Unexpected error: {str(e)}")


