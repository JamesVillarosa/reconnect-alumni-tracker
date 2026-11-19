export enum ReportCategoryEnum {
    offensive_or_discriminatory = "It's offensive and/or discriminatory",
    fake_job_or_money = "Asking for money or a fake job",
    inaccurate_info = "Inaccurate information provided",
    unrelated_selling = "I think it's trying to sell something unrelated",
    other = "Other",
}

export enum ReportStatusEnum {
    pending = "Pending",
    approved = "Approved",
    dismissed = "Dismissed",
}

export type reportJobDetails = {
    job_id: string;                       
    user_id: string;                      
    category: ReportCategoryEnum[];       
    description?: string;                 
    status: ReportStatusEnum; 
    created_at: Date;
    updated_at: Date;

};
