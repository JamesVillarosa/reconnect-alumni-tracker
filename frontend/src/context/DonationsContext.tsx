import { createContext, useState, useEffect, ReactNode } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import DonationProps from "../types/donation";
import axios from "axios";

type DonationFilters = {
  currentPage?: number;
  limit?: number;
};

export type DonationsContextType = {
  allDonations: DonationProps[];
  setAllDonations: React.Dispatch<React.SetStateAction<DonationProps[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  fetchDonations: (filters?: DonationFilters) => Promise<void>;
  hasMore: boolean;
  total: number;
  skip: number;
  limit: number;
};

export const DonationsContext = createContext<DonationsContextType | null>(null);

export const DonationsContextProvider = ({ children }: { children: ReactNode }) => {
  const [allDonations, setAllDonations] = useState<DonationProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const { user } = useAuthContext();

  const fetchDonations = async ({
    currentPage = 1,
    limit = 10
  }: DonationFilters = {}) => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/donation/`, {
        params: {
          skip: (currentPage - 1) * limit,
          limit
        },
        withCredentials: true
      });

      setAllDonations(response.data.donations);
      setHasMore(response.data.hasMore);
      setTotal(response.data.total);
      setSkip(response.data.skip);
      setLimit(response.data.limit);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setAllDonations([]);
        setError("No donations found.");
      } else {
        console.error("Failed to fetch donations", error);
        setError("Failed to fetch donations. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDonations();
    }
  }, [user]);

  return (
    <DonationsContext.Provider
      value={{
        allDonations,
        setAllDonations,
        loading,
        setLoading,
        error,
        setError,
        fetchDonations,
        hasMore,
        total,
        skip,
        limit
      }}
    >
      {children}
    </DonationsContext.Provider>
  );
};
