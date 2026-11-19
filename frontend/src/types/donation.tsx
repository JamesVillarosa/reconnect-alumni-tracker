export type BankingDetails = {
    bdo: string;
    bpi: string;
    landbank: string;
    gcash: string;
    maya: string;
  };
  
  export const DefaultBankingDetails: BankingDetails = {
    bdo: "BDO 555-666-777",
    bpi: "BPI 444-333-222",
    landbank: "Landbank 999-888-777",
    gcash: "09179997777",
    maya: "09173334444"
  };
  
  /**
   * Extended type definition for donations that includes banking details and contact information.
   * @todo Move banking and contact info to a shared reusable type if used elsewhere
   */
export type DonationStatusEnum = 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Completed' | 'Cancelled' | 'Ongoing' | 'Archived'| "Flagged";

type OrganizerEntry = {
    name: string;     // Organizer's name
    email: string;    // Organizer's email
};

// Item requirement structure
type ItemRequirement = {
    item_name: string;        // Name of the required item
    target_quantity: number;  // Target quantity
    current_quantity: number; // Received so far
};

type DonationProps = {
    _id: string;
    created_by: string;
    created_at: Date;
    updated_at: Date;
    title: string;
    description: string;
    organizers: OrganizerEntry[]; // added organizers
    prioritized_items?: string[]; // added prioritized items for non-monetary
    donationImageURL: string;     // added donation image
    status: DonationStatusEnum;   // added donation status
    beneficiaries: string[];      // added beneficiaries
    location: string;             // added location
    end_date?: Date;            // added optional end date
    donorId_list: string[];
    allow_monetary: boolean;      // added allow_monetary flag
    target_funds?: number;        // optional based on allow_monetary
    raised_funds: number;
    allow_non_monetary: boolean; // added allow_item_donation flag
    item_requirements?: ItemRequirement[]; // list of required items
    donationType: "monetary" | "non-monetary";
    imageURL: string;
    
    // @TODO: implement this in database additional fields
    bankingDetails: BankingDetails;
    address: string;
    contactNumber: string;

    commentId?: string; // Reference to comment thread
  };



export default DonationProps;


// sample donations data
export const SampleDonations: DonationProps[] = [
    {
        _id: "1",
        created_at: new Date("2023-05-15"),
        updated_at: new Date("2023-05-15"),
        end_date: new Date("2023-06-22"),
        created_by: "Janet Doe",
        location: "Bristol, NJ",
        title: "ICS Fund Drive",
        description: "scholars fund drive",
        donorId_list: ["user1", "user2", "user3"],
        beneficiaries: ["ICS Scholarship Program"],
        raised_funds: 1250,
        target_funds: 5000,
        donationType: "monetary",
        imageURL: "https://example.com/scholarship-fund.jpg",
        bankingDetails: {
            bdo: "BDO 123-456-789",
            bpi: "BPI 987-654-321",
            landbank: "Landbank 000-111-222",
            gcash: "09171234567",
            maya: "09179876543"
        },
        address: "123 Scholarship St, Bristol, NJ",
        contactNumber: "0917-123-4567",
        organizers: [],
        donationImageURL: "",
        status: "Active",
        allow_monetary: false,
        allow_non_monetary: false
    },
    {
        _id: "2",
        created_at: new Date("2023-06-20"),
        updated_at: new Date("2023-06-22"),
        end_date: new Date("2023-06-22"),
        created_by: "Jack Doe",
        location: "Manila, Philippines",
        title: "ICS lib donations",
        description: "for icslib",
        donorId_list: ["user4", "user5"],
        beneficiaries: ["ICS lib"],
        raised_funds: 3200,
        target_funds: 10000,
        donationType: "non-monetary",
        imageURL: "https://example.com/school-supplies.jpg",
        bankingDetails: {
            bdo: "BDO 321-654-987",
            bpi: "BPI 123-456-789",
            landbank: "Landbank 222-333-444",
            gcash: "09171112222",
            maya: "09179998888"
        },
        address: "UP Los Baños, Manila",
        contactNumber: "0998-765-4321",
        organizers: [],
        donationImageURL: "",
        status: "Active",
        allow_monetary: false,
        allow_non_monetary: false
    },
    {
        _id: "3",
        created_at: new Date("2023-07-10"),
        updated_at: new Date("2023-07-15"),
        end_date: new Date("2023-06-22"),
        created_by: "Bruce Doe",
        location: "New York City",
        title: "ICS donation drive",
        description: "ICS donations",
        donorId_list: ["user6", "user7", "user8", "user9"],
        beneficiaries: ["ICS"],
        raised_funds: 7800,
        target_funds: 8000,
        donationType: "monetary",
        imageURL: "https://example.com/disaster-relief.jpg",
        bankingDetails: {
            bdo: "BDO 555-666-777",
            bpi: "BPI 444-333-222",
            landbank: "Landbank 999-888-777",
            gcash: "09179997777",
            maya: "09173334444"
        },
        address: "45 ICS Drive, New York",
        contactNumber: "0905-555-6666",
        organizers: [],
        donationImageURL: "",
        status: "Active",
        allow_monetary: false,
        allow_non_monetary: false
    }
  ];
  
  // blank donations
  export const BlankDonation: DonationProps = {
      _id: "",
      created_at: new Date(),
      updated_at: new Date(),
      end_date: new Date(),
      created_by: "",
      location: "",
      title: "",
      description: "",
      donorId_list: [],
      beneficiaries: [],
      raised_funds: 0,
      target_funds: 0,
      donationType: "monetary",
      imageURL: "",
      bankingDetails: {
          bdo: "",
          bpi: "",
          landbank: "",
          gcash: "",
          maya: ""
      },
      address: "",
      contactNumber: "",
      organizers: [],
      donationImageURL: "",
      status: "Active",
      allow_monetary: false,
      allow_non_monetary: false
  };