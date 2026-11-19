type DonationApprovalEnum = 'Pending' | 'Approved' | 'Rejected';
type DonationTypeEnum = 'Monetary' | 'Non-Monetary';
type MonetaryMethodEnum = 'Bank Transfer' | 'GCash/Maya';
type NonMonetaryMethodEnum = 'Pick-up' | 'Drop-off';

type DonatedItem = {
    name: string;       // Name of the donated item
    quantity: number;   // Quantity of the item
};

type DonorProps = {
    userId?: string;                     // ID of the donor
    driveId: string;                    // ID of the donation drive
    donation_type: DonationTypeEnum;
    donationProofURL?: string;          // Optional receipt or proof URL
    status: DonationApprovalEnum;

    // Monetary donation
    amount?: number;
    monetary_method?: MonetaryMethodEnum;

    // Non-monetary donation
    non_monetary_method?: NonMonetaryMethodEnum;
    items?: DonatedItem[];              // List of donated items
    total_weight_kg?: number;
    pickup_address?: string;
    contact_number?: string;
    preferred_date?: string;            // Format: YYYY-MM-DD
    preferred_time?: string;            // Format: HH:MM
};

export default DonorProps;
