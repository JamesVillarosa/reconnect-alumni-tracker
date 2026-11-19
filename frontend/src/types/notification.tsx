// Define all possible notification types
export type NotificationTypeEnum = 'Article' | 'Job' | 'Event' | 'Donation';

// Main notification structure
export type NotificationProps = {
  _id: string;                // MongoDB document ID
  userId?: string;            // Optional user-specific notification
  type: NotificationTypeEnum;  // Type of the notification (article, job, event, donation)
  referenceId: string;        // ID of the related content
  title: string;               // Hardcoded: "New Story", "Jobs", "New Event", "New Cause"
  description: string;         // Title of the related article/event/job/donation
  created_at: Date;            // When the notification was created
  updated_at: Date;           // When the notification was last updated
  is_read: boolean;            // Whether the notification has been read
};

export default NotificationProps;
