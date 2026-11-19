import pytest
from routers.admin.donors import get_donation_change, DonationApprovalEnum

@pytest.mark.parametrize("prev_status, new_status, expected", [
    (DonationApprovalEnum.pending.value, DonationApprovalEnum.approved.value, 100.0),   # +amount
    (DonationApprovalEnum.pending.value, DonationApprovalEnum.rejected.value, 0.0),     # no change
    (DonationApprovalEnum.approved.value, DonationApprovalEnum.rejected.value, -100.0), # -amount
    (DonationApprovalEnum.approved.value, DonationApprovalEnum.pending.value, -100.0),  # -amount
    (DonationApprovalEnum.rejected.value, DonationApprovalEnum.approved.value, 100.0),  # +amount
    (DonationApprovalEnum.rejected.value, DonationApprovalEnum.pending.value, 0.0),     # no change
])
def test_get_donation_change(prev_status, new_status, expected):
    amount = 100.0
    result = get_donation_change(prev_status, new_status, amount)
    assert result == expected
