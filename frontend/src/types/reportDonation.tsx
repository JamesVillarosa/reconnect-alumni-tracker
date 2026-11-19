export enum ReportDonationCategoryEnum {
    suspicious_fundraising = "Suspicious fundraising activity",
    offensive_description = "Offensive or inappropriate content",
    fake_or_duplicate = "Fake or duplicate donation",
    spam_or_ads = "Spam or unrelated ads",
    other = "Other",
  }
  
  export enum ReportStatusEnum {
    pending = "Pending",
    approved = "Approved",
    dismissed = "Dismissed",
  }
  
  export type reportDonationDetails = {
    _donationId: string;                       // ID of the reported donation
    _userId: string;                           // ID of the reporting user
    category: ReportDonationCategoryEnum[];    // Selected report categories
    description?: string;                      // Optional, required if "Other"
    status: ReportStatusEnum;
    created_at: Date;
    updated_at: Date;
  };
  