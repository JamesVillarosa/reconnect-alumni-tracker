// Enum for event approval statuses
export type ApprovalStatusEnum = 'Pending' | 'Approved' | 'Rejected' | 'Flagged' | 'Archived' | 'Closed';

// Organizer structure
export type Organizer = {
  name: string;
  email: string;
};

// Core event type without embedded RSVP list
export type EventProps = {
  _id: string;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  approval_status: ApprovalStatusEnum;
  eventImageURL: string;
  organizers: Organizer[];
  rsvp_count: number;            // Count only, RSVP entries stored separately
  commentId?: string;            // Reference to comment thread
};

export default EventProps;

// Blank template for new event creation
export const BlankEvent: EventProps = {
  _id: '',
  created_at: new Date(),
  updated_at: new Date(),
  created_by: '',
  title: '',
  description: '',
  event_date: new Date().toISOString(),
  location: '',
  approval_status: 'Pending',
  eventImageURL: '',
  organizers: [],
  rsvp_count: 0
};

export const SampleEvents: EventProps[] = [
  {
    _id: 'event1',
    created_at: new Date('2025-01-15'),
    updated_at: new Date('2025-02-15'),
    created_by: 'admin1',
    title: 'Unlocking the future',
    description: 'unlock the future tadah.',
    event_date: '2025-11-15T09:00:00',
    location: 'Calamba',
    approval_status: 'Approved',
    eventImageURL: 'https://smth.jpg',
    organizers: [
      { name: 'John Doe', email: 'john@example.com' },
      { name: 'Jane Smith', email: 'jane@example.com' }
    ],
    rsvp_count: 3
  },
  {
    _id: 'event2',
    created_at: new Date('2025-03-20'),
    updated_at: new Date('2025-03-21'),
    created_by: 'admin2',
    title: '50th alumni homecoming',
    description: 'join alumni homecoming.',
    event_date: '2025-09-10T13:00:00',
    location: 'Mandaluyong',
    approval_status: 'Pending',
    eventImageURL: 'https://idk.jpg',
    organizers: [
      { name: 'John Doe', email: 'john@example.com' },
      { name: 'Jane Smith', email: 'jane@example.com' }
    ],
    rsvp_count: 2
  },
  {
    _id: 'event3',
    created_at: new Date('2025-05-01'),
    updated_at: new Date('2025-04-02'),
    created_by: 'admin1',
    title: 'unlock ai trends',
    description: 'unlock ai trends now',
    event_date: '2025-08-25T18:00:00',
    location: 'Pasig City',
    approval_status: 'Rejected',
    eventImageURL: 'https://idkk.jpg',
    organizers: [
      { name: 'John Doe', email: 'john@example.com' },
      { name: 'Jane Smith', email: 'jane@example.com' }
    ],
    rsvp_count: 0
  },
  {
    _id: 'event9',
    created_at: new Date('2025-05-01'),
    updated_at: new Date('2025-04-02'),
    created_by: 'admin1',
    title: 'AI Technology Summit',
    description: 'Learn about the latest in AI technology',
    event_date: '2025-08-25T18:00:00',
    location: 'Pasig City',
    approval_status: 'Rejected',
    eventImageURL: 'https://idkk.jpg',
    organizers: [
      { name: 'John Doe', email: 'john@example.com' },
      { name: 'Jane Smith', email: 'jane@example.com' }
    ],
    rsvp_count: 0
  }
];