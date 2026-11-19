import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserNavbar from "../../components/UserNavbar";
import DesktopNavbar from "../../components/DesktopNavbar";
import { FaArrowLeftLong } from "react-icons/fa6";
import { EventProps, Organizer } from "../../types/event";
import Button from "../../components/Button";
// import { PiMapPinAreaBold, PiCalendarDotsBold } from "react-icons/pi";
// import { LuBookmark } from "react-icons/lu";
// import UserHeads from "../../assets/user_head.png";
// import { HiUserCircle } from "react-icons/hi";
import { BackAndFontAndProfileHeader } from "../../components/MobileHeaders";
import axios from "axios";
import { useAuthContext } from "../../hooks/useAuthContext";
import { showToast } from "../../components/utils/ToastFxn";
import PrivilegedAction from "../utils/PrivilegedActionGuard";
// import MobileHeader from "../../components/MobileHeaders";

/**
 * @typedef {import("../../types/event").default} EventProps
 */

/**
 * Component to display the details of a specific event for a user.
 * It fetches event details based on the URL parameter and allows users to RSVP.
 * Provides different layouts for desktop and mobile views.
 * @returns {React.ReactElement} The UserEventDetails component.
 */
const UserEventDetails: React.FC = () => {
  const { user } = useAuthContext();

  /**
   * Extracts the event ID from the URL parameters.
   * @type {object}
   * @property {string} id - The event ID from the URL.
   */
  const { id: eventId } = useParams<{ id: string }>();

  /**
   * Hook to programmatically navigate between routes.
   * @type {import('react-router-dom').NavigateFunction}
   */
  const navigate = useNavigate();

  /**
   * State variable to hold the fetched event details.
   * @type {[EventProps | null, React.Dispatch<React.SetStateAction<EventProps | null>>]}
   */
  const [event, setEvent] = useState<EventProps | null>(null);
  const [organizer, setOrganizer] = useState<Organizer | null>(null);

  /**
   * State variable to track if the event details are currently being fetched.
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * State variable to track if an error occurred during the fetch.
   * @type {[string | null, React.Dispatch<React.SetStateAction<string | null>>]}
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * State variable to track if the current user has RSVPed to the event.
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [isRSVPed, setIsRSVPed] = useState(false);

  /**
   * State variable to control the expansion of the event overview section on mobile view.
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  // const [isMobileOverviewExpanded, setIsMobileOverviewExpanded] =
  //   useState(false);

  /**
   * Effect hook to fetch event details when the component mounts or when the eventId changes.
   */
  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      setError(null);
      setEvent(null);
      setOrganizer(null);

      if (!eventId) {
        setError("Event ID is missing.");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get<EventProps>(
          `${import.meta.env.VITE_API_URL}/events/${eventId}`,
          { withCredentials: true }
        );
        setEvent(response.data);
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("Failed to load event details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  useEffect(() => {
    const checkUserRSVPStatus = async () => {
      if (!event?._id || !user) {
        return;
      }

      try {
        const response = await axios.get<{ isRSVPed: boolean }>(
          `${import.meta.env.VITE_API_URL}/events/${event._id}/rsvp-status`,
          { withCredentials: true }
        );
        setIsRSVPed(response.data.isRSVPed);
      } catch (err) {
        console.error("Failed to fetch RSVP status: ", err);
        setIsRSVPed(false);
      }
    };
    checkUserRSVPStatus();
  }, [event, user]);

  /**
   * Handles the bookmark action. Currently logs a message to the console.
   * @async
   * @function handleBookmark
   * @returns {Promise<void>}
   * @todo Implement actual bookmarking logic.
   */
  // const handleBookmark = useCallback(async () => {
  //   console.log("Bookmark clicked.");
  // }, []);

  /**
   * Handles the RSVP action for the event. Sends a POST request to toggle RSVP status.
   * Re-fetches the RSVP status to sync state and alerts on success.
   * @async
   * @function handleRSVP
   * @returns {Promise<void>}
   */
  const handleRSVP = useCallback(async () => {
    if (!event?._id || !user) return;

    showToast(
      "info",
      isRSVPed ? "Cancelling RSVP" : "Submitting RSVP",
      isRSVPed ? "Cancelling your RSVP." : "Submitting your RSVP.",
      true
    );

    try {
      const response = await axios.post<{ message?: string }>(
        `${import.meta.env.VITE_API_URL}/events/${event._id}`,
        {},
        { withCredentials: true }
      );

      showToast(
        "success",
        "RSVP Successful",
        response.data.message || "You are now attending this event!"
      );

      const statusResponse = await axios.get<{ isRSVPed: boolean }>(
        `${import.meta.env.VITE_API_URL}/events/${event._id}/rsvp-status`,
        { withCredentials: true }
      );
      setIsRSVPed(statusResponse.data.isRSVPed);
    } catch (error) {
      console.error("Error toggling RSVP:", error);
      showToast(
        "error",
        "RSVP Failed",
        "Something went wrong. Please try again."
      );

      try {
        const statusResponse = await axios.get<{ isRSVPed: boolean }>(
          `${import.meta.env.VITE_API_URL}/events/${event._id}/rsvp-status`,
          { withCredentials: true }
        );
        setIsRSVPed(statusResponse.data.isRSVPed);
      } catch (statusError) {
        console.error(
          "Failed to re-sync RSVP status after error:",
          statusError
        );
      }
    }
  }, [event, user]);

  /**
   * Toggles the expanded state of the mobile overview section.
   * @function toggleMobileOverview
   * @returns {void}
   */
  // const toggleMobileOverview = useCallback(() => {
  //   setIsMobileOverviewExpanded((prev) => !prev);
  // }, []);

  // --- RENDER LOGIC ---

  // Loading State
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading event details...
      </div>
    );
  }

  // Error State
  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  // Event Not Found State (after loading and no error, but event is still null)
  if (!event) {
    return (
      <div className="p-6 text-center text-gray-500">
        Event not found or could not be loaded.
      </div>
    );
  }

  const eventDate = new Date(event.event_date);
  /**
   * Formatted event date string (e.g., "April 21, 2025").
   * @type {string}
   */
  const eventDateFormatted = eventDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });


  return (
    <div className="min-h-screen bg-white text-Primary">
      <BackAndFontAndProfileHeader />
      {/* ========== DESKTOP VIEW ========== */}
      <div className="sticky top-0 z-50 hidden lg:block">
        <DesktopNavbar activePage="Events" />
      </div>

      {/* Image Section (Common for Desktop and Mobile) */}
      <div className="">
        {/* Mobile: Location and Bookmark icons overlay on image when overview is collapsed */}
        {/* {!isMobileOverviewExpanded && (
          <div className="absolute z-50 flex flex-row justify-between w-full pr-10 sm:pr-20 md:pr-40">
            <div className="z-10 flex flex-row items-center gap-2 px-3 py-1 mx-5 mt-5 text-xs font-semibold text-black rounded-full lg:hidden bg-white/85">
              <PiMapPinAreaBold size={18} className="!text-Primary" />
              {event.location}
            </div>
            <div className="z-10 flex flex-row items-center gap-2 px-2 py-1 mx-5 mt-5 text-xs font-semibold text-black rounded-full lg:hidden bg-white/90">
              <button onClick={handleBookmark} aria-label="Bookmark event">
                <LuBookmark size={18} className="!text-Primary" />
              </button>
            </div>
          </div>
        )} */}
        {/* Event Image */}
        <img
          src={event.eventImageURL}
          alt={`Poster for ${event.title}`} // Improved alt text
          className="relative w-full max-h-[500px] object-cover"
        />
      </div>

      {/* Desktop: Back button and Event Title */}
      <div className="flex flex-row items-center mx-8 mt-10 mb-8 lg:mx-30">
        <button onClick={() => navigate(-1)} aria-label="Go back">
          <FaArrowLeftLong
            className="hidden lg:block visitext-Primary font-xl"
            size={30}
            strokeWidth={3}
          />
        </button>
        <h1 className="ml-4 text-3xl font-bold lg:text-4xl">{event.title}</h1>
      </div>

      {/* Desktop: Organizer and Date Section */}
      <div className="flex-col mx-12 my-8 lg:mx-30 lg:flex">
        <span className="font-medium text-Primary ">
          {/* TODO: Replace "no name" with actual organizer data */}
          Organized by {organizer ? organizer.name : "Unknown Organizer"}
        </span>
        <h1 className="text-xl font-bold text-Primary">{eventDateFormatted}</h1>
      </div>

      {/* Desktop: About Section */}
      <div className="pb-24 mx-12 lg:block lg:mx-30">
        <h1 className="mb-8 text-2xl font-bold lg:text-3xl text-Primary">
          About
        </h1>
        <span>{event.description}</span>
      </div>

      {/* ========== MOBILE VIEW ========== */}
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* <MobileHeader /> */}
        <UserNavbar activePage="Events" />
      </div>

      {/* Mobile: Title, Organizer, Date Card (Visible when overview is collapsed) */}
      {/*}
      {!isMobileOverviewExpanded && (
        <div className="flex flex-row justify-between items-center px-5 py-2 mt-3 mx-5 sm:mx-10 md:mx-20 lg:hidden bg-gradient-to-b from-[#FAFAFA] to-[#E4EAF2] rounded-3xl">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">{event.title}</h1>
            <span className="text-sm font-normal text-Primary">
            </span>
          </div>
          <div className="flex flex-col items-center justify-center w-20 h-20 p-2 text-white rounded-xl bg-Gradient2">
            <span className="text-4xl font-semibold">{eventDateNumber}</span>
            <span className="-mt-2 text-base font-semibold">{eventMonth}</span>
          </div>
        </div>
      )}
      */}

      {/* Mobile: Back button */}

      {/* Mobile: Overview Section Title */}
      {/* <h1 className="pl-3 mx-5 my-5 text-lg font-medium sm:mx-10 md:mx-20 lg:hidden">
        Overview
      </h1> */}

      {/* Mobile: Overview Content Card */}
      {/* <div className="z-10 flex flex-col p-5 mx-5 mb-24 bg-Gradient2 sm:mx-10 md:mx-20 lg:hidden rounded-3xl">
        {isMobileOverviewExpanded && (
          <div className="mb-4 space-y-2 text-xs text-white">
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <div className="flex flex-row items-center gap-1">
              <PiCalendarDotsBold size={20} />
              <span className="font-medium">{eventDateFormatted}</span>
              <span className="font-medium ">| </span>
            </div>
            <div className="flex flex-row items-center gap-1">
              <PiMapPinAreaBold size={20} />
              <span className="font-medium">{event.location}</span>
            </div>
            <div className="flex flex-row items-center gap-1">
              <img src={UserHeads} alt="Attendees icon" />
              <span className="text-lg font-semibold">+ 36 Going</span>
            </div>
          </div>
        )}

        <span
          className={`text-white text-xs leading-relaxed ${
            isMobileOverviewExpanded ? "" : "line-clamp-6"
          }`}
        >
          <div className="text-2xl font-bold">
            {isMobileOverviewExpanded ? "About" : ""}
          </div>
          {event.description}
        </span>

        {isMobileOverviewExpanded && (
          <div className="mt-4 text-white">
            <h2 className="text-2xl font-bold">Speakers</h2>
            <div className="flex flex-row">
              <HiUserCircle size={64} aria-label="Speaker 1 placeholder" />
              <HiUserCircle size={64} aria-label="Speaker 2 placeholder" />
              <HiUserCircle size={64} aria-label="Speaker 3 placeholder" />
              <HiUserCircle size={64} aria-label="Speaker 4 placeholder" />
            </div>
          </div>
        )}

        <div className="flex flex-row items-center justify-between mt-5">
          <button
            onClick={toggleMobileOverview}
            className="text-xs font-semibold text-white underline"
          >
            {isMobileOverviewExpanded ? "" : "CLICK HERE TO READ MORE"}
          </button>
          {isMobileOverviewExpanded ? (
            <button
              onClick={handleRSVP}
              className="w-full px-8 py-1 text-xs font-bold bg-white rounded-full"
            >
              {isRSVPed ? "Cancel RSVP" : "RSVP"}
            </button>
          ) : (
            <button
              onClick={handleRSVP}
              className="px-8 py-1 text-xs font-semibold bg-white rounded-full"
            >
              {isRSVPed ? "Cancel RSVP" : "RSVP"}
            </button>
          )}
        </div>
      </div> */}

      {/* Desktop: Sticky RSVP Button */}
      <div className="fixed z-50 lg:block bottom-20 right-5 w-min sm:right-10 md:bottom-15 md:right-15">
        <div>
          <PrivilegedAction>
            <Button
              onClick={handleRSVP}
              variant="major"
              className="!border-Primary w-auto px-6 h-12 flex items-center justify-center rounded-lg"
            >
              {isRSVPed ? "Cancel RSVP" : "RSVP"}
            </Button>
          </PrivilegedAction>
        </div>
      </div>
    </div>
  );
};

export default UserEventDetails;
