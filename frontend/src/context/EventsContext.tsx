import { createContext, useState, useEffect, ReactNode } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import EventProps from "../types/event";
import axios from "axios";

export type EventsContextType = {
  allEvents: EventProps[];
  setAllEvents: React.Dispatch<React.SetStateAction<EventProps[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  fetchEvents: (page?: number, limit?: number) => Promise<void>;
};

export const EventsContext = createContext<EventsContextType | null>(null);

export const EventsContextProvider = ({ children }: { children: ReactNode }) => {
  const [allEvents, setAllEvents] = useState<EventProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  const fetchEvents = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/events/`, {
        params: {
          skip: (page - 1) * limit,
          limit,
        },
        withCredentials: true,
      });

      setAllEvents(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setAllEvents([]);
        setError("No events found.");
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError("Failed to fetch events. Please try again.");
      }
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  return (
    <EventsContext.Provider value={{ allEvents, setAllEvents, loading, setLoading, error, setError, fetchEvents }}>
      {children}
    </EventsContext.Provider>
  );
};
