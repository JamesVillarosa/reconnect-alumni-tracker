// Enum for request status
type InfoRequestStatusEnum = 'Pending' | 'Approved' | 'Rejected';

type InfoRequestProps = {
    _id: string;
    created_at: Date;
    updated_at: Date;
    submitted_by: string;               // ID of the alumni who submitted the request
    recipient_name: string;            // Full name of the recipient
    recipient_email: string;           // Email address of the recipient
    requested_info: string;            // Description of the information being requested
    status: InfoRequestStatusEnum;     // Current status of the request
};

export default InfoRequestProps;
