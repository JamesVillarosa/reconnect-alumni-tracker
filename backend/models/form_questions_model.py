from .base_model import MongoBaseModel, PyObjectId
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum
from datetime import datetime

# Expanded Enum for more question types
class QuestionTypeEnum(str, Enum):
    likert = "Likert"
    open_ended = "OpenEnded"
    dropdown = "Dropdown"
    multiple_choice = "MultipleChoice"
    yes_no = "YesOrNo"
    file_upload = "FileUpload"  # For future extension

# Model for a single question
class QuestionEntry(BaseModel):
    question_text: str  # The actual question
    type: QuestionTypeEnum  # Type of the question (Likert, Dropdown, etc.)
    options: Optional[List[str]] = None  # Needed for Dropdown, MultipleChoice, YesOrNo
    required: bool = False  # Whether this field must be answered
    file_upload_allowed: bool = False  # Optional toggle for file upload in the future

# Model for the entire form
class FormSchema(MongoBaseModel):
    created_by: PyObjectId  # Admin user who created the form
    title: str  # Title of the form (e.g., Alumni Survey)
    description: Optional[str] = None  # Short description
    questions: List[QuestionEntry]  # List of questions
