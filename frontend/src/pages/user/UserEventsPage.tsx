import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import EventCardGeneric from "../../components/EventCardGeneric";
import UserNavbar from "../../components/UserNavbar";
import DesktopNavbar from "../../components/DesktopNavbar";
import { IoIosSearch } from "react-icons/io";
import Button from "../../components/Button";
import { BackAndFontAndProfileHeader } from "../../components/MobileHeaders";
import axios from "axios";
// import { useAuthContext } from "../../hooks/useAuthContext";
import PaginationButtons from "../../components/PaginationButtons";
import MobileFilterModal from "../../components/events/MobileFilterModal";
import DesktopFilterBar from "../../components/events/DesktopFilterBar";
import { EventProps } from "../../types/event";
import FloatingActionButton from "../../components/FloatingActionButton";
import { CardSkeleton } from "../../components/Skeleton";
import PrivilegedAction from "../utils/PrivilegedActionGuard";
/**
 * @component UserEventspage
 * @description The main page for users to browse and filter events. It displays a list of events and provides search and filtering options.
 * Includes navigation bars for both desktop and mobile views.
 * @returns {JSX.Element} The rendered user events page component.
 */
const UserEventspage: React.FC = () => {
  // ==========================================================================
  // Hooks
  // ==========================================================================
  const navigate = useNavigate();
  // const { user } = useAuthContext();

  // ==========================================================================
  // State
  // ==========================================================================

  // --- Core Data State ---
  const [events, setEvents] = useState<EventProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // --- Search State ---
  const [searchValue, setSearchValue] = useState<string>("");

  // --- Simple Filter State (Popular/Soon) ---
  const [isPopularActive, setIsPopularActive] = useState(false);
  const [isSoonActive, setIsSoonActive] = useState(false);

  // --- Location Filter State ---
  const [isLocationActive, setIsLocationActive] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  // --- Date Range Filter State ---
  const [isDateActive, setIsDateActive] = useState(false);
  const [isDesktopDateDropdownOpen, setIsDesktopDateDropdownOpen] =
    useState(false);
  const [startMonth, setStartMonth] = useState("January");
  const [startYear, setStartYear] = useState(() =>
    new Date().getFullYear().toString()
  );
  const [endMonth, setEndMonth] = useState("January");
  const [endYear, setEndYear] = useState(() =>
    new Date().getFullYear().toString()
  );

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState<number>(1);

  // ==========================================================================
  // Refs
  // ==========================================================================
  const locationRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const mobileFilterRef = useRef<HTMLDialogElement>(null);

  // ==========================================================================
  // Constants
  // ==========================================================================
  const EVENTS_PER_PAGE = 10;
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const years = Array.from({ length: 10 }, (_, i) => (2024 + i).toString()); // Start from current year for example

  // ==========================================================================
  // Data Fetching
  // ==========================================================================

  /**
   * @function fetchEvents
   * @description Fetches the list of all events from the API endpoint. Updates the `events` state on success or sets it to an empty array on error.
   * Sets the `loading` state accordingly.
   * @async
   */
  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/events`,
        {
          withCredentials: true,
        }
      );
      const eventIds = response.data.map((event: EventProps) => event._id);
      console.log("All Event IDs:", eventIds);
      setEvents(response.data);
    } catch (error: unknown) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * @effect Initial Data Fetch
   * @description Fetches the initial list of events when the component mounts.
   * @deps none - Runs only once on mount.
   */
  useEffect(() => {
    fetchEvents();
  }, []);

  // ==========================================================================
  // Filtering Logic & Derived Data
  // ==========================================================================

  /**
   * @function getFilteredEvents
   * @description Filters and sorts the `sampleEvents` based on the current filter states
   * (search value, location, date range, popular, happening soon).
   * @returns {EventProps[]} The filtered and sorted list of events.
   */
  const getFilteredEvents = () => {
    // Initial filtering based on location and date range
    const filteredByOtherConditions = events.filter((event) => {
      const eventDate = new Date(event.event_date);

      // Check if location matches (case-insensitive) if a location is selected
      const matchesLocation = selectedLocation
        ? event.location.toLowerCase().includes(selectedLocation.toLowerCase())
        : true;

      // Check if event date falls within the selected date range if the date filter is active
      const matchesDate = isDateActive
        ? eventDate >= new Date(`${startMonth} 1, ${startYear}`) &&
          eventDate <= new Date(`${endMonth} 31, ${endYear}`)
        : true;

      return matchesLocation && matchesDate;
    });

    // Create a mutable copy for sorting
    const sortedEvents = [...filteredByOtherConditions];

    // Apply sorting based on 'Popular' filter
    if (isPopularActive) {
      // Sort by RSVP count in descending order (most popular first)
      sortedEvents.sort((a, b) => b.rsvp_count - a.rsvp_count);
    }

    // Apply sorting based on 'Happening Soon' filter
    if (isSoonActive) {
      // Sort by event date in ascending order (soonest first)
      sortedEvents.sort(
        (a, b) =>
          new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      );
    }

    // Final filtering based on the search input value
    const lowerSearch = searchValue.toLowerCase();
    const filteredBySearch = sortedEvents.filter((event) => {
      // Check if search value matches title, description, or location (case-insensitive)
      return (
        event.title.toLowerCase().includes(lowerSearch) ||
        event.description.toLowerCase().includes(lowerSearch) ||
        event.location.toLowerCase().includes(lowerSearch)
      );
    });

    return filteredBySearch;
  };

  // Calculate derived data based on filtered results *after* filtering logic
  const filteredEvents = getFilteredEvents();

  // ==========================================================================
  // Event Handlers & Helper Functions
  // ==========================================================================

  // --- Search Input Handler ---
  /**
   * @function handleChange
   * @description Handles changes in the main search input field. Updates the `searchValue` state. Resets pagination to page 1 when search changes.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event.
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    setCurrentPage(1); // Reset to page 1 on search change
  };

  // --- Simple Filter Handlers (Popular/Soon) ---
  /**
   * @function handlePopularFilter
   * @description Toggles the 'Popular' filter. Deactivates 'Soon' filter if 'Popular' is activated. Resets pagination to page 1.
   */
  const handlePopularFilter = () => {
    setIsPopularActive((prev) => {
      const newState = !prev;
      if (newState) setIsSoonActive(false); // Ensure mutual exclusivity
      return newState;
    });
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  /**
   * @function handleSoonFilter
   * @description Toggles the 'Happening Soon' filter. Deactivates 'Popular' filter if 'Soon' is activated. Resets pagination to page 1.
   */
  const handleSoonFilter = () => {
    setIsSoonActive((prev) => {
      const newState = !prev;
      if (newState) setIsPopularActive(false); // Ensure mutual exclusivity
      return newState;
    });
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  // --- Location Filter Handlers ---
  /**
   * @function handleLocationFilter
   * @description Opens the desktop location filter dropdown.
   */
  const handleLocationFilter = () => {
    setIsLocationActive(true);
  };

  /**
   * @function handleLocationInputChange
   * @description Handles changes in the location filter input field. Updates `locationInput`.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleLocationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLocationInput(e.target.value);
  };

  /**
   * @function handleLocationKeyPress
   * @description Handles Enter key press in the location filter input. Sets `selectedLocation`, closes the dropdown, and resets pagination.
   * @param {React.KeyboardEvent<HTMLInputElement>} e - The keyboard event.
   */
  const handleLocationKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSelectedLocation(locationInput); // Apply filter
      setIsLocationActive(false); // Close dropdown
      setCurrentPage(1); // Reset to page 1
    }
  };

  // --- Date Filter Handlers ---
  /**
   * @function toggleDesktopDateDropdown
   * @description Toggles the visibility of the *desktop* date range dropdown UI.
   */
  const toggleDesktopDateDropdown = () => {
    setIsDesktopDateDropdownOpen((prev) => !prev);
  };

  /**
   * @function activateDateFilter
   * @description Explicitly sets the date filter as active. Called when date values change via selects. Resets pagination to page 1.
   */
  const activateDateFilter = () => {
    setIsDateActive(true);
    setCurrentPage(1); // Reset to page 1 when date filter is applied/changed
  };

  // --- Filter Reset Handler ---
  /**
   * @function handleResetFilters
   * @description Resets all filter states (search, popular, soon, location, date) to their default values. Resets pagination to page 1.
   */
  const handleResetFilters = () => {
    setIsPopularActive(false);
    setSearchValue("");
    setIsSoonActive(false);

    // Reset location filter
    setIsLocationActive(false); // Close dropdown if open
    setLocationInput(""); // Clear input field
    setSelectedLocation(""); // Clear active location filter

    // Reset date range filter
    setIsDateActive(false); // Close dropdown if open and deactivate date filter
    setStartMonth("January"); // Reset start date
    setStartYear(years[0]);
    setEndMonth("January"); // Reset end date
    setEndYear(years[0]);

    setCurrentPage(1); // Reset pagination
    setIsDesktopDateDropdownOpen(false); // Close desktop dropdown
  };

  // --- Mobile Modal Handlers ---
  /**
   * @function handleCloseMobileModal
   * @description Closes the mobile filter modal dialog using its ref.
   */
  const handleCloseMobileModal = () => {
    mobileFilterRef.current?.close();
  };

  /**
   * @function handleMobileSearch
   * @description Applies the location and date filters entered in the mobile modal, activates the date filter, closes the modal, and resets pagination.
   */
  const handleMobileSearch = () => {
    setSelectedLocation(locationInput); // Apply location from modal input
    setIsDateActive(true); // Activate date filter (using selected month/year states)
    handleCloseMobileModal(); // Close the modal
    setCurrentPage(1); // Reset to page 1
  };

  /**
   * @function handleMobileReset
   * @description Resets all filters using `handleResetFilters` and then closes the mobile modal.
   */
  const handleMobileReset = () => {
    handleResetFilters(); // Resets everything including pagination
    handleCloseMobileModal();
  };

  // --- Navigation Handlers ---
  /**
   * @function handleNavigateToEvent
   * @description Navigates the user to the details page for a specific event.
   * @param {string} eventId - The ID of the event to navigate to.
   */
  const handleNavigateToEvent = (eventId: string) => {
    console.log("Navigating to event ID:", eventId); // Log the ID for debugging
    if (eventId) {
      navigate(`/user/events/${eventId}`);
    } else {
      console.error("Attempted to navigate with undefined eventId");
    }
  };

  // --- Pagination Handler ---
  /**
   * @function handlePageChange
   * @description Updates the `currentPage` state when a pagination button is clicked. Passed down to the `PaginationButtons` component.
   * @param {number} pageNumber - The new page number selected.
   */
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  // ==========================================================================
  // Side Effects (e.g., Event Listeners for UI)
  // ==========================================================================

  /**
   * @effect Close Location Dropdown on Outside Click
   * @description Adds an event listener to detect clicks outside the desktop location filter dropdown. If an outside click occurs, it closes the dropdown by setting
   * `isLocationActive` to false. Cleans up the listener on unmount or when the dropdown is already closed.
   * @deps {boolean} isLocationActive - Runs when the dropdown's open state changes.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setIsLocationActive(false); // Close the dropdown
      }
    };

    if (isLocationActive) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup listener on component unmount or when isLocationActive becomes false
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLocationActive]);

  /**
   * @effect Close Desktop Date Dropdown on Outside Click
   * @description Adds an event listener to detect clicks outside the *desktop* date range filter dropdown. If an outside click occurs, it closes the dropdown UI
   * by setting `isDesktopDateDropdownOpen` to false. Note: This does *not* deactivate the date filter itself (`isDateActive`). Cleans up the listener.
   * @deps {boolean} isDesktopDateDropdownOpen - Runs when the desktop dropdown's open state changes.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setIsDesktopDateDropdownOpen(false); // Close only the visual dropdown
      }
    };

    if (isDesktopDateDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDesktopDateDropdownOpen]);

  // ==========================================================================
  // Pagination Logic (Calculated from filteredEvents and state)
  // ==========================================================================

  const totalFilteredEvents = filteredEvents.length;
  const totalPages = Math.ceil(totalFilteredEvents / EVENTS_PER_PAGE);

  // Calculate the events to display on the current page
  const indexOfLastEvent = currentPage * EVENTS_PER_PAGE;
  const indexOfFirstEvent = indexOfLastEvent - EVENTS_PER_PAGE;
  const currentEvents = filteredEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );

  // Adjust currentPage if it becomes invalid after filtering
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage < 1 && totalPages > 0) {
      setCurrentPage(1);
    }
    // If totalPages becomes 0, currentPage should ideally be 1 or remain as is if no events.
    // Handled by the initial check for totalPages > 0.
  }, [currentPage, totalPages]);

  // ==========================================================================
  // Render JSX
  // ==========================================================================
  return (
    <div className="mb-24">
      {/* navbars */}
      <div className="lg:hidden">
        {/* <MobileHeader /> */}
        <UserNavbar activePage="Events" />
      </div>
      <div className="sticky top-0 z-50 hidden lg:block">
        <DesktopNavbar activePage="Events" />
      </div>
      <BackAndFontAndProfileHeader />

      <div className="flex flex-col items-center justify-center">
        {/* ========== desktop view: title ========== */}
        <div className="flex-col items-center justify-center hidden mt-12 lg:flex mb-15">
          {/* title of events page */}
          <h1 className="text-5xl font-bold text-Primary">Events</h1>
          <span className="px-4 my-5 text-xl text-Primary">
            Find events by title, location, or keyword
          </span>

          {/* Search bar for events page */}
          <div className="w-full max-w-xl px-4">
            <label className="input bg-[#EBF2FA] rounded-xl border-2 border-[#B9D5EB] py-3 w-full">
              <IoIosSearch size={24} className="h-[2em] opacity-50" />
              <input
                type="text"
                className="grow"
                placeholder="Search"
                value={searchValue}
                onChange={handleChange}
              />
            </label>
          </div>
        </div>

        {/* ========== mobile view: title and filter ========== */}
        <div className="lg:hidden flex flex-row w-full items-center justify-between mt-20 px-[2rem] sm:px-32">
          <h1 className="text-4xl font-bold text-Primary lg:hidden">Events</h1>
          {/* Mobile Filter Button and Modal */}
          <div className="flex items-center h-full">
            <Button
              onClick={() => {
                mobileFilterRef.current?.showModal(); // Show the modal dialog
              }}
              variant="major"
              className="w-min px-4 !mt-0"
            >
              Search/Filter
            </Button>
            {/* Mobile Filter Modal Dialog */}
            <MobileFilterModal
              dialogRef={mobileFilterRef}
              searchValue={searchValue}
              locationInput={locationInput}
              startMonth={startMonth}
              startYear={startYear}
              endMonth={endMonth}
              endYear={endYear}
              months={months}
              years={years}
              handleChange={handleChange}
              handleLocationInputChange={handleLocationInputChange}
              setStartMonth={setStartMonth}
              setStartYear={setStartYear}
              setEndMonth={setEndMonth}
              setEndYear={setEndYear}
              handleCloseModal={handleCloseMobileModal}
              handleSearch={handleMobileSearch}
              handleReset={handleMobileReset}
            />
          </div>
        </div>

        {/* ========== desktop view: create event button and filter options ========== */}
        {/* <button
          className="hidden gap-2 px-4 py-2 mb-8 -mt-8 text-white transition-colors duration-200 border rounded-full lg:flex border-Secondary bg-Secondary"
          onClick={() => {navigate('/user/requests/event')}}
        >
          <Plus /> Create Event
        </button> */}

        <DesktopFilterBar
          isPopularActive={isPopularActive}
          isSoonActive={isSoonActive}
          selectedLocation={selectedLocation}
          isLocationActive={isLocationActive}
          locationInput={locationInput}
          isDateActive={isDateActive}
          isDesktopDateDropdownOpen={isDesktopDateDropdownOpen}
          startMonth={startMonth}
          startYear={startYear}
          endMonth={endMonth}
          endYear={endYear}
          handlePopularFilter={handlePopularFilter}
          handleSoonFilter={handleSoonFilter}
          handleLocationFilter={handleLocationFilter}
          handleLocationInputChange={handleLocationInputChange}
          handleLocationKeyPress={handleLocationKeyPress}
          toggleDesktopDateDropdown={toggleDesktopDateDropdown}
          setStartMonth={setStartMonth}
          setStartYear={setStartYear}
          setEndMonth={setEndMonth}
          setEndYear={setEndYear}
          activateDateFilter={activateDateFilter}
          handleResetFilters={handleResetFilters}
          months={months}
          years={years}
          locationRef={locationRef}
          dateRef={dateRef}
        />

        {/* Events Card Container */}
        {loading ? (
          <div className="grid grid-cols-1 mt-5 gap-7 lg:grid-cols-2 lg:px-24">
            {[1, 2, 3, 4].map((i) => (
              <CardSkeleton key={i} variant="eventCard" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 mt-5 gap-7 lg:grid-cols-2 lg:px-24">
            {" "}
            {/* Map through current events for the page */}
            {currentEvents.map((event) => (
              <EventCardGeneric
                key={event._id}
                eventId={event._id}
                eventTitle={event.title}
                eventDateTime={event.event_date}
                eventLocation={event.location}
                eventImage={event.eventImageURL}
                onClick={() => handleNavigateToEvent(event._id)}
              />
            ))}
            {/* No Events Message */}
            {filteredEvents.length === 0 && (
              <div className="col-span-1 mt-10 text-lg text-center lg:col-span-2 text-Primary">
                No events found matching your criteria.
              </div>
            )}
            {/* Pagination Buttons - Render below grid if needed */}
            {totalPages > 1 && (
              <div className="flex justify-center col-span-1 mt-8 mb-4 lg:col-span-2">
                <PaginationButtons
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}

        {/* sticky create event button */}
        <PrivilegedAction actionProp="action">
          <FloatingActionButton
            icon="plus"
            text="Create Event"
            action={() => {
              navigate("/user/requests/event");
            }}
          />
        </PrivilegedAction>
      </div>
    </div>
  );
};

export default UserEventspage;
