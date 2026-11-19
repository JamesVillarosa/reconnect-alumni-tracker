import { createContext, useState, useEffect, ReactNode } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import JobProps from "../types/job";
import axios, { AxiosError } from "axios";

type JobFilters = {
  currentPage?: number;
  limit?: number;
  keywords?: string;
  category?: string[];
  workType?: string;
  salaryRange?: number[];
  listingTime?: string;
};

export type JobsContextType = {
  allJobs: JobProps[];
  setAllJobs: React.Dispatch<React.SetStateAction<JobProps[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  total: number;
  setTotal: React.Dispatch<React.SetStateAction<number>>;
  fetchJobs: (filters?: JobFilters) => Promise<void>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const JobsContext = createContext<JobsContextType | null>(null);

export const JobsContextProvider = ({ children }: { children: ReactNode }) => {
  const [allJobs, setAllJobs] = useState<JobProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const { user } = useAuthContext();

  const fetchJobs = async ({
    currentPage = 1,
    limit = 10,
    keywords,
    category,
    workType,
    salaryRange = [0, 250000],
    listingTime,
  }: JobFilters = {}) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/jobs/`,
        {
          params: {
            skip: (currentPage - 1) * 10,
            limit: limit,
            keyword: keywords || undefined,
            job_field:
              (category?.length === 0 ? undefined : category) || undefined,
            job_type:
              (workType === "Any type" ? undefined : workType) || undefined,
            min_salary: salaryRange[0] > 0 ? salaryRange[0] : undefined,
            max_salary: salaryRange[1] < 250000 ? salaryRange[1] : undefined,
            listing_time:
              listingTime !== "Listed any time" ? listingTime : undefined,
          },
          paramsSerializer: (params) => {
            const searchParams = new URLSearchParams();

            for (const key in params) {
              const value = params[key as keyof typeof params];
              if (Array.isArray(value)) {
                value.forEach((v) => searchParams.append(key, v));
              } else if (value !== undefined && value !== null) {
                searchParams.append(key, value as string);
              }
            }

            return searchParams.toString();
          },
          withCredentials: true,
        }
      );
      setAllJobs(response.data.jobs);
      setTotal(response.data.total);
      // setTotalPages(Math.ceil(response.data.total / 10));
      // setCardsLoading(false);
    } catch (error: unknown) {
      if (
        (error as AxiosError).response &&
        (error as AxiosError).response?.status === 404
      ) {
        setAllJobs([]);
        setTotal(0);
        setError("Failed to fetch jobs. Please try again later.");
        console.error("Error fetching jobs:", error);
      } else {
        console.error("Failed to fetch jobs", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]); // Run only once unless `user` changes

  return (
    <JobsContext.Provider
      value={{
        allJobs,
        setAllJobs,
        loading,
        setLoading,
        error,
        setError,
        fetchJobs,
        total,
        setTotal,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
};
