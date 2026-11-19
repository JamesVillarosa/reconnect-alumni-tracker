import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const DemoSignUpPage: React.FC = () => {
  // State variables to manage form inputs
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [graduationYear, setGraduationYear] = useState<number>(2025);
  const [isCurrent, setIsCurrent] = useState<boolean>(true);
  const [company, setCompany] = useState<string>("");
  const [classification, setClassification] = useState<string>("");
  const [industry, setIndustry] = useState<string>("");
  const [tenuredStatus, setTenuredStatus] = useState<boolean>(false);
  const [salaryRange, setSalaryRange] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // Function to handle sign-up request
  const handleSignUp = async () => {
    try {
      // Constructing request payload for backend
      const requestBody: any = {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role: "alumni", // Default role set as alumni
        graduation_year: graduationYear,
        auth_provider: "local", // Authentication provider
        account_status: "Active", // Default account status
        verification_status: "Unverified", // User needs to verify account
      };

      // If user is currently employed, include career details in request
      if (isCurrent) {
        requestBody.current_career = {
          company,
          classification,
          industry,
          tenured_status: tenuredStatus,
          salary_range: salaryRange,
          is_current: isCurrent,
        };
      }

      // Making POST request to backend API for user registration
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/basic/sign-up`, requestBody);
      
      // Setting success message from backend response
      setMessage(response.data.message);
    } catch (error: any) {
      // Handling errors from backend and displaying relevant messages
      const errorMessage = error.response?.data?.detail;
      setMessage(
        Array.isArray(errorMessage) 
          ? errorMessage.map((err) => err.msg).join(", ") 
          : errorMessage || "Signup failed"
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="bg-gray-800 text-white p-8 rounded-xl shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-semibold text-center text-white">Demo Basic Sign Up</h1>

        <div className="mt-4 space-y-3">
          {/* Input fields for user details */}
          <input className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <input className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          <input className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" type="number" placeholder="Graduation Year" value={graduationYear} onChange={(e) => setGraduationYear(Number(e.target.value))} required />

          {/* Checkbox for employment status */}
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="w-5 h-5 text-blue-500" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} />
            <span className="text-gray-300">Currently Employed</span>
          </label>

          {/* Career details section (only visible if employed) */}
          {isCurrent && (
            <div className="mt-4 bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white">Career Information</h3>
              <input className="w-full mt-2 p-3 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" type="text" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} required />
              <input className="w-full mt-2 p-3 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" type="text" placeholder="Classification" value={classification} onChange={(e) => setClassification(e.target.value)} required />
              <input className="w-full mt-2 p-3 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" type="text" placeholder="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} required />
              <input className="w-full mt-2 p-3 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" type="text" placeholder="Salary Range" value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} required />

              <label className="flex items-center space-x-2 mt-3">
                <input type="checkbox" className="w-5 h-5 text-blue-500" checked={tenuredStatus} onChange={(e) => setTenuredStatus(e.target.checked)} />
                <span className="text-gray-300">Tenured Status</span>
              </label>
            </div>
          )}
        </div>

        {/* Button to trigger sign-up process */}
        <button onClick={handleSignUp} className="w-full mt-4 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200">
          Sign Up
        </button>

        {/* Displaying backend response messages */}
        {message && <p className="mt-4 text-center text-blue-400">{message}</p>}

        {/* Link to sign-in page for existing users */}
        <p className="mt-6 text-center text-gray-400">
          Already have an account?{" "}
          <Link to="/demo/sign-in" className="text-blue-500 hover:underline">
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
};

export default DemoSignUpPage;
