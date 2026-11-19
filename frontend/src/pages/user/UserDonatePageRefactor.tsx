import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DonationCard } from '../../components/donations/DonationCard';
import UserNavbar from '../../components/UserNavbar';
import DesktopNavbar from '../../components/DesktopNavbar';
import DonationProps from '../../types/donation';
import PaginationButtons from '../../components/PaginationButtons';
import { DonationCardSkeleton } from '../../components/donations/DonationCardSkeleton';
import { Plus } from 'lucide-react';
import Button from '../../components/Button';
import FiltersSidebar from '../../components/FilterSidebar';
import { toast } from '../../pages/utils/ToastFxn';
import MobileFilterModalDonations from '../../components/donations/MobileFilterModalDonations';
import { BackAndFontAndProfileHeader } from "../../components/MobileHeaders";
import PrivilegedAction from '../utils/PrivilegedActionGuard';

/**
 * Main component for the user donation page displaying active donation drives
 * @component
 * @returns {JSX.Element} The donation drives listing page with filtering and pagination
 */
const UserDonatePageRefactor: React.FC = () => {
    // State management for filters and sorting
    const [keywords, setKeywords] = useState<string>('');
    const [tempKeywords, setTempKeywords] = useState<string>('');
    const [status, setStatus] = useState<string>('Active');
    const [sortBy, setSortBy] = useState<string>('Most Recent');
    
    // Donation type filter (single selection)
    const [donationType, setDonationType] = useState<string>('all');

    // State management for donation drives data
    const [donationDrives, setDonationDrives] = useState<DonationProps[]>([]);

    // State for loading and error handling
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    const location = useLocation();
    const navigate = useNavigate();

    // For search debounce
    const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);

    // Add useState for filter modal
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    // Add ref for modal
    const mobileFilterRef = React.useRef<HTMLDialogElement>(null);

    // Handle keyword search with debounce
    const handleKeywordChange = (value: string) => {
        // Update the temporary keywords immediately for responsive UI
        setTempKeywords(value);
        
        // Clear any existing timeout
        if (searchDebounce) {
            clearTimeout(searchDebounce);
        }
        
        // Set a new timeout to update the actual keywords after a delay
        const timeoutId = setTimeout(() => {
            setKeywords(value);
            // Reset to first page when search changes
            setCurrentPage(1);
        }, 500); // 500ms debounce
        
        setSearchDebounce(timeoutId);
    };

    /**
     * Apply filters function to be passed to the FiltersSidebar
     */
    const applyFilters = () => {
        // We don't need to update the filters here since they're already updated by the component
        // Just reset to first page and scroll to top
        setCurrentPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /*
      Fetches donation drives data from API with pagination and filters
     */
    useEffect(() => {
        // Create a controller to abort the fetch request if needed
        const controller = new AbortController();
        
        const fetchDonations = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const ITEMS_PER_PAGE = 9;
                const skip = (currentPage - 1) * ITEMS_PER_PAGE;

                const params = new URLSearchParams({
                    skip: skip.toString(),
                    limit: ITEMS_PER_PAGE.toString(),
                    keywords: keywords.trim(),
                    sortBy,
                    status,
                });

                // Add filters to params
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/donation/?${params.toString()}`,
                    { credentials: 'include', signal: controller.signal }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    toast({
                        title: "Error",
                        description: errorData.detail || 'Failed to fetch donations',
                        type: "error",
                        isLoading: false
                    });
                    //throw new Error(errorData.detail || 'Failed to fetch donations');
                }

                const data = await response.json();
                const processedDonations = data.donations.map((donation: DonationProps) => ({
                    ...donation,
                    end_date: donation.end_date ? new Date(donation.end_date) : new Date(),
                    created_at: new Date(donation.created_at),
                }));

                setDonationDrives(processedDonations);
                setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));

                // Show a toast if no donations are found
                if (processedDonations.length === 0) {
                    toast({
                        title: "No Donations",
                        description: "No active donation drives at the moment.",
                        type: "info",
                        isLoading: false
                    });
                }
            } catch (err) {
                // Only show toast if it's not an abort error
                if (!(err instanceof DOMException && err.name === 'AbortError')) {
                    toast({
                        title: "Error",
                        description: err instanceof Error ? err.message : 'Failed to fetch donations',
                        type: "error",
                        isLoading: false
                    });
                }
            } finally {
                setIsLoading(false);
            }
        };
    
        // Call the function here
        fetchDonations();
    
        // Then return the cleanup
        return () => {
            controller.abort();
        };
    }, [currentPage, keywords, sortBy, status]);

    // Clean up the debounce timer on unmount
    useEffect(() => {
        return () => {
            if (searchDebounce) {
                clearTimeout(searchDebounce);
            }
        };
    }, [searchDebounce]);

    /**
     * Handles donation drive card click to navigate to details page
     * @param {DonationProps} donation - The selected donation drive
     */
    const handleDonationClick = (donation: DonationProps) => {
        navigate(`/user/donate/${donation._id}`);
    }
    
    /**
     * Reset all filters to default values
     */
    const resetFilters = () => {
        // Reset actual filters
        setKeywords('');
        setTempKeywords(''); // Reset temporary keywords 
        setStatus('Active');
        setSortBy('Most Recent');
        setDonationType('all');
        
        // Reset to first page and refetch data
        setCurrentPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handler for closing modal
    const handleCloseMobileModal = () => {
        setIsFilterModalOpen(false);
    };
    // Handler for search in modal
    const handleMobileSearch = () => {
        setIsFilterModalOpen(false);
        // Optionally trigger filter logic here
    };
    // Handler for reset in modal
    const handleMobileReset = () => {
        resetFilters();
        setIsFilterModalOpen(false);
    };

    // Show/hide modal effect
    useEffect(() => {
        if (isFilterModalOpen && mobileFilterRef.current) {
            (mobileFilterRef.current as HTMLDialogElement).showModal();
        } else if (!isFilterModalOpen && mobileFilterRef.current) {
            (mobileFilterRef.current as HTMLDialogElement).close();
        }
    }, [isFilterModalOpen]);

    return (
        <div className='relative flex flex-col items-center min-h-screen'>
            {/* navbars */}
            <div className="lg:hidden">
                {/* <MobileHeader /> */}
                <UserNavbar activePage="Donate" />
            </div>
            <DesktopNavbar activePage="Donate" />
            <div className="lg:hidden w-full"> 
                <BackAndFontAndProfileHeader />
            </div>

            {/* Filter Modal for Mobile */}
            <MobileFilterModalDonations
                dialogRef={mobileFilterRef}
                keywords={tempKeywords}
                handleKeywordChange={(e) => handleKeywordChange(e.target.value)}
                donationType={donationType}
                setDonationType={setDonationType}
                sortBy={sortBy}
                setSortBy={setSortBy}
                status={status}
                setStatus={setStatus}
                handleCloseModal={handleCloseMobileModal}
                handleApply={() => { applyFilters(); setIsFilterModalOpen(false); }}
                handleReset={handleMobileReset}
            />

            <main className='p-4 sm:p-4 max-w-[1380px] w-full'>
                {/* PAGE HEADER */}
                <div className='flex flex-row w-full items-center justify-between mt-8 px-3 sm:px-0 mb-6'>
                    <h1 className="sm:ml-86 text-4xl font-bold text-[#094EA0]">Donation Drives</h1>
                    {/* Desktop Create Button */}
                    <PrivilegedAction>
                        <Button
                            className='py-3 px-5 sm:py-3 sm:px-6 !rounded-2xl w-max flex items-center gap-2 !mt-0 text-base font-medium hidden sm:flex'
                            variant='major'
                            onClick={() => navigate('/user/requests/donation-cause')}
                        >
                            <Plus strokeWidth={2} size={20} />
                            <span>Create Cause</span>
                        </Button>
                    </PrivilegedAction>
                    {/* Mobile Filter Button */}
                    <Button
                        className="sm:hidden !mt-0 w-min ml-auto text-sm px-3 py-2"
                        variant="major"
                        onClick={() => setIsFilterModalOpen(true)}
                    >
                        Search/Filter
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* FILTER SIDEBAR (hidden on mobile) */}
                    <div className="hidden sm:block">
                        <FiltersSidebar
                            keywords={tempKeywords}
                            setKeywords={handleKeywordChange}
                            donationType={donationType}
                            setDonationType={setDonationType}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            status={status}
                            setStatus={setStatus}
                            resetFilters={resetFilters}
                            onFiltersApply={applyFilters}
                        />
                    </div>
                    {/* VERTICAL DIVIDER */}
                    <div className="hidden md:block w-px bg-[#B9D5EB] h-auto self-stretch ml-4 mr-6"></div>
    
                    {/* DONATION DRIVES SECTION */}
                    <div className="flex-1">
                        {/* Show error if present */}
                        {error && (
                            <div className="text-red-500 mb-4 p-4 bg-red-50 rounded-lg">
                                {error}
                            </div>
                        )}
                        {/* DONATION GRID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {isLoading ? (
                                <>
                                    <DonationCardSkeleton />
                                    <div className="hidden sm:block">
                                        <DonationCardSkeleton />
                                    </div>
                                    <div className="hidden lg:block">
                                        <DonationCardSkeleton />
                                    </div>
                                </>
                            ) : donationDrives.length > 0 ? (
                                donationDrives.map((donation, index) => (
                                    <DonationCard
                                        key={donation._id}
                                        id={donation._id}
                                        title={donation.title || `Donation Drive ${index + 1}`}
                                        endDate={donation.end_date ? new Date(donation.end_date) : new Date()}
                                        raisedAmount={donation.raised_funds || 0}
                                        goalAmount={donation.target_funds || 10000}
                                        onClick={() => handleDonationClick(donation)}
                                        item_requirements={donation.item_requirements}
                                        imageURL={
                                            donation.imageURL || 
                                            donation.donationImageURL || 
                                            ''
                                        }
                                        requiresMoney={donation.allow_monetary}
                                    />
                                ))
                            ) : (
                                <div className="col-span-3 text-center py-12 text-[#094EA0]">
                                    <p className="text-xl font-regular">No active donation drives at the moment.</p>
                                </div>
                            )}
                        </div>
                        {/* PAGINATION CONTROLS */}
                        {totalPages > 1 && (
                            <div className='flex justify-center w-full my-4 text-[#094EA0]'>
                                <div className="gap-2 join">
                                    <PaginationButtons
                                        totalPages={totalPages}
                                        currentPage={currentPage}
                                        onPageChange={(page) => {
                                            setCurrentPage(page);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            {/* Floating Plus Button for Mobile */}
            <div className="fixed z-50 bottom-20 right-5 w-min sm:hidden">
                <PrivilegedAction>
                    <Button
                        onClick={() => navigate('/user/requests/donation-cause')}
                        variant="major"
                        className="!border-Primary w-auto px-3 !mt-0 !rounded-full h-15 flex items-center justify-center"
                        aria-label="Create Cause"
                    >
                        <Plus size={36} strokeWidth={2} />
                    </Button>
                </PrivilegedAction>
            </div>
        </div>
    );
};

export default UserDonatePageRefactor;