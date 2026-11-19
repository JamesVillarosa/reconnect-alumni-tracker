import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DonationCard } from "../../components/donations/DonationCard";
import UserNavbar from "../../components/UserNavbar";
import DesktopNavbar from "../../components/DesktopNavbar";
import { SampleDonations } from "../../types/donation";
import DonationProps from "../../types/donation";
import UserDonateDetails from "./UserDonateDetails";
import PaginationButtons from "../../components/PaginationButtons";
import MainDonationModal from "../../components/modals/MainDonationModal";
import DonationPageHeader from "../../components/donations/DonationPageHeader";
import { DonationCardSkeleton } from "../../components/donations/DonationCardSkeleton";
import ShareModal from "../../components/modals/ShareModal";
import FloatingActionButton from "../../components/FloatingActionButton";
import PrivilegedAction from "../utils/PrivilegedActionGuard";

/**
 * Main component for the user donation page displaying active donation drives
 * @component
 * @returns {JSX.Element} The donation drives listing page with filtering and pagination
 */
const UserDonatePage: React.FC = () => {
  // State management for filters and sorting
  const [keywords, setKeywords] = React.useState<string>("");
  const [status, setStatus] = React.useState<string>("Active");
  const [sortBy, setSortBy] = React.useState<string>("Most Recent");

  // added temp variables
  const [tempKeywords, setTempKeywords] = React.useState<string>("");
  const [tempSortBy, setTempSortBy] = React.useState<string>(sortBy);
  const [tempStatus, setTempStatus] = React.useState<string>(status);

  // State management for donation drives data
  const [selectedDonationDrive, setSelectedDonationDrive] =
    React.useState<DonationProps>(SampleDonations[0]);
  const [donationDrives, setDonationDrives] = React.useState<DonationProps[]>(
    []
  );

  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  // @TODO: what to use this error state for?
  const [, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);

  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Fetches donation drives data from API with pagination
   * @effect
   * UPDATED WITH FILTER
   */
  // Fetch donations
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setIsLoading(true);
        const ITEMS_PER_PAGE = 9;
        const skip = (currentPage - 1) * ITEMS_PER_PAGE;

        const params = new URLSearchParams({
          skip: skip.toString(),
          limit: ITEMS_PER_PAGE.toString(),
          keywords: keywords.trim(),
          sortBy,
          status,
        });

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/donation/?${params.toString()}`,
          { credentials: "include" }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to fetch donations");
        }

        const data = await response.json();
        const processedDonations = data.donations.map(
          (donation: DonationProps) => ({
            ...donation,
            end_date: donation.end_date
              ? new Date(donation.end_date)
              : new Date(),
            created_at: new Date(donation.created_at),
          })
        );

        setDonationDrives(processedDonations);
        setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch donations"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonations();
  }, [currentPage, keywords, sortBy, status, location.key]);

  // Open modal if "id" query param is present
  let checkedPreload = false;
  useEffect(() => {
    if (!isLoading && donationDrives.length > 0 && !checkedPreload) {
      const searchParams = new URLSearchParams(location.search);
      const donationId = searchParams.get("id");
      if (donationId) {
        const found = donationDrives.find(
          (donation) => donation._id === donationId
        );
        if (found) {
          setSelectedDonationDrive(found);
          const modal = document.getElementById(
            "donation_details"
          ) as HTMLDialogElement;
          modal?.showModal();
        }
      }
    }
    checkedPreload = true;
  }, [isLoading, donationDrives, location.search]);

  /**
   * Handles donation drive card click to show details modal
   * @param {DonationProps} donation - The selected donation drive
   */
  const handleDonationClick = (donation: DonationProps) => {
    setSelectedDonationDrive(donation);
    const modal = document.getElementById(
      "donation_details"
    ) as HTMLDialogElement;
    modal.showModal();

    // set the url to the donation id as a query parameter but do not reload the page
    const url = new URL(window.location.href);
    url.searchParams.set("id", donation._id);
    window.history.pushState({}, "", url.toString());
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen">
      {/* RESPONSIVE NAVIGATION BARS */}
      {/* mobile */}
      <div className="sm:hidden">
        <UserNavbar activePage="Donate" />
      </div>
      {/* desktop */}
      <DesktopNavbar activePage="Donate" />

      <main className="p-4 sm:p-8 max-w-[1080px] w-full">
        {/* PAGE HEADER WITH CONTROLS */}
        <PrivilegedAction actionProp="onCreateCause">
          <DonationPageHeader
            keywords={tempKeywords}
            setKeywords={setTempKeywords} // Update tempKeywords while typing
            sortBy={tempSortBy}
            setSortBy={setTempSortBy}
            status={tempStatus}
            setStatus={setTempStatus}
            onFiltersApply={() => {
              // set the real filter options here once user clicks apply
              setKeywords(tempKeywords);
              setSortBy(tempSortBy);
              setStatus(tempStatus);
              setCurrentPage(1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onCreateCause={() => {
              navigate("/user/requests/donation-cause");
            }}
          />
        </PrivilegedAction>

        {/* DONATION DRIVES GRID */}
        <div className="grid grid-cols-1 gap-6 py-4 sm:grid-cols-2 xl:grid-cols-3">
          {/* loads skeletons as placeholder */}
          {isLoading ? (
            <>
              <DonationCardSkeleton />
              <DonationCardSkeleton />
              <DonationCardSkeleton />
              <DonationCardSkeleton />
              <DonationCardSkeleton />
              <DonationCardSkeleton />
            </>
          ) : (
            donationDrives.map((donation, index) => (
              <DonationCard
                key={donation._id}
                id={donation._id}
                title={donation.title || `Donation Drive ${index + 1}`}
                endDate={
                  donation.end_date ? new Date(donation.end_date) : new Date()
                }
                raisedAmount={donation.raised_funds || 0}
                goalAmount={donation.target_funds || 10000}
                onClick={() => handleDonationClick(donation)}
                item_requirements={donation.item_requirements}
                imageURL={donation.imageURL || donation.donationImageURL || ""}
                requiresMoney={donation.allow_monetary}
              />
            ))
          )}
        </div>

        {/* Floating Action Button to Create a Cause */}
        <PrivilegedAction actionProp="action">
          <FloatingActionButton
            icon="plus"
            text="Create Cause"
            action={() => {
              navigate("/user/requests/donation-cause");
            }}
          />
        </PrivilegedAction>

        {/* PAGINATION CONTROLS */}
        {/* this only shows when there is more than 1 page */}
        {totalPages > 1 && (
          <div className="flex justify-center w-full my-4 text-primary">
            <div className="gap-2 join">
              <PaginationButtons
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          </div>
        )}

        {/* DONATION DETAILS MODAL */}
        <dialog id="donation_details" className="modal">
          <div className="modal-box px-8 !min-w-screen !min-h-screen">
            <UserDonateDetails selectedDonationDrive={selectedDonationDrive} />
          </div>
        </dialog>

        {/* DONATION MODALS */}
        <MainDonationModal donation={selectedDonationDrive} />

        {/* SHARE MODAL */}
        <ShareModal donationTitle={selectedDonationDrive.title} />
      </main>
    </div>
  );
};

export default UserDonatePage;
