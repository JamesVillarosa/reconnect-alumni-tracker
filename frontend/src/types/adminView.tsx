import { CareerEntry } from "./career";
import { SampleDonations } from "./donation";
import { SampleEvents } from "./event";
import { JobsSample } from "./job";

export type AccountStatus = 'Active' | 'Inactive' | 'New';
export type VerificationStatus = 'Verified' | 'Unverified';
export type UserRole = 'admin' | 'alumni';

export interface RecentDonationInfo {
    id: string;
    title: string;
    raised_funds: number; // Funds raised for this specific drive
    items_collected: number; // Items collected for this specific drive
    date: Date;
}

export interface AlumniProps {
    _id: string; // MongoDB ObjectId as string
    created_at:  Date; // ISO 8601 timestamp
    updated_at: Date; // ISO 8601 timestamp
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    bookmarked_jobs?: string[];
    bookmarked_events?: string[];
    biography?: string | null;
    location?: string | null;
    profile_picture?: string | null;
    header_picture?: string | null;
    current_career?: CareerEntry | null;
    account_status: AccountStatus;
    verification_status: VerificationStatus;
    rsvpd_events?: string[];
    surveys_taken?: string[];
    recent_donations?: RecentDonationInfo[];
    created_events?: string[];
    created_donations?: string[];
    posted_jobs?: string[];
    is_flagged: boolean;
}

export interface ApplicantView {
    user_id: string; // ObjectId string of the applicant user
    first_name?: string | null; // Applicant's first name
    last_name?: string | null; // Applicant's last name
    applied_at: string; // ISO 8601 timestamp when they applied
}
  
// Create alumni with connections to all related data
// export const SampleAlumni: AlumniProps[] = [
//     {
//         _id: 'alumni1',
//         created_at: new Date('2020-05-15'),
//         updated_at: new Date('2023-10-20'),
//         email: 'john.doe@example.com',
//         first_name: 'John',
//         last_name: 'Doe',
//         role: 'alumni',
//         biography: 'Computer Science graduate from 2015. Currently working as a Senior Software Engineer at Tech Corp.',
//         location: 'San Francisco, CA',
//         profile_picture: 'https://example.com/profiles/john.jpg',
//         header_picture: 'https://example.com/headers/john.jpg',
//         current_career: {
//             _id: 'career1',
//             user_id: 'alumni1',
//             position: 'Senior Software Engineer',
//             company: 'Tech Corp',
//             start_date: '2018-06-01',
//             end_date: '',
//             is_current: true,
//             created_at: new Date('2018-06-01'),
//             updated_at: new Date('2023-10-20')
//         },
//         account_status: 'Active',
//         verification_status: 'Verified',
//         bookmarked_jobs: [JobsSample[0]._id, JobsSample[1]._id],
//         bookmarked_events: [SampleEvents[0]._id],
//         rsvpd_events: [SampleEvents[0]._id, SampleEvents[1]._id],
//         surveys_taken: ['survey1'],
//         recent_donations: [
//             {
//                 id: SampleDonations[0]._id,
//                 title: SampleDonations[0].title,
//                 raised_funds: 500,
//                 items_collected: 0,
//                 date: new Date('2023-05-20')
//             }
//         ],
//         created_events: [SampleEvents[0]._id],
//         created_donations: [SampleDonations[0]._id],
//         posted_jobs: [JobsSample[0]._id]
//     },
//     {
//         _id: 'alumni2',
//         created_at: new Date('2021-02-10'),
//         updated_at: new Date('2023-09-15'),
//         email: 'jane.smith@example.com',
//         first_name: 'Jane',
//         last_name: 'Smith',
//         role: 'alumni',
//         biography: 'Business Administration graduate from 2018. Now running my own startup.',
//         location: 'New York, NY',
//         profile_picture: 'https://example.com/profiles/jane.jpg',
//         current_career: {
//             _id: 'career2',
//             user_id: 'alumni2',
//             position: 'Founder & CEO',
//             company: 'StartUp Innovations',
//             start_date: '2020-01-15',
//             end_date: '',
//             is_current: true,
//             created_at: new Date('2020-01-15'),
//             updated_at: new Date('2023-09-15')
//         },
//         account_status: 'Active',
//         verification_status: 'Verified',
//         bookmarked_events: [SampleEvents[1]._id],
//         rsvpd_events: [SampleEvents[1]._id],
//         surveys_taken: ['survey1', 'survey2'],
//         recent_donations: [
//             {
//                 id: SampleDonations[1]._id,
//                 title: SampleDonations[1].title,
//                 raised_funds: 200,
//                 items_collected: 5,
//                 date: new Date('2023-06-25')
//             }
//         ],
//         created_events: [SampleEvents[1]._id],
//         created_donations: [SampleDonations[1]._id],
//         posted_jobs: [JobsSample[1]._id]
//     },
//     {
//         _id: 'alumni3',
//         created_at: new Date('2023-01-05'),
//         updated_at: new Date('2023-01-05'),
//         email: 'mike.johnson@example.com',
//         first_name: 'Mike',
//         last_name: 'Johnson',
//         role: 'alumni',
//         account_status: 'New',
//         verification_status: 'Unverified',
//         biography: null,
//         location: 'Chicago, IL',
//         profile_picture: null,
//         current_career: null,
//         rsvpd_events: [SampleEvents[2]._id],
//         recent_donations: [
//             {
//                 id: SampleDonations[2]._id,
//                 title: SampleDonations[2].title,
//                 raised_funds: 1000,
//                 items_collected: 0,
//                 date: new Date('2023-07-12')
//             }
//         ],
//         created_events: [SampleEvents[2]._id],
//         created_donations: [SampleDonations[2]._id],
//         posted_jobs: [JobsSample[2]._id]
//     },
//     {
//         _id: 'admin1',
//         created_at: new Date('2019-11-20'),
//         updated_at: new Date('2023-08-10'),
//         email: 'admin@alumni.org',
//         first_name: 'Sarah',
//         last_name: 'Williams',
//         role: 'admin',
//         biography: 'Alumni relations coordinator since 2019',
//         location: 'Boston, MA',
//         profile_picture: 'https://example.com/profiles/sarah.jpg',
//         account_status: 'Active',
//         verification_status: 'Verified',
//         current_career: null
//     }
// ];

export const BlankAlumni: AlumniProps = {
    _id: '',
    created_at: new Date(),
    updated_at: new Date(),
    email: '',
    first_name: '',
    last_name: '',
    role: 'alumni',
    bookmarked_jobs: [],
    bookmarked_events: [],
    biography: null,
    location: null,
    profile_picture: null,
    header_picture: null,
    current_career: null,
    account_status: 'New',
    verification_status: 'Unverified',
    rsvpd_events: [],
    surveys_taken: [],
    recent_donations: [],
    created_events: [],
    created_donations: [],
    posted_jobs: [],
    is_flagged: false
};