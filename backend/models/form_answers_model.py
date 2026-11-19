from .base_model import MongoBaseModel, PyObjectId
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class AnswerEntry(BaseModel):
    question_id: int  # Index of the question
    answer_text: Optional[str] = None  # Answer as string
    answer_choices: Optional[List[str]] = None  # MultipleChoice answer (array of strings)
    uploaded_file_url: Optional[str] = None  # Optional file (if allowed by question)

class FormAnswerSchema(MongoBaseModel):
    form_id: PyObjectId  # ID of the form
    answered_by: Optional[PyObjectId] = None  # Who answered (optional = anonymous)
    answers: List[AnswerEntry]  # Answers mapped to question_id
