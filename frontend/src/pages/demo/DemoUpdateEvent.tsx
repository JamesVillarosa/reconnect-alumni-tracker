import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const DemoUpdateEvent: React.FC = () => {
  const [eventId, setEventId] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    if (!eventId.trim()) {
      setError("Please enter a valid event ID");
      return;
    }

    if (!eventName.trim() && !eventDate.trim()) {
      setError("Please provide at least one field to update");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const payload: any = {};
      if (eventName.trim()) payload.name = eventName;
      if (eventDate.trim()) payload.date = eventDate;

      await axios.put(`${import.meta.env.VITE_API_URL}/events/${eventId}`, payload);
      setMessage("Event updated successfully!");
    } catch (error: any) {
      setError(error.response?.data?.detail || "Failed to update event");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Update Event</h1>

        <div className="flex flex-col gap-4 mb-6">
          <input
            type="text"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder="Enter Event ID to update"
            className="p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="New Event Name (optional)"
            className="p-3 rounded-lg bg-gray-700 border border-gray-600"
          />
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="p-3 rounded-lg bg-gray-700 border border-gray-600"
          />
          <button
            onClick={handleUpdate}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50"
          >
            {isLoading ? "Updating..." : "Update Event"}
          </button>
        </div>

        {error && <p className="text-red-400 mb-4">{error}</p>}
        {message && <p className="text-green-400 mb-4">{message}</p>}

        <Link
          to="/demo/get-all-events"
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
        >
          View All Events
        </Link>
      </div>
    </div>
  );
};

export default DemoUpdateEvent;
