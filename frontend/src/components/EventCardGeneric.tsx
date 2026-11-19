import React from "react";

/**
 * Type definition for generic event card properties
 * @typedef {Object} GenericEventCardDetails
 * @property {string} eventId - Unique identifier for the event
 * @property {string} eventTitle - Title/name of the event
 * @property {string} eventDateTime - ISO string representing event date and time
 * @property {string} eventLocation - Physical or virtual location of the event
 * @property {string} eventImage - URL for the event's cover image
 * @property {Function} [onClick] - Optional click handler for the entire card
 */
export type GenericEventCardDetails = {
  eventId: string;
  eventTitle: string;
  eventDateTime: string;
  eventLocation: string;
  eventImage: string;
  onClick?: () => void;
};

/**
 * Reusable event card component with image, date details, and join action
 * @component
 * @param {GenericEventCardDetails} props - Event details and configuration
 * 
 * @example
 * <EventCardGeneric
 *   eventId="evt-123"
 *   eventTitle="Tech Conference 2024"
 *   eventDateTime="2024-03-15T09:00:00"
 *   eventLocation="San Francisco Convention Center"
 *   eventImage="https://example.com/event-image.jpg"
 *   onClick={() => console.log('Event card clicked')}
 * />
 */
const EventCardGeneric: React.FC<GenericEventCardDetails> = ({
  eventTitle,
  eventDateTime,
  eventLocation,
  eventImage,
  onClick,
}) => {
  // Date Formatting
  const eventDate = new Date(eventDateTime); // convert string to Date object
  const eventTime = eventDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const eventDay = eventDate.toLocaleDateString("en-US", {
    weekday: "short",
  });
  const eventMonth = eventDate
    .toLocaleString("en-US", { month: "short" })
    .toUpperCase();
  const eventDateNumber = eventDate.getDate();

  return (
    <div
      className="card max-w-3xl 3xl-auto p-2 hover:shadow-lg transition cursor-pointer rounded-xl"
      onClick={onClick}
    >
      {/* Event Image */}
      <figure>
        <img
          src={eventImage}
          alt={eventTitle}
          className="w-full h-70 object-cover rounded-xl"
        />
      </figure>

      <div className="card-body p-0 pt-4">
        <div className="flex items-center justify-between">
          {/* Date Box */}
          <div className="flex flex-col items-center justify-center w-20 h-20 p-2 rounded-xl bg-Gradient2 text-white">
            <span className="text-base font-semibold">{eventMonth}</span>
            <span className="text-4xl font-semibold">{eventDateNumber}</span>
          </div>

          {/* Event Details */}
          <div className="flex-1 ml-3 text-Primary">
            <h3 className="text-lg font-semibold leading-tight line-clamp-2 mb-1 w-52 sm:w-64">
              {eventTitle}
            </h3>
            <p className="text-xs leading-tight mb-1">{`${eventDay} ${eventTime} · ${eventLocation}`}</p>
          </div>

          {/* Join Button */}
          <button className="bg-Accent text-white text-lg font-bold py-1 px-4 rounded-lg hover:bg-green-600 cursor-pointer transition">
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCardGeneric;
