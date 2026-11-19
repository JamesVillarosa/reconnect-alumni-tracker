import React, { useEffect, useState } from 'react';
import AdminTable from '../../components/admin_components/AdminTable';
import { Funnel, Download, Banknote, Search, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/admin_components/AdminNavbar';
import { handleExport } from '../../components/admin_components/Exports';
import { useLocation } from 'react-router-dom';
import DonationProps, { BlankDonation } from '../../types/donation';
import DonationFilterModal from '../../components/admin_components/DonationFilterModal';
import { DashboardLabelAndValue, StatisticsBox } from '../../components/admin_components/AdminDashboardComponents';
import axios from 'axios';
import { InitiativesTrendLineChart } from '../../components/admin_components/AdminOtherCharts';
import { formatDateWithDash } from '../utils/TimeFormat';
import ListHeader from '../../components/admin_components/AdminHeaderSection';
import DeleteModal from '../../components/admin_components/DeleteModal';
import { showToast } from '../../components/utils/ToastFxn';
import { toastPromise } from '../utils/ToastFxn';

export interface FormNavigationState_Donation {
    donationId: string;
    donationDetails: DonationProps;
    existingDonations?: DonationProps[];
    newDonation?: DonationProps;
    isEdit?: boolean;
}

const AdminDonationsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    // const [donations, setDonations] = useState<DonationProps[]>([]);
    const [donations, setDonations] = useState<DonationProps[]>([]);
    const [donationCountByMonth, setDonationCountByMonth] = useState({});
    const [totalInitiativeCount, setTotalInitiativeCount] = useState<number>(0);
    const [totalMonetaryDonations, setTotalMonetaryDonations] = useState<number>(0);
    const [totalInKindDonations, setTotalInKindDonations] = useState<number>(0);
    const [selectedDonations, setSelectedDonations] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    type DonationFilters = {
        status: string;
        created_by: string;
        location: string;
        date_from: string;
        date_to: string;
    };
    const [filters, setFilters] = useState<DonationFilters>({
        status: "",
        created_by: "",
        location: "",
        date_from: "",
        date_to: "",
    });

    const [itemIDToDelete, setItemIDToDelete] = useState<string>("");
    const [itemNameToDelete, setItemNameToDelete] = useState<string>("");

    // fetch number of donations created by month
    const fetchDonationCountByMonth = async() => {
        try {
            // Expect the API to return data matching the 'User' type
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/donation/months`, {
                method: "GET",
                withCredentials: true,
            });
            const fetchedDonationCountData = response.data;
            setDonationCountByMonth(fetchedDonationCountData.donations_by_month);
            // console.log("Donation count data received:", fetchedDonationCountData);

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403) {
                    console.log("User is not an admin or token is invalid/missing.");
                } else if (error.response?.status === 500) {
                    console.log("Database error or other server-side issue during processing.");
                }
            }
        }
    }

    // fetch total number of monetary and in-kind donations
    const fetchCummulativeDonationStatistics = async() => {
        try {
            // Expect the API to return data matching the 'User' type
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/total-donations`, {
                method: "GET",
                withCredentials: true,
            });
            const fetchedDonationsData = response.data;
            setTotalInitiativeCount(fetchedDonationsData.totalInitiativeCount);
            setTotalMonetaryDonations(fetchedDonationsData.total_raised_funds);
            setTotalInKindDonations(fetchedDonationsData.total_items_collected);
            console.log("Donation data received:", fetchedDonationsData);

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403) {
                    console.log("User is not an admin or token is invalid/missing.");
                } else if (error.response?.status === 500) {
                    console.log("Database error or other server-side issue during processing.");
                }
            }
        }
    }

   // for donors
   const [donorsData, setDonorsData] = useState<Array<{ _id: string; first_name: string; last_name: string; email: string }>>([]);

   const fetchDonationsAndDonors = async () => {
        setIsLoading(true);
        try {
            // Fetch donations
            const donationsResponse = await fetch(`${import.meta.env.VITE_API_URL}/donation/?limit=100`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            
            if (!donationsResponse.ok) {
                const errorData = await donationsResponse.json();
                console.error("Donations fetch error:", errorData);
                return;
            }

            const donationsData = await donationsResponse.json();
            
            // Check if donations array exists in response
            if (!donationsData?.donations) {
                console.error("Unexpected donations response structure:", donationsData);
                return;
            }

            setDonations(donationsData.donations);
            setTotalInitiativeCount(donationsData.total);
            // console.log(donationsData);

            // Extract all unique donor IDs with null checks
            const allDonorIds = donationsData.donations
                .flatMap((d: DonationProps) => d.donorId_list || [])
                .filter(Boolean); // Remove any null/undefined values
            const uniqueDonorIds = [...new Set(allDonorIds)];
            // console.log("All donor id's ", allDonorIds);
            

            // Only fetch donor details if we have IDs
            if (uniqueDonorIds.length > 0) {
                const donorsResponse = await fetch(`${import.meta.env.VITE_API_URL}/profile/bulk`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_ids: uniqueDonorIds // Send as object with user_ids array
                    }),
                });

                if (!donorsResponse.ok) {
                    console.error("Donors fetch failed:", await donorsResponse.json());
                    return;
                }

                const donorsData = await donorsResponse.json();
                // console.log("Raw donor data:", JSON.stringify(donorsData, null, 2));
                
                setDonorsData(donorsData);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDonationsAndDonors();
        fetchCummulativeDonationStatistics();
        fetchDonationCountByMonth();
    }, []);

    // donation delete button handler
    const handleDeleteDonationClick = async(donation: DonationProps) => {
        setItemIDToDelete(donation._id);
        setItemNameToDelete(donation.title);
        (document.getElementById('delete-donation-modal') as HTMLDialogElement)?.showModal();
    };

    // donation deletion handler
    const handleDeleteDonation = async(id: string) => {
        try {
            setIsLoading(true);
            await toastPromise(
                axios.delete(`${import.meta.env.VITE_API_URL}/admin/donation/${id}`, {
                    method: "DELETE",
                    withCredentials: true
                }),
                {
                loading: {
                    title: "Deleting donation...",
                    description: "Donation initiative is being deleted.",
                    type: "info",
                },
                success: {
                    title: "Success!",
                    description: "Donation initiative was successfully deleted.",
                    type: "success",
                },
                error: {
                    title: "Failed!",
                    description: "There was an error deleting this donation initiative.",
                    type: "error",
                },
                }
            ).then(async() => {
                setDonations(prev => prev.filter(donation => donation._id !== id));
                setSelectedDonations(prev => prev.filter(donationId => donationId !== id));
                setItemIDToDelete("");
                setItemNameToDelete("");
                
                // Refresh the donation list and statistics after deletion
                await fetchDonationsAndDonors();
                await fetchCummulativeDonationStatistics();
                await fetchDonationCountByMonth();
            });
        } catch (error) {
            // console.error("Failed to delete donation initiative", error);
        } finally {
            setIsLoading(false);
        }
    }

    // apply filters from modal
    const handleApplyFilters = (newFilters: {
        status: string;
        created_by: string;
        location: string;
        date_from: string;
        date_to: string;
    }) => {
        setFilters(newFilters);
    };

    // filter donations based on applied filters
    const filteredDonations = donations.filter(donation => {
        // date filtering
        const donationDate = new Date(donation.created_at);
        donationDate.setHours(0, 0, 0, 0);
        
        const fromDate = filters.date_from ? new Date(filters.date_from) : null;
        if (fromDate) fromDate.setHours(0, 0, 0, 0);
        
        const toDate = filters.date_to ? new Date(filters.date_to) : null;
        if (toDate) toDate.setHours(23, 59, 59, 999);
        
        const dateInRange = (
            (!fromDate || donationDate >= fromDate) && 
            (!toDate || donationDate <= toDate)
        );

        const statusMatch = filters.status === "" || 
            donation.status.toLowerCase() === filters.status.toLowerCase();
        
        const creatorMatch = filters.created_by === "" || 
            (donation.created_by && donation.created_by.toLowerCase().includes(filters.created_by.toLowerCase()));
        
        const locationMatch = filters.location === "" || 
            (donation.location && donation.location.toLowerCase().includes(filters.location.toLowerCase()));
        
        return (
            dateInRange &&
            statusMatch &&
            creatorMatch &&
            locationMatch
        );
    });

    // table columns head
    const tableHead = [
        { key: 'title', label: 'Title', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        // { key: 'created_by', label: 'Created By', sortable: true },
        { key: 'organized_by', label: 'Organizer', sortable: true },
        { key: 'location', label: 'Location', sortable: true },
        // { key: 'end_date', label: 'End Date', sortable: true },
        { key: 'created_at', label: 'Date Posted', sortable: true },
        //{ key: 'donor_list', label: 'Donors', sortable: false },
    ];

    // donation create handler
    const handleCreateDonationClick = () => {
        navigate('form', {state: { 
            donationId: "", 
            donationDetails: BlankDonation, 
            existingDonations: donations 
        } as FormNavigationState_Donation});
    };
    
    // donation edit handler
    const editDonation = (donation: DonationProps) => {
        if (donation.status=='Active' || donation.status=='Ongoing'){
            showToast("error", "Unable to edit donation initiative.", "Initiative is currently active. Editing its details is prohibited.");
            return;
        }
        navigate('form', {state: { 
            donationId: donation._id, 
            donationDetails: donation, 
            existingDonations: donations,
            isEdit: true 
        } as FormNavigationState_Donation});
    };

    const viewDonationDetails = (donation: DonationProps) => {
        navigate(`/admin/donations/view`, { state: {donationId: donation._id, donationData: donation } });
    };

    useEffect(() => {
        if (location.state?.newDonation) {
            const { newDonation, isEdit } = location.state;
            setDonations(prevDonations => {
                if (isEdit) {
                    return prevDonations.map(donation =>
                        donation._id === newDonation._id ? newDonation : donation
                    );
                } else {
                    const exists = prevDonations.some(donation => donation._id === newDonation._id);
                    return exists ? prevDonations : [newDonation, ...prevDonations];
                }
            });
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);


    return (
        <div className="flex w-[100vw]">
            <AdminNavbar />
            <div className="flex w-full justify-center items-center">
                {/* limit width to 1280px */}
                <div className="w-[80vw] max-w-[1280px] h-full bg-white p-10">
                    <div className="flex flex-col gap-5">
                        {/* job page statistics */}
                        <div className="flex flex gap-5">
                            <StatisticsBox label="Accumulated Donations" className="flex-3/8 flex flex-col gap-5">
                                <DashboardLabelAndValue label="Monetary" unit="₱" 
                                    icon={<Banknote size={36} className="text-Primary mb-1"/>}
                                    value={totalMonetaryDonations.toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                    className="w-full"
                                />
                                <DashboardLabelAndValue label="In-Kind" 
                                    icon={<Heart size={32} className="text-Primary fill-Primary mb-1"/>}
                                    value={totalInKindDonations.toLocaleString('en-US', {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                    })}
                                    className="w-full"
                                />
                            </StatisticsBox>
                            <StatisticsBox label="Initiatives Trend" className="flex-5/8">
                                <InitiativesTrendLineChart initiativeTrendData={donationCountByMonth} />
                            </StatisticsBox>
                        </div>

                        {/* job listings section */}
                        <div className="h-full w-full flex flex-col justify-center items-start">
                            <div className='flex flex-col align-center py-5 justify-center items-center w-full mx-auto'>

                                {/* list header section */}
                                <ListHeader
                                    title="Initiatives"
                                    totalCount={totalInitiativeCount}
                                    data={donations}
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    onApplyFilters={handleApplyFilters}
                                    createType='Initiative'
                                    onCreate={handleCreateDonationClick}
                                    FilterModalComponent={DonationFilterModal}
                                />


                                {/* admin table */}
                                {isLoading ? (
                                    <div className='flex justify-center items-center h-64'>
                                        <span className='loading loading-spinner loading-lg'></span>
                                    </div>
                                ) : (
                                    <AdminTable
                                        tableHead={tableHead}
                                        data={filteredDonations}
                                        type="initiatives"
                                        onEdit={editDonation}
                                        onDelete={handleDeleteDonationClick}
                                        onView={viewDonationDetails}
                                        selectedItems={selectedDonations}
                                        setSelectedItems={setSelectedDonations}
                                        defaultSortColumn='created_at'
                                        renderRow={(donation) => {
                                            return (
                                                <>
                                                    <td className="font-medium">{donation.title}</td>
                                                    <td>
                                                        <DonationStatusComponent status={donation.status} />
                                                    </td>
                                                    <td>
                                                        <p className="line-clamp-2">{(donation.organizers).map(o => o.name).join(', ')}</p>
                                                    </td>
                                                    <td>{donation.location}</td>
                                                    <td>{donation.created_at && formatDateWithDash(donation.created_at)}</td>
                                                </>
                                                );
                                            }}      
                                        />
                                    )}
                            </div>
                        </div>
                        <DeleteModal modalID='delete-donation-modal' modalHeader="Delete Donation Initiative" itemType="initiative" id={itemIDToDelete} itemName={itemNameToDelete} deleteFunction={handleDeleteDonation} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDonationsPage;

const colorAndText = new Map<string, string>([
    ['Pending', 'bg-[#FFBE6E] text-[#AB2B00]'],
    ['Approved', 'bg-green-200 text-accent'],
    ['Rejected', 'bg-red-200 text-Error'],
    ['Active', 'bg-green-200 text-accent'],
    ['Completed', 'bg-green-200 text-accent'],
    ['Cancelled', 'bg-LightGray text-gray-500'],
    ['Ongoing', 'bg-green-200 text-accent'],
    ['Archived', 'bg-LightGray text-gray-500'],
    ['Flagged', 'bg-red-200 text-Error'],
]);

const statusColors = new Map<string, string>([
    ['Pending', 'bg-[#AB2B00]'],
    ['Approved', 'status-accent'],
    ['Rejected', 'status-error'],
    ['Active', 'status-accent'],
    ['Completed', 'status-accent'],
    ['Cancelled', 'status-neutral'],
    ['Ongoing', 'status-accent'],
    ['Archived', 'status-neutral'],
    ['Flagged', 'status-error'],
]);

const DonationStatusComponent: React.FC<{status: string}> = ({status}) => {
    const color = colorAndText.get(status);
    const statusColor = statusColors.get(status);

    
    return (
        <span className={`inline-flex items-center px-4 py-1 rounded-4xl text-xs ${color}`}>
            <span className={`status rounded-2xl mr-2 ${statusColor}`}></span>
            {status}
        </span>
    )
}