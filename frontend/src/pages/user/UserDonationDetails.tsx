import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import { X, Gift, HandHeart } from "lucide-react";
import DonationProps from "../../types/donation";
import ProgressIndicator from "../../components/donations/ProgressIndicator";
import placeholder from '../../assets/donation_mock.jpeg';
import UserNavbar from '../../components/UserNavbar';
import DesktopNavbar from '../../components/DesktopNavbar';
import ShareModal from '../../components/modals/ShareModal';
import MainDonationModal from '../../components/modals/MainDonationModal';
import { toast } from "../utils/ToastFxn";
import { BackAndFontAndProfileHeader } from "../../components/MobileHeaders";
import { FaArrowLeftLong } from "react-icons/fa6";
import PrivilegedAction from "../utils/PrivilegedActionGuard";

const UserDonationDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [selectedDonationDrive, setSelectedDonationDrive] = useState<DonationProps | null>(null);
    const [recentContributions, setRecentContributions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch logic as a function
    const fetchDonationDetails = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            setError(null);
            // fetch all donation then find the one with the matching ID
            const response = await fetch(`${import.meta.env.VITE_API_URL}/donation/`, {
                credentials: "include"
            });
            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to fetch donations');
                return;
            }
            const data = await response.json();
            // Find the donation with matching ID
            const donation = data.donations.find((d: DonationProps) => d._id === id);
            if (!donation) {
                setError("Donation not found");
                return;
            }
            setSelectedDonationDrive(donation);
            // Fetch recent contributions
            const res = await fetch(`${import.meta.env.VITE_API_URL}/donation/${id}/recent-donations`, {
                credentials: "include"
            });
            if (res.ok) {
                const contributionsData = await res.json();
                // Get unique userIds
                const userIds = [...new Set(contributionsData.map((entry: any) => entry.userId))];
                if (userIds.length > 0) {
                    // Fetch user info in bulk endpoint
                    const usersRes = await fetch(`${import.meta.env.VITE_API_URL}/profile/bulk`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({ user_ids: userIds })
                    });
                    if (usersRes.ok) {
                        const users = await usersRes.json();
                        const userMap = new Map(users.map((user: any) => [user._id, `${user.first_name} ${user.last_name}`.trim() || "Anonymous"]));
                        // Map with user names
                        const mapped = contributionsData.map((entry: any) => ({
                            name: userMap.get(entry.userId) || entry.userId.slice(-6),
                            amount: entry.amount,
                            items: entry.items,
                            donation_type: entry.donation_type
                        }));
                        setRecentContributions(mapped);
                    } else {
                        setRecentContributions([]);
                    }
                } else {
                    setRecentContributions([]);
                }
            } else {
                setRecentContributions([]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch donation details");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDonationDetails();
    }, [fetchDonationDetails]);

    const handleDonate = (donationId: string, donationType = 'general') => {
        const modalId = `main_donation_modal_${donationId}`;
        const modal = document.getElementById(modalId) as HTMLDialogElement;
        
        // Set active donation type in localStorage before showing modal
        if (donationType === 'inkind') {
            window.localStorage.setItem('activeDonationType', 'inkind');
            console.log("Set donation type to inkind");
        } else {
            window.localStorage.setItem('activeDonationType', 'monetary');
            console.log("Set donation type to monetary");
        }
        
        console.log("Modal element:", modal);
        modal?.showModal();
    };
    
    const handleBack = () => {
        navigate('/user/donate');
    };

    const handleShare = () => {
        (document.getElementById('share_modal') as HTMLDialogElement)?.showModal();
    };

    if (loading) {
        return (
            <div className='relative flex flex-col items-center min-h-screen'>
                {/* RESPONSIVE NAVIGATION BARS */}
                <div className="lg:hidden">
                {/* <MobileHeader /> */}
                <UserNavbar activePage="Events" />
                </div>
                <DesktopNavbar activePage="Donate" />
                <div className="lg:hidden w-full"> 
                    <BackAndFontAndProfileHeader />
                </div>
                
                <main className='p-4 sm:p-4 max-w-[1380px] w-full'>
                    <div className="animate-pulse">
                        <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-64 bg-gray-200 rounded mb-4"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                    </div>
                </main>
            </div>
        );
    }


    if (error || !selectedDonationDrive) {
        return (
            <div className='relative flex flex-col items-center min-h-screen'>
                {/* RESPONSIVE NAVIGATION BARS */}
                <div className="lg:hidden">
                {/* <MobileHeader /> */}
                <UserNavbar activePage="Events" />
                </div>
                <DesktopNavbar activePage="Donate" />
                <div className="lg:hidden w-full"> 
                    <BackAndFontAndProfileHeader />
                </div>
                
                <main className='p-4 sm:p-4 max-w-[1380px] w-full'>
                    <div className="text-center py-12">
                        <h2 className="text-xl font-semibold text-red-600 mb-4">
                            {error || "Donation details not found"}
                        </h2>
                        <Button variant="major" onClick={handleBack}>
                            Go back to donation list
                        </Button>

                    </div>
                </main>
            </div>
        );
    }

    // calculate progress
    const monetaryProgress = selectedDonationDrive.allow_monetary ? 
        (selectedDonationDrive.raised_funds / selectedDonationDrive.target_funds!) * 50 : 0;
    const inKindProgress = selectedDonationDrive.item_requirements?.reduce((acc, item) => {
        return acc + (item.current_quantity / item.target_quantity) * 50;
    }, 0) || 0;
    const totalProgress = monetaryProgress + inKindProgress;
    const totalProgressPercentage = Number(((totalProgress / 100) * 100).toFixed(0));

    return (
        <div className='relative flex flex-col items-center min-h-screen'>
            {/* RESPONSIVE NAVIGATION BARS */}
            <div className="lg:hidden">
                {/* <MobileHeader /> */}
                <UserNavbar activePage="Donate" />
            </div>
            <DesktopNavbar activePage="Donate" />
            <div className="lg:hidden w-full"> 
                <BackAndFontAndProfileHeader />
            </div>

            <main className='p-4 sm:p-4 max-w-[1380px] w-full'>            
                <div className="flex flex-col items-center justify-center"> 
                    <div className='w-full max-w-[1080px]'>
                        {/* Desktop: Back button and Donation Title */}
                        <div className="flex-row items-center hidden mb-8 lg:flex mt-30 mx-4">
                            <button onClick={handleBack} aria-label="Go back">
                                <FaArrowLeftLong
                                className="text-primary font-xl"
                                size={30}
                                strokeWidth={3}
                                />
                            </button>
                            <h1 className="ml-5 text-4xl text-primary font-bold">{selectedDonationDrive.title}</h1>
                        </div>
                        {/* <div className='mb-6 text-4xl font-bold text-primary xl:text-5xl'>{selectedDonationDrive.title}</div> */}
                        <div className='flex flex-col gap-6 sm:flex-row'>
                            <div className='flex flex-col gap-4 flex-2/3'>
                                <img 
                                    src={selectedDonationDrive.imageURL || selectedDonationDrive.donationImageURL || placeholder} 
                                    alt="donation photo" 
                                    className='rounded-xl' 
                                />
                                <ProgressIndicator handleDonate={() => handleDonate(selectedDonationDrive._id)} percentage={totalProgressPercentage} status='funding' />

                                {/* Mobile: Donation Title below progress bar */}
                                <h1 className="block lg:hidden mb-2 text-3xl font-bold text-primary text-left mx-2">
                                  {selectedDonationDrive.title}
                                </h1>
                                <div>
                                    <h2 className='text-base sm:text-xl text-primary mx-2'>
                                        Organized by: <span className="font-semibold ">Institute of Computer Science </span>
                                    </h2>
                                    <p className='text-sm text-Label mx-2'>
                                        End Date: {selectedDonationDrive.end_date ? new Date(selectedDonationDrive.end_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : "No end date available"}
                                    </p>
                                </div>
                                <div className='text-primary'>
                                    <h3 className='text-xl font-semibold mx-2'>About the Donation Drive</h3>
                                    <p className="mx-2">{selectedDonationDrive.description}</p>
                                </div>
                            </div>
                            <div className='flex flex-col gap-4 flex-1/3'>
                                <div className='flex flex-col gap-2 p-6 py-8 bg-gradient-to-b from-[#FAFAFA] to-[#E7EFF6] border-[#C6D8EB] rounded-2xl shadow-md'>
                                    {/* MONETARY PROGRESS */}
                                    {selectedDonationDrive.allow_monetary &&
                                        <div>
                                            <div className="flex flex-col gap-2">
                                                <div className="line-clamp-1">
                                                    <span className="text-2xl font-black text-primary">
                                                        Php {selectedDonationDrive.raised_funds.toLocaleString()}
                                                    </span>
                                                    <span className="ml-1 text-xs text-primary">
                                                        {" "}raised of Php {selectedDonationDrive.target_funds!.toLocaleString()}
                                                    </span>
                                                </div>
                                                {/* Progress bar */}
                                                <progress 
                                                    className="w-full h-4 rounded-full progress progress-primary" 
                                                    value={selectedDonationDrive.raised_funds} 
                                                    max={selectedDonationDrive.target_funds}
                                                ></progress>
                                            </div>
                                        </div>
                                    }
                                    {selectedDonationDrive.allow_monetary && <div className="py-3">
                                        <div className='w-full h-[1.5px] rounded-full bg-gray-300' />
                                    </div>}
                                    {
                                        <div className="flex flex-col gap-2">
                                            {/* INKIND PROGRESS */}
                                            <div className="flex items-center gap-2 text-2xl line-clamp-1">
                                                <span className="font-black text-primary">In-Kind Donations</span>
                                                <HandHeart size={25} className="text-primary" />
                                            </div>
                                            <div className="flex flex-col gap-4">
                                                {selectedDonationDrive.item_requirements?.map((item, index) => (
                                                    <div key={index} className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-2 line-clamp-1">
                                                            <span className="text-lg font-semibold text-primary">
                                                                {item.item_name}
                                                            </span>
                                                            <span className="ml-1 text-sm text-primary">
                                                                {" "}{item.current_quantity} of {item.target_quantity} collected
                                                            </span>
                                                        </div>
                                                        {/* Progress bar */}
                                                        <progress 
                                                            className="w-full h-4 rounded-full progress progress-secondary" 
                                                            value={item.current_quantity} 
                                                            max={item.target_quantity}
                                                        ></progress>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    }
                                    <div className="py-3">
                                        <div className='w-full h-[1.5px] rounded-full bg-gray-300' />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        {/* DONATE BUTTON */}
                                        <PrivilegedAction>
                                            <Button variant='major' className='!mt-0'
                                                onClick={() => handleDonate(selectedDonationDrive._id)}
                                            >Donate</Button>
                                        </PrivilegedAction>
                                        

                                        {/* SHARE BUTTON */}
                                        <Button 
                                            variant="minor" 
                                            className='!mt-0 border-2 !border-DarkerPrimary !text-DarkerPrimary !bg-transparent' 
                                            onClick={handleShare}
                                        >
                                            Share
                                        </Button>
                                    </div>
                                    <div className="py-3">
                                        <div className='w-full h-[1.5px] rounded-full bg-gray-300' />
                                    </div>
                                    {/* RECENT CONTRIBUTIONS */}
                                    <div className="mt-2">
                                        <div className="mb-2 text-sm font-semibold underline text-primary">Recent Contributions</div>
                                        <div className="flex flex-col gap-1">
                                            {recentContributions && recentContributions.length > 0 ? (
                                                // Actual contributions
                                                recentContributions.slice(0, 3).map((contribution, index) => (
                                                    <div key={index} className="flex items-center gap-2 pl-2 text-sm text-gray-700">
                                                        <Gift size={16} className="text-primary w-max" />
                                                        <span className="line-clamp-1 max-w-11/12">
                                                            <strong>{contribution.name}</strong> donated{" "}
                                                            {contribution.amount !== undefined && contribution.amount !== null
                                                                ? `₱${contribution.amount.toLocaleString()}`
                                                                : contribution.items && contribution.items.length > 0
                                                                    ? contribution.items.map((item: any, idx: number) =>
                                                                        `${item.quantity}× ${item.name}${idx < (contribution.items ?? []).length - 1 ? ', ' : ''}`
                                                                    ).join('')
                                                                    : 'non-monetary goods'}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                // No contributions yet
                                                <div className="text-sm text-center text-gray-500">
                                                    Nothing to see here yet. <br />
                                                    Be the first one to donate!
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DONATION MODALS */}
                {selectedDonationDrive && <MainDonationModal donation={selectedDonationDrive} onSuccess={fetchDonationDetails} />}

                {/* SHARE MODAL */}
                {selectedDonationDrive && <ShareModal donationTitle={selectedDonationDrive.title}/>}
            </main>
        </div>
    );
};

export default UserDonationDetails;