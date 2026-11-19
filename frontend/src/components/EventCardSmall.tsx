import React from "react";
import EventProps from "../types/event";

const EventCardSmall: React.FC<EventProps> = ({
  title,
  event_date,
  location,
}: EventProps) => {
  return (
    <div
      className="flex items-center justify-between p-4 bg-WhiteAndGrayGradient border border-[#C6D8EB] rounded-xl shadow-md hover:scale-105 cursor-pointer transition-transform duration-300 ease-in-out w-full"
      title={title} // Add hover text
    >
      {/* Event details */}
      <div className="max-w-[72%] text-Primary">
        <h3 className="w-full mb-1 text-lg font-bold leading-tight truncate">
          {title}
        </h3>
        <p className="mb-1 text-sm leading-tight">{location}</p>
      </div>

      {/* Event date box */}
      <div className="flex flex-col items-center justify-center min-w-16 w-16 h-16 text-white rounded-xl bg-Gradient2">
        <span className="text-xl font-extrabold">
          {new Date(event_date).getDate()}
        </span>
        <span className="text-sm font-extrabold">
          {new Date(event_date)
            .toLocaleString("en-US", { month: "short" })
            .toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default EventCardSmall;
