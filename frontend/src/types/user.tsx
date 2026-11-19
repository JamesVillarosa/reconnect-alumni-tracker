type RoleEnum = 'admin' | 'alumni';
type AccountStatusEnum = 'Active' | 'Inactive' | 'New';
type VerificationStatusEnum = 'Verified' | 'Unverified';
type AuthProviderEnum = 'local' | 'google' | 'facebook';


type CareerEntry = {
    company: string;                    
    classification: string;             
    industry: string;                   
    tenured_status?: boolean;           
    salary_range?: string;              
    is_current?: boolean;               
};

// // timeline display - career section
// type ProfileCareerEntry = {
//     company: string;                    // Company name
//     position: string;                   // Job title/role
//     logo_url?: string;                  // Company logo
//     start_date?: string;                // Format: "YYYY-MM"
//     end_date?: string;                  // Format: "YYYY-MM" or null
//     is_current: boolean;                // Whether this job is ongoing
// };

// // Timeline display - education section
// type ProfileEducationEntry = {
//     school_name: string;               // Name of university or school
//     degree: string;                    // Degree or program name
//     logo_url?: string;                 // School logo image
//     graduation_date?: string;          // Format: "YYYY-MM"
// };

type UserProps = {
    _id: string;
    created_at: Date;
    updated_at: Date;
    email: string;
    password?: string;
    first_name: string;
    last_name: string;
    role: RoleEnum;
    student_number: string; // removed graduation year
    bookmarked_jobs?: string[]; // added bookmarks
    bookmarked_events?: string[]; // added bookmarks
    biography?: string;   // user bio
    location?: string;    // user location
    profile_picture?: string; // profile pic url
    header_picture?: string;  // header/banner pic url
    current_career?: CareerEntry; // Used on signup only
    // career_history?: ProfileCareerEntry[]; // Timeline view
    // education_history?: ProfileEducationEntry[]; // Timeline view
    auth_provider: AuthProviderEnum;
    account_status: AccountStatusEnum;
    verification_status: VerificationStatusEnum;
    rsvpd_events?: string[]; // added rsvped events
    surveys_taken?: string[]; // added surveys taken
    is_flagged: boolean
    contact_number: string
};

export type { UserProps, CareerEntry, RoleEnum, AccountStatusEnum, VerificationStatusEnum, AuthProviderEnum };
