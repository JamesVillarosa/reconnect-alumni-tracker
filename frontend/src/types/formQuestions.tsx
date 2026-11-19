// Expanded Enum for more question types
export type QuestionTypeEnum = 
  | 'Likert'
  | 'OpenEnded'
  | 'Dropdown'
  | 'MultipleChoice'
  | 'YesOrNo'
  | 'FileUpload';

// Single question structure
export type QuestionEntry = {
  question_text: string;       // The question text
  type: QuestionTypeEnum;      // Type of the question
  options?: string[];          // For Dropdown, MultipleChoice, YesOrNo types
  required: boolean;           // Is answering this required?
  file_upload_allowed?: boolean; // If file upload is allowed (default false)
};

// Full form structure
export type FormProps = {
  _id: string;                 // MongoDB document ID
  created_by: string;          // Admin user ID who created the form
  title: string;               // Form title
  description?: string;        // Optional description
  questions: QuestionEntry[];  // List of questions
  created_at: Date;            // Creation timestamp
  updated_at: Date;            // Last updated timestamp
};

export default FormProps;

// Blank template
export const BlankForm: FormProps = {
  _id: '',
  created_by: '',
  title: '',
  description: '',
  questions: [],
  created_at: new Date(),
  updated_at: new Date()
};