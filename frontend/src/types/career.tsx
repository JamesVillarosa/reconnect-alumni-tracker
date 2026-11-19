export type CareerEntry = {
    _id: string;
    user_id: string;
    company: string;
    position: string;
    logo_url?: string;
    start_date?: string; // Format: YYYY-MM
    end_date?: string;
    is_current: boolean;
    created_at: Date;
    updated_at: Date;
  };
  
  export const BlankCareerEntry: CareerEntry = {
    _id: "",
    user_id: "",
    company: "",
    position: "",
    logo_url: "",
    start_date: "",
    end_date: "",
    is_current: false,
    created_at: new Date(),
    updated_at: new Date()
  };