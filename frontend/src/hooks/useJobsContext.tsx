import { useContext } from "react";
import { JobsContext } from "../context/JobsContext"; // adjust path as needed
import type { JobsContextType } from "../context/JobsContext";

export const useJobsContext = () => {
  const context = useContext(JobsContext);

  if (!context) {
    throw new Error("useJobsContext must be used within a JobsContextProvider");
  }

  return context as JobsContextType;
};