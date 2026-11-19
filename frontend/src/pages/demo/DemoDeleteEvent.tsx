import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const DemoDeleteEvent: React.FC = () => {
  const [eventId, setEventId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!eventId.trim()) {
      setError("Please enter a valid event ID");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/events/${eventId}`);
      setMessage("Event deleted successfully!");
    } catch (error: any) {
      setError(error.response?.data?.detail || "Failed to delete event");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Delete Event</h1>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder="Enter Event ID to delete"
            className="flex-1 p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : "Delete Event"}
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

export default DemoDeleteEvent;