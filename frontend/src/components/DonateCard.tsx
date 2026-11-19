import React from "react";
import DonationProps from "../types/donation";
import { useNavigate } from "react-router-dom";

const DonateCard: React.FC<DonationProps> = ({
  title,
  end_date,
  location,
  raised_funds,
  target_funds,
  donationImageURL,
  _id,
}) => {
  const navigate = useNavigate();

  // Datetime formatting
  const eventTime = end_date
    ? new Date(end_date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
    : "Invalid Time";
  const eventDay = end_date
    ? new Date(end_date).toLocaleDateString("en-US", { weekday: "short" })
    : "Invalid Date";

  const handleCardClick = () => {
    navigate(`/user/donate/${_id}`);
  };

  return (
    <div 
      className="card xl-auto py-2 transition cursor-pointer rounded-xl"
      onClick={handleCardClick}
    >
      {/* Cover Image */}
      <figure>
        <img
          src={donationImageURL}
          alt={title}
          className="object-cover w-full h-56 rounded-xl"
        />
      </figure>

      {/* Card Content */}
      <div className="p-0 pt-4 card-body">
        <div className="flex items-center justify-between">
          {/* Until */}
          <div className="flex flex-col items-center justify-center w-20 h-20 p-2 text-white rounded-xl bg-Gradient2">
            <span className="text-sm font-bold">UNTIL</span>
            <span className="text-xl font-extrabold">
              {end_date
                ? new Date(end_date)
                  .toLocaleString("en-US", { month: "short" })
                  .toUpperCase()
                : "N/A"}
            </span>
            <span className="text-xl font-extrabold">
              {end_date ? new Date(end_date).getDate() : "N/A"}
            </span>
          </div>

          {/* Event Details */}
          <div className="flex-1 ml-3 text-Primary">
            <h3 className="mb-1 text-sm font-bold leading-tight truncate w-52 sm:w-64">
              {title}
            </h3>
            <p className="mb-1 text-xs leading-tight">{`${eventDay}, ${eventTime} · ${location}`}</p>
            <p className="text-xs font-semibold">
              P {raised_funds} out of P {target_funds} goal reached
            </p>
          </div>

          {/* Donate */}
          <button className="px-4 py-2 text-sm font-bold text-white transition cursor-pointer bg-Accent rounded-4xl hover:bg-green-600"
            // navigate to user/donate?id={_id}
            onClick={() => {
              window.location.href = `/user/donate?id=${_id}`;
            }}
          >
            Donate
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonateCard;
