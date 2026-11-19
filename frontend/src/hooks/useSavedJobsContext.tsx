import { useContext } from "react";
import { SavedJobsContext } from "../context/SavedJobsContext"; // adjust the path as needed
import type { SavedJobsContextType } from "../context/SavedJobsContext";

export const useSavedJobsContext = () => {
  const context = useContext(SavedJobsContext);

  if (!context) {
    throw new Error("useSavedJobsContext must be used within a SavedJobsContextProvider");
  }

  return context as SavedJobsContextType;
};
