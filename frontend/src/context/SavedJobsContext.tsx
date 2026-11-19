import { createContext, useState, useEffect, ReactNode } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import JobProps from "../types/job";
import axios, { AxiosError } from "axios";
import { toastPromise } from "../pages/utils/ToastFxn";

type SavedJobFilters = {
  currentPage?: number;
  limit?: number;
  keywords?: string;
  category?: string[];
  workType?: string;
  salaryRange?: [number, number];
  listingTime?: string;
};

export type SavedJobsContextType = {
  savedJobs: JobProps[];
  setSavedJobs: React.Dispatch<React.SetStateAction<JobProps[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  total: number;
  setTotal: React.Dispatch<React.SetStateAction<number>>;
  fetchSavedJobs: (filters?: SavedJobFilters) => Promise<void>;
  bookmarkJob: (job: JobProps) => Promise<void>;
  removeSavedJob: (jobId: string) => Promise<void>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const SavedJobsContext = createContext<SavedJobsContextType | null>(
  null
);

export const SavedJobsContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [savedJobs, setSavedJobs] = useState<JobProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const { user } = useAuthContext();

  // API Call - fetch saved jobs from database
  const fetchSavedJobs = async ({
    currentPage = 1,
    limit = 10,
    keywords,
    category,
    workType,
    salaryRange = [0, 250000],
    listingTime,
  }: SavedJobFilters = {}) => {
    console.log(keywords, category, workType, salaryRange, listingTime);
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/jobs/saved-jobs`,
        {
          params: {
            skip: (currentPage - 1) * limit,
            limit: limit,
          },
          withCredentials: true,
        }
      );

      setSavedJobs(response.data.savedJobs);
      setTotal(response.data.total);
    } catch (error: unknown) {
      if (
        (error as AxiosError).response &&
        (error as AxiosError).response?.status === 404
      ) {
        setSavedJobs([]);
        setTotal(0);
        setError("Failed to fetch saved jobs. Please try again later.");
        console.error("Error fetching saved jobs:", error);
      } else {
        console.error("Failed to fetch saved jobs", error);
      }
    } finally {
      setLoading(false);
    }
  };

  // API Call - save selected job
  const bookmarkJob = async (job: JobProps): Promise<void> => {
    setLoading(true);
    try {
      await toastPromise(
        axios.post(
          `${import.meta.env.VITE_API_URL}/jobs/saved-jobs`,
          { jobId: job._id }, // JSON payload
          { withCredentials: true }
        ),
        {
          loading: {
            title: "Updating bookmarks...",
            description: "Job post is being bookmarked.",
            type: "info",
          },
          success: {
            title: "Success!",
            description: "Job added to bookmarks.",
            type: "success",
          },
          error: {
            title: "Failed!",
            description: "There was an error bookmarking the job.",
            type: "error",
          },
        }
      ).then(() => {
        setSavedJobs((prevJobs) => {
          const alreadySaved = prevJobs.some((j) => j._id === job._id);
          if (alreadySaved) return prevJobs; // add only if it's not yet added
          return [job, ...prevJobs];
        });
        setTotal((prevTotal) => prevTotal + 1);
      });
    } catch (error) {
      console.error("Failed to bookmark job", error);
      setError("Failed to bookmark job. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // API Call - remove selected saved job from saved jobs
  const removeSavedJob = async (jobId: string): Promise<void> => {
    setLoading(true);
    try {
      toastPromise(
        axios.delete(`${import.meta.env.VITE_API_URL}/jobs/saved-jobs`, {
          params: { job_id: jobId },
          withCredentials: true,
        }),
        {
          loading: {
            title: "Updating bookmarks...",
            description: "Job post is being unbookmarked.",
            type: "info",
          },
          success: {
            title: "Success!",
            description: "Job removed from bookmarks.",
            type: "success",
          },
          error: {
            title: "Failed!",
            description: "There was an error unbookmarking the job.",
            type: "error",
          },
        }
      )
        .then(() => {
          // update local state
          setSavedJobs((prevJobs) =>
            prevJobs.filter((job) => job._id !== jobId)
          );
          setTotal((prevTotal) => prevTotal - 1);
        })
        .catch();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSavedJobs();
    }
  }, [user]); // Run only once unless `user` changes

  return (
    <SavedJobsContext.Provider
      value={{
        savedJobs,
        setSavedJobs,
        loading,
        setLoading,
        error,
        setError,
        fetchSavedJobs,
        bookmarkJob,
        removeSavedJob,
        total,
        setTotal,
      }}
    >
      {children}
    </SavedJobsContext.Provider>
  );
};
