export type JobTypeEnum = 'Full-Time' | 'Part-Time';

export type JobLevelEnum =
    | 'Intern'
    | 'Entry Level'
    | 'Junior'
    | 'Mid Level'
    | 'Senior'
    | 'Lead'
    | 'Principal';

export type JobFieldEnum =
    | 'Web Developer'
    | 'Mobile Developer'
    | 'Backend Developer'
    | 'Frontend Developer'
    | 'Full Stack Developer'
    | 'UI/UX Developer'
    | 'QA Tester'
    | 'DevOps Engineer'
    | 'Data Analyst'
    | 'Project Manager';

export type JobStatusEnum = 'Still Hiring' | 'Closed' | 'Archived';


export type JobProps = {
    _id: string;
    authorId: string;
    title: string;
    company_name: string;
    company_url: string;
    location: string;
    job_field: JobFieldEnum;
    job_type: JobTypeEnum;
    job_level: JobLevelEnum;
    // removed job_setup
    min_salary?: number; // added minimum salary for range
    max_salary?: number; // added maximum salary for range
    description: string;
    application_link: string;
    flagged?: boolean;
    qualifications: string[];
    start_date: Date;
    end_date: Date;
    commentId?: string; // Reference to comment thread

    // added for admin - job posting page
    status: JobStatusEnum;
    date_posted?: Date;
    author_name: string;
};

export default JobProps;

export const JobTypeEnum = ['Full-Time', 'Part-Time'];

export const JobLevelEnum = [
    'Intern',
    'Entry Level',
    'Junior',
    'Mid_Level',
    'Senior',
    'Lead',
    'Principal',
] ;

export const JobFieldEnum = [
    'Web Developer',
    'Mobile Developer',
    'Backend Developer',
    'Frontend Developer',
    'Full Stack Developer',
    'UI/UX Developer',
    'QA Tester',
    'DevOps Engineer',
    'Data Analyst',
    'Project Manager',
];



// sample values
export const JobsSample: JobProps[] = [
    {
        _id: '67e45bbaf6c58f15a40ac4fe',
        authorId: '101',
        title: 'Frontend Developer',
        company_name: 'Google',
        company_url: 'https://www.google.com/',
        location: 'Mountain View, CA',
        job_field: 'Frontend Developer',
        job_type: 'Full-Time',
        job_level: 'Senior',
        min_salary: 120000,
        max_salary: 150000,
        description: 'Seeking a frontend developer with expertise in React and TypeScript.',
        application_link: 'https://www.google.com/careers',
        qualifications: ['BS in Computer Science', '5+ years of experience', 'Expert in React.js'],
        start_date: new Date(),
        end_date: new Date(),
        status: "Still Hiring",
        date_posted: new Date(),
        author_name: "First Name",
    },
    {
        _id: '67e45d1aa1c2fe3b78a6b101',
        authorId: '102',
        title: 'Backend Developer',
        company_name: 'Facebook',
        company_url: 'https://www.facebook.com/',
        location: 'Menlo Park, CA',
        job_field: 'Backend Developer',
        job_type: 'Full-Time',
        job_level: 'Mid Level',
        min_salary: 120000,
        max_salary: 150000,
        description: 'Looking for a backend developer proficient in Node.js and PostgreSQL.',
        application_link: 'https://www.facebook.com/careers',
        qualifications: ['BS in Software Engineering', '3+ years of experience', 'Strong database skills'],
        start_date: new Date(),
        end_date: new Date(),
        status: "Still Hiring",
        date_posted: new Date(),
        author_name: "Second Name",
    },
    {
        _id: '67e45d2f4a0b759a61dc94a2',
        authorId: '103',
        title: 'Full Stack Developer',
        company_name: 'Amazon',
        company_url: 'https://www.amazon.com/',
        location: 'Seattle, WA',
        job_field: 'Full Stack Developer',
        job_type: 'Full-Time',
        job_level: 'Junior',
        min_salary: 120000,
        max_salary: 150000,
        description: 'Join our team as a Full Stack Developer working with Java and Angular.',
        application_link: 'https://www.amazon.jobs/',
        qualifications: ['BS in Computer Science', '2+ years experience', 'Familiarity with AWS'],
        start_date: new Date(),
        end_date: new Date(),
        status: "Still Hiring",
        date_posted: new Date(),
        author_name: "Third Name",
    },    
];

// blank job
export const BlankJob: JobProps = {
    _id: '',
    authorId: '',
    title: '',
    company_name: '',
    company_url: '',
    location: '',
    job_field: 'Web Developer',
    job_type: 'Full-Time',
    job_level: 'Intern',
    min_salary: 50000,
    max_salary: 150000,
    description: '',
    application_link: '',
    qualifications: [],
    start_date: new Date(),
    end_date: new Date(),
    status: 'Still Hiring',
    date_posted: new Date(),
    author_name: '',
};
