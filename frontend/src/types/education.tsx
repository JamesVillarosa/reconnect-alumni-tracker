export type EducationEntry = {
    _id: string;
    user_id: string;
    school_name: string;
    degree: string;
    logo_url?: string;
    graduation_date?: string; // Format: YYYY-MM
    created_at: Date;
    updated_at: Date;
  };
  
  export const BlankEducationEntry: EducationEntry = {
    _id: "",
    user_id: "",
    school_name: "",
    degree: "",
    logo_url: "",
    graduation_date: "",
    created_at: new Date(),
    updated_at: new Date()
  };