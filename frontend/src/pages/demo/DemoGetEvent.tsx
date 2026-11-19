import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface Event {
    _id: string;
    title: string;
    description: string;
    event_date: string;
    location: string;
    eventImageURL?: string; // Optional
}

const DemoCreateEvent = () => {
  const [event, setEvent] = useState({
    created_by: "65f4e1a07d98f3a8a4e8b2c3", // Sample creator ID
    title: "",
    description: "",
    event_date: "",
    location: "",
    eventImageURL: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");
  
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/events`, event);
      setMessage("Event created successfully!");
  
      // Ensure 'created_by' is included in the reset state
      setEvent({
        created_by: event.created_by, // Retaining the creator ID
        title: "",
        description: "",
        event_date: "",
        location: "",
        eventImageURL: "",
      });
    } catch (error: any) {
      setError(error.response?.data?.detail || "Failed to create event");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create Event</h1>
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-6 rounded-lg">
          <input name="title" value={event.title} onChange={handleChange} placeholder="Title" required className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none" />
          <input name="description" value={event.description} onChange={handleChange} placeholder="Description" required className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none" />
          <input name="event_date" type="datetime-local" value={event.event_date} onChange={handleChange} required className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none" />
          <input name="location" value={event.location} onChange={handleChange} placeholder="Location" required className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none" />
          <input name="eventImageURL" value={event.eventImageURL} onChange={handleChange} placeholder="Image URL" className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none" />
          <button type="submit" disabled={isLoading} className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50">
            {isLoading ? "Creating..." : "Create Event"}
          </button>
        </form>
        {error && <p className="text-red-400 mt-4">{error}</p>}
        {message && <p className="text-green-400 mt-4">{message}</p>}
        <Link to="/demo/get-all-events" className="block mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
          View All Events
        </Link>
      </div>
    </div>
  );
};

const DemoEventList = () => {
    const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/events`);
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events", error);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Events</h1>
        {events.map((event) => (
          <div key={event._id} className="p-4 bg-gray-800 rounded-lg mb-4">
            <h3 className="text-xl font-semibold">{event.title}</h3>
            <p>{event.description}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Date:</strong> {event.event_date}</p>
            {event.eventImageURL && <img src={event.eventImageURL} alt={event.title} className="w-full h-48 object-cover mt-2 rounded-lg" />}
          </div>
        ))}
        <Link to="/demo/create-event" className="block mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-center">Create New Event</Link>
      </div>
    </div>
  );
};

export { DemoCreateEvent, DemoEventList };
