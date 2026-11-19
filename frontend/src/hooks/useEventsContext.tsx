import { useContext } from "react";
import { EventsContext } from "../context/EventsContext"; // adjust path if needed
import type { EventsContextType } from "../context/EventsContext";

export const useEventsContext = () => {
  const context = useContext(EventsContext);

  if (!context) {
    throw new Error("useEventsContext must be used within an EventsContextProvider");
  }

  return context as EventsContextType;
};
