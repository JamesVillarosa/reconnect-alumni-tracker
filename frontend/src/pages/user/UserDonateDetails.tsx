import Button from "../../components/Button";
import { X, Gift, HandHeart } from "lucide-react";
import DonationProps from "../../types/donation";
import ProgressIndicator from "../../components/donations/ProgressIndicator";
import React, { useEffect } from "react";
import placeholder from '../../assets/donation_mock.jpeg';


function UserDonateDetails({ selectedDonationDrive }: { selectedDonationDrive: DonationProps }) {
    const [recentContributions, setRecentContributions] = React.useState<{
        name: string;
        amount?: number;
        items?: { quantity: number; name: string }[];
        donation_type?: string;
    }[]>([]);


    const handleDonate = (donationId: string) => {
        const modalId = `main_donation_modal_${donationId}`;
        const modal = document.getElementById(modalId) as HTMLDialogElement;
        modal?.showModal();
    };

    const [loading, setLoading] = React.useState(true);

    // NOW INTEGRATED WITH BACKEND
    useEffect(() => {
        const fetchRecentContributions = async () => {
            setLoading(true);
            try {
                // Get recent donations
                const res = await fetch(`${import.meta.env.VITE_API_URL}/donation/${selectedDonationDrive._id}/recent-donations`, {
                    credentials: "include"
                });
                const data = await res.json();

                // Get unique userIds
                const userIds = [...new Set(data.map((entry: any) => entry.userId))];

                // Fetch user info in bulk endpoint
                const usersRes = await fetch(`${import.meta.env.VITE_API_URL}/profile/bulk`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ user_ids: userIds })
                });

                const users = await usersRes.json();
                console.log("FROM BULK", users);

                const userMap = new Map(users.map((user: any) => [user._id, `${user.first_name} ${user.last_name}`.trim() || "Anonymous"]));


                // Map with user names
                const mapped = data.map((entry: any) => ({
                    name: userMap.get(entry.userId) || entry.userId.slice(-6), // fallback
                    amount: entry.amount,
                    items: entry.items,
                    donation_type: entry.donation_type
                }));

                console.log("MAPPED: ", mapped);


                setRecentContributions(mapped);

            } catch (err) {
                console.error("Error fetching recent contributions:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentContributions();
    }, [selectedDonationDrive._id]);

    // calculate progress half from monetary and half from in-kind
    const monetaryProgress = selectedDonationDrive.allow_monetary ? (selectedDonationDrive.raised_funds / selectedDonationDrive.target_funds!) * 50 : 0;
    const inKindProgress = selectedDonationDrive.item_requirements?.reduce((acc, item) => {
        return acc + (item.current_quantity / item.target_quantity) * 50;
    }, 0) || 0;
    const totalProgress = monetaryProgress + inKindProgress;
    const totalProgressPercentage = Number(((totalProgress / 100) * 100).toFixed(0));


    return (
        <div className="flex flex-col items-center justify-center">
            <form method="dialog" className="flex justify-end w-full ">
                {/* back button */}
                <button className="py-4 mr-4 cursor-pointer"
                    onClick={() => {
                        // remove all parameters from the URL
                        const url = new URL(window.location.href);
                        url.searchParams.delete('id');
                        window.history.pushState({}, '', url.toString());
                    }}
                >
                    <X size={35} className="text-Primary hover:drop-shadow-lg" />
                </button>
            </form>
            <div className='w-full max-w-[1080px]'>


                <div className='mb-6 text-4xl font-bold text-primary xl:text-5xl'>{selectedDonationDrive.title}</div>
                <div className='flex flex-col gap-6 sm:flex-row'>
                    <div className='flex flex-col gap-4 flex-2/3'>
                        <img src={selectedDonationDrive.imageURL || selectedDonationDrive.donationImageURL || placeholder} alt="donation photo" className='rounded-xl' />
                        <ProgressIndicator handleDonate={() => handleDonate(selectedDonationDrive._id)} percentage={totalProgressPercentage} status={selectedDonationDrive.status} />
                        <div>
                            <h2 className='text-base sm:text-xl text-primary'>Organized by: <span className="font-semibold ">Institute of Computer Science </span></h2>
                            <p className='text-sm text-Label'>
                                End Date: {selectedDonationDrive.end_date ? new Date(selectedDonationDrive.end_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : "No end date available"}
                            </p>


                        </div>
                        <div className='text-primary'>
                            <h3 className='text-xl font-semibold'>About the Donation Drive</h3>
                            <p>{selectedDonationDrive.description}</p>

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
                                        <progress className="w-full h-4 rounded-full progress progress-primary" value={selectedDonationDrive.raised_funds} max={selectedDonationDrive.target_funds}></progress>
                                    </div>
                                </div>}
                            {selectedDonationDrive.allow_monetary && <div className="py-3">
                                <div className='w-full h-[1.5px] rounded-full bg-gray-300' />
                            </div>}
                            {selectedDonationDrive.allow_non_monetary &&
                                <div className="flex flex-col gap-2">
                                    {/* INKIND PROGRESS */}
                                    <div className="flex items-center gap-2 text-2xl line-clamp-1">
                                        <span className="font-black text-primary">In-Kind Donations</span>
                                        <HandHeart size={25} className="text-primary" />
                                    </div>
                                    {/* item_requirements:{item_name; target_quantity; current_quantity} */}

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
                                                <progress className="w-full h-4 rounded-full progress progress-secondary" value={item.current_quantity} max={item.target_quantity}></progress>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            }
                            {selectedDonationDrive.allow_non_monetary && <div className="py-3">
                                <div className='w-full h-[1.5px] rounded-full bg-gray-300' />
                            </div>}

                            <div className="flex flex-col gap-2">
                                {/* DONATE BUTTON */}
                                <Button variant='major' className='!mt-0'
                                    onClick={() => handleDonate(selectedDonationDrive._id)}
                                >Donate</Button>

                                {/* SHARE BUTTON */}
                                <Button variant="minor" className='!mt-0 border-2 !border-DarkerPrimary !text-DarkerPrimary !bg-transparent' onClick={() => { (document.getElementById('share_modal') as HTMLDialogElement)?.showModal() }}>
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
                                    {loading ? (
                                        // Skeleton UI while loading
                                        Array.from({ length: 2 }).map((_, index) => (
                                            <div key={index} className="flex items-center h-5 gap-2 ml-2 text-sm">
                                                <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse" />
                                                <div className="h-4 bg-gray-300 rounded-md w-52 animate-pulse" />
                                            </div>
                                        ))
                                    ) : recentContributions && recentContributions.length > 0 ? (
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
                        {/* INKIND PROGRESS */}
                    </div>
                </div>
            </div>

        </div>

    );
}

export default UserDonateDetails;
