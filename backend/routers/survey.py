from fastapi import APIRouter, Body, HTTPException, Depends, Query, status
from bson import ObjectId
from pymongo import MongoClient
from pydantic import BaseModel, EmailStr, Field, StrictStr
from typing import List
from config.database import form_questions_collection
from config.database import form_answers_collection
from middleware.require_auth import verify_token
from datetime import datetime, timedelta
from models.form_questions_model import FormSchema
from models.form_answers_model import FormAnswerSchema

router = APIRouter(prefix="/survey", tags=["Survey Router"])

# Get answered surveys endpoint
@router.get("/surveys-answered/{user_id}")
async def get_all_answered_surveys(   
    user_id: str,
    user: dict = Depends(verify_token)
):
    try:
        try:
            user_obj_id = ObjectId(user_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID format")

        # get all answered forms by this user
        form_answers = form_answers_collection.find({"answered_by": user_obj_id})
        
        # get all available forms
        all_forms = form_questions_collection.find({})

        # if user has not answered any forms
        if not form_answers:
            return {
                "message": "No surveys answered",
                "answered_forms": []
            }

        answered_form_ids = {str(answer["form_id"]) for answer in form_answers}
        
        # filter answered forms
        answered_forms = []
        for form in all_forms:
            form["_id"] = str(form["_id"])
            if form["_id"] in answered_form_ids:
                if "created_by" in form:
                    form["created_by"] = str(form["created_by"])
                answered_forms.append(form)

        return {
            "message": "Answered surveys retrieved successfully",
            "answered_forms": answered_forms
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error fetching answered surveys: {str(e)}"
        )

# Get unanswered surveys endpoint
@router.get("/surveys-unanswered/{user_id}")
async def get_all_unanswered_surveys(   
    user_id: str,
    user: dict = Depends(verify_token)
):
    try:
        try:
            user_obj_id = ObjectId(user_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid user ID format")

        # get all answered forms by this user
        answered_forms = form_answers_collection.find({"answered_by": user_obj_id})
        
        # get all available forms
        all_forms = form_questions_collection.find({})

        # if user has answered all forms
        if answered_forms and len(list(answered_forms.clone())) == len(list(all_forms.clone())):
            return {
                "message": "No surveys unanswered",
                "answered_forms": []
            }

        answered_form_ids = {str(answer["form_id"]) for answer in answered_forms}
        
        # filter unanswered forms
        unanswered_forms = []
        for form in all_forms:
            form["_id"] = str(form["_id"])
            if form["_id"] not in answered_form_ids:
                if "created_by" in form:
                    form["created_by"] = str(form["created_by"])
                unanswered_forms.append(form)

        return {
            "message": "Unanswered surveys retrieved successfully",
            "unanswered_forms": unanswered_forms
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error fetching unanswered surveys: {str(e)}"
        )

# Post survey endpoint (creating a new survey)
@router.post("/")
async def create_survey(
    survey: FormSchema,
    user: dict = Depends(verify_token)
):
    try:
        survey_data = survey.model_dump(by_alias=True, exclude={"id"})
        
        # convert to mongodb fields
        survey_data["_id"] = ObjectId()
        survey_data["created_by"] = ObjectId(survey_data["created_by"])  
        survey_data["created_at"] = datetime.utcnow()
        survey_data["updated_at"] = datetime.utcnow()
        
        # insert
        insert_result = form_questions_collection.insert_one(survey_data)
        
        # verify if success
        if not insert_result.inserted_id:
            raise HTTPException(status_code=500, detail="Failed to create survey form")
        
        # return the inserted survey
        created_survey = form_questions_collection.find_one({"_id": insert_result.inserted_id})
        created_survey["_id"] = str(created_survey["_id"])  
        created_survey["created_by"] = str(created_survey["created_by"])  
        
        return {
            "message": "Survey form created successfully",
            "survey": created_survey
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error creating survey: {str(e)}"
        )


# Get single survey endpoint 
@router.get("/survey-question/{survey_id}", response_model=FormSchema)
async def get_survey_by_id(
    survey_id: str,
    user: dict = Depends(verify_token)
):  
    # convert to object id
    try:
        obj_id = ObjectId(survey_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid survey form ID format")

    # find
    survey = form_questions_collection.find_one({"_id": obj_id})

    # not found
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    # convert ids to strings
    survey["_id"] = str(survey["_id"])
    if "created_by" in survey:
        survey["created_by"] = str(survey["created_by"])
        
    return survey

# Get survey answers by user and survey id endpoint 
@router.get("/survey-answer/{survey_id}/{user_id}")
async def get_survey_answer_by_user_and_survey_id(
    survey_id: str,
    user_id: str,
    user: dict = Depends(verify_token)
):
    try:
        try:
            survey_obj_id = ObjectId(survey_id)
            user_obj_id = ObjectId(user_id)
        except:
            raise HTTPException(status_code=400, detail="Invalid ID format")
        
        # find 
        survey_answers = form_answers_collection.find_one({
            "form_id": survey_obj_id, 
            "answered_by": user_obj_id
        })

        # not found
        if not survey_answers:
            raise HTTPException(
                status_code=404,
                detail="No answers found for this user and survey"
            )
        
        # convert to strings
        survey_answers["_id"] = str(survey_answers["_id"])
        survey_answers["form_id"] = str(survey_answers["form_id"])
        survey_answers["answered_by"] = str(survey_answers["answered_by"])

        return {
            "message": "Survey answers retrieved successfully",
            "answer": survey_answers
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error getting survey answers: {str(e)}"
        )


# Post survey answer endpoint
@router.post("/survey-answer")
async def submit_survey_answers(
    answers: FormAnswerSchema,
    user: dict = Depends(verify_token)
):
    try:
        answer_data = answers.model_dump(by_alias=True, exclude={"id"})

        try:
            survey_obj_id = ObjectId(answer_data["form_id"])
            answered_by = ObjectId(answer_data["answered_by"])
        except:
            raise HTTPException(status_code=400, detail="Invalid survey form ID format")

        now = datetime.utcnow()

        # process answers
        processed_answers = []
        for answer in answer_data["answers"]:
            processed_answer = {
                "question_id": answer["question_id"],
                "uploaded_file_url": answer.get("uploaded_file_url")
            }
            
            # handle answers
            if answer.get("answer_choices"):
                processed_answer["answer_text"] = ", ".join(answer["answer_choices"])
            else:
                processed_answer["answer_text"] = answer.get("answer_text")
                
            processed_answers.append(processed_answer)

        # find existing
        existing = form_answers_collection.find_one({
            "form_id": survey_obj_id,
            "answered_by": answered_by
        })

        # update existing
        if existing:
            # Update existing answer
            update_result = form_answers_collection.update_one(
                {"_id": existing["_id"]},
                {"$set": {
                    "answers": answer_data["answers"],
                    "updated_at": now
                }}
            )
            
            if update_result.modified_count == 1:
                return {
                    "message": "Answers updated successfully",
                    "answer_id": str(existing["_id"]),
                    "form_id": answer_data["form_id"]
                }

        # insert new
        new_answer = {
            "_id": ObjectId(),
            "form_id": survey_obj_id,
            "answers": answer_data["answers"],
            "created_at": now,
            "updated_at": now,
            "answered_by": answered_by
        }

        # Insert new answer
        insert_result = form_answers_collection.insert_one(new_answer)
        
        if insert_result.inserted_id:
            return {
                "message": "Answers submitted successfully",
                "answer_id": str(new_answer["_id"]),
                "form_id": answer_data["form_id"]
            }

        raise HTTPException(status_code=500, detail="Failed to save answers")

    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error answering survey: {str(e)}"
        )