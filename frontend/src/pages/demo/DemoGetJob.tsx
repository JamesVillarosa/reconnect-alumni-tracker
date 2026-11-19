import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface Job {
  _id: string;
  authorId: string;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  job_setup: string;
  salary_range?: string;
  description: string;
  application_link: string;
  flagged: boolean;
}

const DemoGetAllJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = 10;

  const fetchJobs = async () => {
    try {
      setError(null); // Clear previous error
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/jobs`, {
        withCredentials: true,
        params: { skip, limit },
      });
  
      const { jobs: newJobs, hasMore } = response.data;
  
      // Append new jobs to existing ones
      setJobs(prevJobs => [...prevJobs, ...newJobs]);
  
      // Update skip for next fetch
      setSkip(prevSkip => prevSkip + limit);
  
      // Update whether there are more jobs to load
      setHasMore(hasMore);
    } catch (error: any) {
      setError(error.response?.data?.detail || "Failed to fetch jobs");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      {/* Get Jobs Button */}
      <div className="flex space-x-6">
        <button
          onClick={fetchJobs}
          disabled={!hasMore}
          className="cursor-pointer mb-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
        >
          Get Jobs
        </button>
        <Link
          to="/demo/post-job"
          className="mb-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 inline-block text-center"
        >
          Post a Job
        </Link>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-400">{error}</p>}

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {jobs.map((job) => (
          <div key={job._id} className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <p className="text-gray-400">{job.company_name}</p>
            <p className="mt-2">{job.location} • {job.job_type} • {job.job_setup}</p>
            {job.salary_range && <p className="mt-1 text-green-400">💰 {job.salary_range}</p>}
            <p className="mt-3 text-gray-300 text-ellipsis">{job.description}</p>
            <p>{job.flagged == true ? "Inappropriate" : "Appropriate"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DemoGetAllJobs;
