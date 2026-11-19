import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Ellipsis, Box, CalendarDays, CircleAlert, HandCoins } from 'lucide-react';
import Button from '../../components/Button';
import DonationProps, { DonationStatusEnum } from '../../types/donation';
import DonorProps from '../../types/donor';
import AdminTable from '../../components/admin_components/AdminTable';
import { formatDateWithDash, formatToDate } from '../utils/TimeFormat';
import AdminNavbar from '../../components/admin_components/AdminNavbar';
import { StatisticsBox } from '../../components/admin_components/AdminDashboardComponents';
import axios from 'axios';
import ListHeader from '../../components/admin_components/AdminHeaderSection';
import DonorModal, { DonorModalDetails } from '../../components/admin_components/DonorModal';
import { AlumniProps } from '../../types/adminView';
import { toastPromise } from '../utils/ToastFxn';

const AdminDonationDetailsPage: React.FC = () => {
    const { state } = useLocation();
    const donationID = state?.donationId as string;
    const [donation, setDonation] = useState<DonationProps | undefined>(state?.donationData);
    const [currentInKindDonations, setCurrentInKindDomnations] = useState<number>(0);
    const [targetInKindDonations, setTargetInKindDomnations] = useState<number>(0);
    const navigate = useNavigate();
    const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
    const [isEllipsisOpen, setIsEllipsisOpen] = React.useState(false);
    const [donors, setDonors] = useState<any[]>([]);
    const ellipsisRef = React.useRef<HTMLDivElement>(null);
    const [totalDonors, setTotalDonors] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const [donorDetailsInModal, setDonorDetailsInModal] = useState<DonorModalDetails | undefined>(undefined);

    if (!donation) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-Primary mb-4">Donation Not Found</h2>
                    <Button 
                        onClick={() => navigate('/admin/donations')}
                        variant="major"
                    >
                        Back to Donations
                    </Button>
                </div>
            </div>
        );
    }

    const donorTableHead = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'type', label: 'Type', sortable: true },
        { key: 'date', label: 'Date', sortable: true },
        { key: 'donation', label: 'Donation', sortable: false }
    ];

    // fetch donation Details
    const fetchDonationDetails = async() => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/donation/${donationID}/details`, {
                method: "GET",
                withCredentials: true,
            });
            const fetchedDonationDetails = response.data;
            setDonation(fetchedDonationDetails);
            console.log("Initiative data received:", fetchedDonationDetails);

            const { totalTarget, totalCurrent } = fetchedDonationDetails.item_requirements.reduce(
                (acc: any, item: any) => {
                    acc.totalTarget += item.target_quantity;
                    acc.totalCurrent += item.current_quantity;
                    return acc;
            },
                { totalTarget: 0, totalCurrent: 0 }
            );
            
            setCurrentInKindDomnations(totalCurrent);
            setTargetInKindDomnations(totalTarget);

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

    const fetchInitiativeDonors = async() => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/donor/${donation._id}`, {
                method: "GET",
                withCredentials: true,
            });
            const fetchedInitiativeDonors = response.data;
            setDonors(fetchedInitiativeDonors.donors);
            setTotalDonors(fetchedInitiativeDonors.totalDonors);
            // console.log("Donors data received:", fetchedInitiativeDonors);

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403) {
                    console.log("User is not an admin or token is invalid/missing.");
                } else if (error.response?.status === 404) {
                    setDonors([]);
                    setTotalDonors(0);
                    console.log("No donors yet for this initiative.");
                } else if (error.response?.status === 500) {
                    console.log("Database error or other server-side issue during processing.");
                }
            }
        }
    }

    useEffect(() => {
        fetchInitiativeDonors();
        fetchDonationDetails();
    }, []);

    // const handleEditDonor = (donor: any) => {
    //     console.log('Edit Donor:', donor);
    // };

    // const handleDeleteDonor = (id: string) => {
    //     console.log('Delete Donor:', id);
    // };

    // fetch alumni data
    const fetchDonorContributorData = async(id: string): Promise<any> => {
        try {
            // Expect the API to return data matching the 'User' type
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/alumni/${id}`, {
                method: "GET",
                withCredentials: true,
            });
            const fetchedData = response.data;
            //setAlumniDataInModal(fetchedData);
            return fetchedData;
            // console.log("Data received:", fetchedData);

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    // console.log("Invalid job_id format.");
                } else if (error.response?.status === 404) {
                    // console.log("Job not found");
                }
            }
        }
    }

    const handleViewDonor = async(donor: any) => {
        const alumniData = await fetchDonorContributorData(donor.userId);
        const details: DonorModalDetails = {
            donorName: `${alumniData.first_name} ${alumniData.last_name}`,
            donorDetails: donor 
        }
        setDonorDetailsInModal(details);
        (document.getElementById('donor-details-modal') as HTMLDialogElement)?.showModal();
        // console.log('View Donor:', donor);
    };

    const handleDonationCauseStatusChange = async(new_status: DonationStatusEnum) => {
        try {
            await toastPromise(
                axios.patch(`${import.meta.env.VITE_API_URL}/donation/${donationID}`, {
                    status: new_status
                }, {
                    method: "PATCH",
                    withCredentials: true
                }),
                {
                loading: {
                    title: `Changing initiative status to ${status}...`,
                    description: "Initiative status is being changed",
                    type: "info",
                },
                success: {
                    title: "Success!",
                    description: `Initiative status has been successfully set to ${status}.`,
                    type: "success",
                },
                error: {
                    title: "Failed!",
                    description: "There was an error changing the  status of this donation cause.",
                    type: "error",
                },
                }
            ).then(async() => {
                fetchDonationDetails();
            });
        } catch (error) {
            // console.error("Failed to verify alumni", error);
        }
    }

    const renderDonorRow = (donor: any) => {
        const donationDetails = donor.donation_type === 'Monetary' 
            // ? `₱${donor.amount?.toLocaleString()} via ${donor.monetary_method}`
            ? `₱${donor.amount?.toLocaleString()} ${donor.monetary_method ? ` via ${donor.monetary_method}` : ""}`
            : donor.items?.length 
                ? donor.items.length > 1 
                    ? `${donor.items.length} items` 
                    : donor.items[0].name
                : 'No items specified';
        
        return (
            <>
                <td className="px-4 py-2">{donor.userId}</td>
                <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        donor.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        donor.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                        {donor.status}
                    </span>
                </td>
                <td className="px-4 py-2">{donor.donation_type}</td>
                <td>{formatDateWithDash(donation.created_at)}</td>
                <td className="px-4 py-2">
                    {donor.items && donor.items?.length > 1 ? (
                        <button 
                            className="text-blue-600 underline hover:text-blue-800"
                            onClick={() => handleViewDonor(donor)}
                        >
                            View {donor.items.length} items
                        </button>
                    ) : (
                        donationDetails
                    )}
                </td>
            </>
        );
    };

    // const getLast6Months = () => {
    //     const now = new Date();
    //     return Array.from({ length: 6 }).map((_, i) => {
    //         const date = new Date(now.getFullYear(), now.getMonth()- (5 - i), 1);
    //         return date.toLocaleString("default", { month: "short", year: "numeric"});
    //     })
    // };
    
    // const monthLabels = getLast6Months();

    // const monthlyDonations = monthLabels.reduce((acc, month) => {
    //     acc[month] = 0;
    //     return acc;
    // }, {} as Record<string, number>);

    // donation.donorId_list.forEach(() => {
    //     const monthsAgo = Math.floor(Math.random() * 6);
    //     const donationDate = new Date();
    //     donationDate.setMonth(donationDate.getMonth() - monthsAgo);
        
    //     const monthKey = donationDate.toLocaleString("default", { 
    //         month: "short", 
    //         year: "numeric" 
    //     });
        
    //     if (monthlyDonations[monthKey] !== undefined) {
    //         monthlyDonations[monthKey]++;
    //     }
    // });

    // const chartData = {
    //     labels: monthLabels,
    //     datasets: [
    //         {
    //             label: "Donations",
    //             data: monthLabels.map((label) => monthlyDonations[label]),
    //             borderColor: "#094FA1",
    //             tension: 0.3,
    //             borderWidth: 2,
    //             textColor: "#094FA1",
    //         },
    //     ],
    // };

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ellipsisRef.current && !ellipsisRef.current.contains(event.target as Node)) {
                setIsEllipsisOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInitiativeEllipsis = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEllipsisOpen(!isEllipsisOpen);
    };

    const handleEditInitiative = () => {
            navigate('../admin/donations/form', {state: { 
                donationId: donation._id, 
                donationDetails: donation, 
                existingDonations: donation
            } 
        });
    };
    
    // frontend made, pls fix backend
    const handleCloseInitiative = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/donation/${donation._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'Completed', end_date: new Date().toISOString() }),
                credentials: 'include'
            });
            
            if (response.ok) {
                navigate('/admin/donations', { state: { refresh: true } });
            } else {
                console.error('Failed to close initiative');
            }
        } catch (error) {
            console.error('Error closing initiative:', error);
        } finally {
            setIsEllipsisOpen(false);
        }
    };
    
    // const handleArchiveInitiative = async () => {
    //     try {
    //         const response = await fetch(`${import.meta.env.VITE_API_URL}/donation/${donation._id}/archive`, {
    //             method: 'PATCH',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             credentials: 'include'
    //         });
            
    //         if (response.ok) {
    //             navigate('/admin/donations', { state: { refresh: true } });
    //         } else {
    //             console.error('Failed to archive initiative');
    //         }
    //     } catch (error) {
    //         console.error('Error archiving initiative:', error);
    //     }
    // };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (ellipsisRef.current && !ellipsisRef.current.contains(event.target as Node)) {
            setIsEllipsisOpen(false);
        }
        };

        if (isEllipsisOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEllipsisOpen]);

    return (
        <div className="flex w-[100vw]">
            <AdminNavbar />
            <div className="flex w-full justify-center items-center">
                {/* limit width to 1280px */}
                <div className="w-[80vw] max-w-[1280px] h-full bg-white p-10">
                    {/* donation title and header buttons */}
                    <div className="flex w-full justify-start gap-2 items-center mb-8 text-center">
                        <button 
                            onClick={() => navigate(-1)}
                            className="text-gray-500 hover:text-gray-700 p-2 text-Primary"
                        >
                            <ArrowLeft size={24} className="text-Primary"/>
                        </button>
                        <h1 className="text-4xl font-bold text-Primary">{donation.title}</h1>
                        <div className="relative flex grow justify-end" ref={ellipsisRef}>
                            <button 
                                onClick={() => {}}
                                className="text-gray-500 hover:text-gray-700 p-2 text-Primary"
                            >
                                <Ellipsis size={32} className="text-Primary" onClick={handleInitiativeEllipsis}/>
                            </button>
                            {isEllipsisOpen && (
                                <div className="absolute right-0 top-5 mt-4 w-48 bg-LightBlue rounded-2xl shadow-lg z-10 border border-gray-200">
                                    <div className="text-Primary">
                                        <button
                                            disabled={donation.status=='Active' || donation.status=='Ongoing'}
                                            onClick={() => {
                                                handleEditInitiative();
                                                setIsEllipsisOpen(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 text-sm rounded-2xl hover:bg-Primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            Edit Initiative
                                        </button>
                                        <button
                                            disabled={donation.status !=='Pending' && donation.status !=='Rejected'}
                                            onClick={() => {
                                                handleDonationCauseStatusChange("Approved");
                                                setIsEllipsisOpen(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 text-sm rounded-2xl hover:bg-Primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            Approve Initiative
                                        </button>
                                        <button
                                            disabled={donation.status !=='Pending' && donation.status !=='Approved'}
                                            onClick={() => {
                                                handleDonationCauseStatusChange("Rejected");
                                                setIsEllipsisOpen(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 text-sm rounded-2xl hover:bg-Primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            Reject Initiative
                                        </button>
                                        <button
                                            disabled={donation.status=='Active'}
                                            onClick={() => {
                                                handleDonationCauseStatusChange("Active");
                                                setIsEllipsisOpen(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 text-sm rounded-2xl hover:bg-Primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            Mark as Active
                                        </button>
                                        <button
                                            disabled={donation.status=='Completed'}
                                            onClick={() => {
                                                handleDonationCauseStatusChange("Completed");
                                                setIsEllipsisOpen(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 text-sm rounded-2xl hover:bg-Primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            Mark as Completed
                                        </button>
                                        <button
                                            disabled={donation.status=='Ongoing'}
                                            onClick={() => {
                                                handleDonationCauseStatusChange("Ongoing");
                                                setIsEllipsisOpen(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 text-sm rounded-2xl hover:bg-Primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            Mark as Ongoing
                                        </button>
                                        <button
                                            disabled={donation.status=='Flagged'}
                                            onClick={() => {
                                                handleDonationCauseStatusChange("Flagged");
                                                setIsEllipsisOpen(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 text-sm rounded-2xl hover:bg-Primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            Flag Initiative
                                        </button>
                                        <button
                                            disabled={donation.status=='Approved' || donation.status=='Rejected' || donation.status=='Archived'}
                                            onClick={() => {
                                                handleDonationCauseStatusChange("Cancelled");
                                                setIsEllipsisOpen(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 text-sm rounded-2xl hover:bg-Primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            Cancel Initiative
                                        </button>
                                        <button
                                            disabled={donation.status=='Approved' || donation.status=='Rejected' || donation.status=='Archived'}
                                            onClick={() => {
                                                // handleArchiveInitiative();
                                                handleDonationCauseStatusChange("Archived");
                                                setIsEllipsisOpen(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 text-sm rounded-2xl hover:bg-Primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            Archive Initiative
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full flex gap-5 mb-5">
                        {/* donation image */}
                        <div className="w-100 h-60 rounded-xl overflow-hidden bg-AdminLightBlue">
                            <img src={donation.donationImageURL} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex flex-col gap-5 text-Primary">
                            {/* donation description */}
                            <h4>{donation.description}</h4>
                            {/* donation information */}
                            <div className="flex flex-wrap gap-x-20 gap-y-5">
                                <DonationDetailLabel icon={<Box />} 
                                    label="Organized by" 
                                    value={donation.organizers && donation.organizers.length > 0 
                                    ? donation.organizers.map(org => org.name).join(', ') 
                                    : 'N/A'
                                } />
                                <DonationDetailLabel icon={<CalendarDays />} label="End date" value={formatToDate(donation.end_date?.toString() || new Date().toString())} />
                                <DonationDetailLabel icon={<MapPin />} label="Location" value={donation.location} />
                                <DonationDetailLabel icon={<HandCoins />} label="Type" value={
                                    (donation.allow_monetary && donation.allow_non_monetary) ? 'Monetary and In-Kind'
                                    : donation.allow_monetary ? 'Monetary'
                                    : 'In-Kind'
                                } />
                                <DonationDetailLabel icon={<CircleAlert />} label="Status" value={donation.status} />
                            </div>
                        </div>
                    </div>

                    {/* accumulated donations and graph */}
                    <div className="w-full flex flex-row justify-center gap-5 mb-5">
                        {/* Accumulated Donations */}
                        <StatisticsBox label="Accumulated Donations" className="flex-1/2 flex flex-col gap-4">
                            <DonationStatusBar type="Monetary" unit="₱" accumulatedAmount={donation.raised_funds} totalAmount={donation.target_funds ?? 1} />
                            <DonationStatusBar type="InKind" accumulatedAmount={currentInKindDonations} totalAmount={targetInKindDonations} />
                        </StatisticsBox>
                        {/* Donations Trend */}
                        <StatisticsBox label="Accumulated Donations" className="flex-1/2">
                            {/* <div className='flex flex-row mx-auto'>
                                <ChartsOverview chartData={chartData} />
                            </div> */}
                            <></>
                        </StatisticsBox>
                    </div>

                    <div className="mt-8">
                        <ListHeader
                            title="Donors List"
                            totalCount={totalDonors}
                            data={donors}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            disabled={totalDonors==0}
                        />
                        {donors.length > 0 ? (
                            <AdminTable 
                                tableHead={donorTableHead}
                                data={donors} // update with donors list during backend integration
                                type="donors"
                                onEdit={handleViewDonor}
                                canDelete={false}
                                onDelete={() => {}}
                                canView={false}
                                onView={handleViewDonor}
                                renderRow={renderDonorRow}
                                selectedItems={selectedItems}
                                setSelectedItems={setSelectedItems}
                                defaultSortColumn='created_at'
                            />
                        ) : (
                            <div className="text-center py-4 text-gray-500">
                                No donors yet for this donation drive
                            </div>
                        )}
                    </div>
                    <DonorModal id="donor-details-modal" modalContent={donorDetailsInModal} resetModalDetails={() => setDonorDetailsInModal(undefined)}/>
                </div>
            </div>
        </div>
    );
};

const StatusColors = new Map<string, string>([
    ['Pending', 'text-[#AB2B00]'],
    ['Approved', 'text-accent'],
    ['Rejected', 'text-Error'],
    ['Active', 'text-accent'],
    ['Completed', 'text-accent'],
    ['Cancelled', 'text-gray-500'],
    ['Ongoing', 'text-accent'],
    ['Archived', 'text-gray-500'],
    ['Flagged', 'text-Error'],
]);

interface DonationDetailLabelProps {
    icon: React.ReactNode;
    label: string;
    value: string | DonationStatusEnum;
}
/**
 * A label component for the details of a donation initiative.
 * @param {React.ReactNode} icon - an icon for the label
 * @param {string} label - label text
 * @param {string} value - value of the label
 * 
 * @example
 * <DonationDetailLabel icon={<Box />} label="Organized by" value={donation.organized_by} />
 */
const DonationDetailLabel: React.FC<DonationDetailLabelProps> = ({
    icon,
    label,
    value
}) => {
    // const statusColor = (value == 'Active')? 'text-[#308D0E]' : (value == 'Cancelled')? 'text-Error' : '';
    return (
        <div className="flex gap-2">
            <div>{icon}</div>
            <div className="flex flex-col">
                <h3 className="font-semibold">{label}</h3>
                <h3 className={`text-sm font-medium ${label==='Status'? StatusColors.get(value) : ''}`}>{value}</h3>
            </div>
        </div>
    );
}


interface DonationStatusBarProps {
    unit?: string;
    weekAmount?: number;
    accumulatedAmount: number;
    totalAmount: number; //44A820
    type: "InKind" | "Monetary";
}
/**
 * A label and status bar component for the progress of a donation initiative.
 * @param {string} unit - optional the value's unit
 * @param {string} weekAmount - total gained amount for the week
 * @param {string} accumulatedAmount - total accumulated amount
 * @param {string} totalAmount - total amount
 * @param {string} type - InKind or Monetary
 * 
 * @example
 * <DonationStatusBar unit="₱" weekAmount={9} accumulatedAmount={10000} totalAmount={20000} />
 * @example
 * <DonationStatusBar weekAmount={200} accumulatedAmount={20} totalAmount={50} />
 */
const DonationStatusBar: React.FC<DonationStatusBarProps> = ({
    unit,
    weekAmount,
    accumulatedAmount,
    totalAmount,
    type = "Monetary"
}) => {
    function convertToDecimal(value:number):string {
        return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    const progressPercentage = (accumulatedAmount / totalAmount) * 100;
    const displayedPercentage = progressPercentage > 100 ? 100 : progressPercentage;

    return (
        <div className="flex flex-col gap-1 items-center text-center">
            { weekAmount && <h5 className="text-[#44A820] text-sm">+ {unit}{type==="Monetary" ? convertToDecimal(weekAmount) : weekAmount} this week</h5>}
            <div className="flex flex-col mb-1">
                <h2 className="text-Primary text-3xl font-bold leading-none">{unit}{type==="Monetary" ? convertToDecimal(accumulatedAmount) : accumulatedAmount}</h2>
                <h5 className="text-Primary text-sm font-semibold">out of {unit}{type==="Monetary" ? convertToDecimal(totalAmount) : totalAmount}</h5>
            </div>
            <div className="relative w-full bg-AdminLightBlue rounded-full h-3">
                <div className="absolute top-0 left-0 bg-Secondary rounded-full h-3"
                    style={{ width: `${displayedPercentage}%` }} />
            </div>
        </div>
    );
}

export default AdminDonationDetailsPage;