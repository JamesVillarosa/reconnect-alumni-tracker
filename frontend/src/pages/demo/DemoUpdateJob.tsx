import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface Job {
  _id: string;
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

const DemoUpdateJob: React.FC = () => {
  const [jobId, setJobId] = useState("");
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    company_name: "",
    location: "",
    job_type: "Full-Time",
    job_setup: "Onsite",
    salary_range: "",
    description: "",
    application_link: "",
    flagged: false,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchJob = async () => {
    if (!jobId.trim()) {
      setError("Please enter a job ID");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");
    
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/jobs/${jobId}`
      );
      const job = response.data;
      setCurrentJob(job);
      
      // Pre-fill the form with current job data
      setFormData({
        title: job.title,
        company_name: job.company_name,
        location: job.location,
        job_type: job.job_type,
        job_setup: job.job_setup,
        salary_range: job.salary_range || "",
        description: job.description,
        application_link: job.application_link,
        flagged: job.flagged,
      });
      
      setMessage("Job loaded successfully. Update any fields below.");
    } catch (error: any) {
      setCurrentJob(null);
      setError(error.response?.data?.detail || "Failed to fetch job");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" && e.target instanceof HTMLInputElement
          ? e.target.checked
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobId.trim()) {
      setError("Please enter a job ID first");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/jobs/${jobId}`,
        formData
      );

      console.log(response);
      
      setMessage("Job updated successfully!");
      
      // Refresh the current job data
      const updatedJob = await axios.get(
        `${import.meta.env.VITE_API_URL}/jobs/${jobId}`
      );
      setCurrentJob(updatedJob.data);
    } catch (error: any) {
      setMessage("");
      setError(error.response?.data?.detail || "Failed to update job");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Update Job</h1>
        
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            placeholder="Enter Job ID to update"
            className="flex-1 p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchJob}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Load Job"}
          </button>
        </div>

        {error && <p className="text-red-400 mb-4">{error}</p>}
        {message && <p className="text-green-400 mb-4">{message}</p>}

        {currentJob && (
          <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Job Title */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {/* Company Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Company</label>
                <input
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {/* Location */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Location</label>
                <input
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {/* Job Type */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Job Type</label>
                <select
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="job_type"
                  value={formData.job_type}
                  onChange={handleChange}
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              
              {/* Job Setup */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Work Setup</label>
                <select
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="job_setup"
                  value={formData.job_setup}
                  onChange={handleChange}
                >
                  <option value="Onsite">Onsite</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              
              {/* Salary Range */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Salary Range (Optional)</label>
                <input
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  name="salary_range"
                  placeholder="e.g., PHP 50,000 - 70,000"
                  value={formData.salary_range}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            {/* Description */}
            <div className="mt-4">
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* Application Link */}
            <div className="mt-4">
              <label className="block text-sm text-gray-400 mb-1">Application Link</label>
              <input
                className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                name="application_link"
                value={formData.application_link}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* Flagged Checkbox */}
            <div className="mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="flagged"
                  checked={formData.flagged}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-gray-400">Flag as inappropriate</span>
              </label>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 p-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50"
            >
              {isLoading ? "Updating..." : "Update Job"}
            </button>
          </form>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">How to use this demo</h2>
          <ol className="list-decimal pl-5 space-y-2 text-gray-300">
            <li>Enter a valid job ID (you can get IDs from the "Get Job  by ID" page)</li>
            <li>Click "Load Job" to fetch the current job details</li>
            <li>Modify any fields you want to update</li>
            <li>Click "Update Job" to save your changes</li>
          </ol>
        </div>

        <div className="mt-8 flex gap-4">
          <Link
            to="/demo/get-job"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          >
            View Single Job
          </Link>
          <Link
            to="/demo/get-all-jobs"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            View All Jobs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DemoUpdateJob;