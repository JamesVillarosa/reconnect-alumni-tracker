export type AnswerEntry = {
  question_id: number;           // Index of the question
  answer_text?: string;          // Text answer (text, dropdown, etc.)
  answer_choices?: string[];     // Multiple choice answers (array of strings)
  uploaded_file_url?: string;    // URL if user uploads a file (optional)
};

export type FormAnswerProps = {
  _id: string;                  // MongoDB document ID
  form_id: string;               // ID of the form answered
  answered_by?: string;          // Optional user ID (if anonymous leave blank)
  answers: AnswerEntry[];        // Answers per question
  created_at: Date;              // When it was submitted
  updated_at: Date;              // When it was last updated
};

export default FormAnswerProps;
