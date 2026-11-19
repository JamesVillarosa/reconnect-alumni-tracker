import { useContext } from "react";
import { DonationsContext } from "../context/DonationsContext"; // adjust path as needed
import type { DonationsContextType } from "../context/DonationsContext";

export const useDonationsContext = () => {
  const context = useContext(DonationsContext);

  if (!context) {
    throw new Error("useDonationsContext must be used within a DonationsContextProvider");
  }

  return context as DonationsContextType;
};
