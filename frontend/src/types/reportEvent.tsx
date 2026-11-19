export enum ReportEventCategoryEnum {
    inappropriate_content = "Inappropriate or offensive event",
    misleading_info = "Misleading or incorrect details",
    spam_or_ads = "Spam or promotional content",
    duplicate_event = "Duplicate or fake event",
    other = "Other",
  }
  
  export enum ReportStatusEnum {
    pending = "Pending",
    approved = "Approved",
    dismissed = "Dismissed",
  }
  
  export type reportEventDetails = {
    _eventId: string;                        // ID of the reported event
    _userId: string;                         // ID of the reporting user
    category: ReportEventCategoryEnum[];    // Selected report categories
    description?: string;                   // Optional, required if "Other"
    status: ReportStatusEnum;
    created_at: Date;
    updated_at: Date;
  };
  