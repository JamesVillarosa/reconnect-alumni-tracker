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
  created_at?: string;
  updated_at?: string;
}

// Sample job IDs
const SAMPLE_JOB_IDS = [
  "67e84ab400be6d5921154344",
  "67ea074f133a02c97398263a",
  "67e45ed85ba94c66e5d99c5f",
  "67e45f125ba94c66e5d99c61"
];

const DemoGetJobById: React.FC = () => {
  const [jobId, setJobId] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchJob = async () => {
    if (!jobId.trim()) {
      setError("Please enter a job ID");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/jobs/${jobId}`
      );
      setJob(response.data);
    } catch (error: any) {
      setJob(null);
      setError(error.response?.data?.detail || "Failed to fetch job");
    } finally {
      setIsLoading(false);
    }
  };

  // get job when clicking  the sample id.
  const handleSampleIdClick = (sampleId: string) => {
    setJobId(sampleId);
    // fetchJob();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Get Job by ID</h1>
        
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            placeholder="Enter Job ID"
            className="flex-1 p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchJob}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Get Job"}
          </button>
        </div>

        {/* Sample IDs Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-400">Try these sample IDs:</h3>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_JOB_IDS.map((sampleId) => (
              <button
                key={sampleId}
                onClick={() => handleSampleIdClick(sampleId)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-sm text-gray-300 transition"
              >
                {sampleId}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Click any ID above to copy it to the input field
          </p>
        </div>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        {job && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <p className="text-gray-400">{job.company_name}</p>
            <p className="mt-2">
              {job.location} • {job.job_type} • {job.job_setup}
            </p>
            {job.salary_range && (
              <p className="mt-1 text-green-400">💰 {job.salary_range}</p>
            )}
            <p className="mt-3 text-gray-300">{job.description}</p>
            <p className="mt-2">
              <a
                href={job.application_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Apply Here
              </a>
            </p>
            <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
              <p>Posted by: {job.authorId}</p>
              <p>Status: {job.flagged ? "⚠️ Flagged" : "✅ Active"}</p>
            </div>
            {job.created_at && (
              <p className="text-xs text-gray-500 mt-2">
                Created: {new Date(job.created_at).toLocaleString()}
              </p>
            )}
            {job.updated_at && (
              <p className="text-xs text-gray-500">
                Last updated: {new Date(job.updated_at).toLocaleString()}
              </p>
            )}
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">How to use this demo</h2>
          <ol className="list-decimal pl-5 space-y-2 text-gray-300">
            <li>Enter a job ID manually or click a sample ID above</li>
            <li>Click "Get Job" to fetch the job details</li>
            <li>View the job information displayed below</li>
          </ol>
        </div>

        <div className="mt-8 flex gap-4">
          <Link
            to="/demo/get-all-jobs"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          >
            View All Jobs
          </Link>
          <Link
            to="/demo/update-job"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Try Updating a Job
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DemoGetJobById;