import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const DemoPostJobPage: React.FC = () => {
  // State for job posting form inputs
  const [formData, setFormData] = useState({
    authorId: "65f4e1a07d98f3a8a4e8b2c3", // User ID of the job poster
    title: "",
    company_name: "",
    location: "",
    job_type: "Internship", // Default value (modify as needed)
    job_setup: "Onsite", // Default value (modify as needed)
    salary_range: "",
    description: "",
    application_link: "",
    flagged: false, // Default to false
  });

  const [message, setMessage] = useState<string>("");

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" && e.target instanceof HTMLInputElement ? e.target.checked : value,
    }));
  };


  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/jobs`, formData, {
        withCredentials: true,
      });
      setMessage("Job posted successfully!");
      console.log(response.data);

      // Clear form after successful submission
      setFormData({
        authorId: "",
        title: "",
        company_name: "",
        location: "",
        job_type: "Internship",
        job_setup: "Onsite",
        salary_range: "",
        description: "",
        application_link: "",
        flagged: false,
      });
    } catch (error: any) {
      setMessage(error.response?.data?.detail || "Failed to post job");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="bg-gray-800 text-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <h1 className="text-2xl font-semibold text-center">Post a Job</h1>
          <div className="mt-4 space-y-3">
            {/* Author ID */}
            <input
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              name="authorId"
              placeholder="Your User ID (should be valid ObjectID)"
              value={formData.authorId}
              onChange={handleChange}
              required
            />
            {/* Job Title */}
            <input
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              name="title"
              placeholder="Job Title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            {/* Company Name */}
            <input
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              name="company_name"
              placeholder="Company Name"
              value={formData.company_name}
              onChange={handleChange}
              required
            />
            {/* Location */}
            <input
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              required
            />
            {/* Job Type */}
            <select
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="job_type"
              value={formData.job_type}
              onChange={handleChange}
            >
              <option value="Internship">Internship</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
            </select>
            {/* Job Setup */}
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
            {/* Salary Range */}
            <input
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              name="salary_range"
              placeholder="Salary Range (Optional)"
              value={formData.salary_range}
              onChange={handleChange}
            />
            {/* Job Description */}
            <textarea
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="description"
              placeholder="Job Description"
              value={formData.description}
              onChange={handleChange}
              required
            />
            {/* Application Link */}
            <input
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              name="application_link"
              placeholder="Application Link"
              value={formData.application_link}
              onChange={handleChange}
              required
            />
            {/* Flagged Checkbox */}
            <label className="flex items-center space-x-2 text-sm text-gray-400">
              <input
                type="checkbox"
                name="flagged"
                checked={formData.flagged}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span>Flag this job as inappropriate</span>
            </label>
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
          >
            Post Job
          </button>
        </form>
        <div className="flex justify-center mt-2">
          <Link to="/demo/get-all-jobs" className="text-blue-500 hover:underline">
            View all jobs
          </Link>
        </div>
        {/* Display success or error messages */}
        {message && <p className="mt-4 text-center text-blue-400">{message}</p>}
      </div>
    </div>
  );
};

export default DemoPostJobPage;
