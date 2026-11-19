import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const DemoSignInPage: React.FC = () => {
  // State to store email and password input values
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // Function to handle user login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents page reload on form submission
    try {
      // Sending a POST request to the backend sign-in endpoint
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/basic/sign-in`, {
        email,
        password,
      });

      // If login is successful, set success message and store token in localStorage
      setMessage("Login successful!");
      localStorage.setItem("token", response.data.access_token);
    } catch (error: any) {
      // Handle errors and display appropriate message
      setMessage(error.response?.data?.detail[0].msg || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="bg-gray-800 text-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <form onSubmit={handleLogin}>
          <h1 className="text-2xl font-semibold text-center">Sign In</h1>
          <div className="mt-4 space-y-3">
            {/* Email input field */}
            <input
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {/* Password input field */}
            <input
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {/* Submit button to trigger login request */}
          <button
            type="submit"
            className="w-full mt-4 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
          >
            Sign In
          </button>
        </form>

        {/* Display success or error messages */}
        {message && <p className="mt-4 text-center text-blue-400">{message}</p>}

        {/* Redirect to Sign Up page if user doesn't have an account */}
        <p className="mt-4 text-center text-gray-400">
          Don't have an account?{" "}
          <Link to="/demo/sign-up" className="text-blue-500 hover:underline">
            Sign up instead
          </Link>
        </p>
      </div>
    </div>
  );
};

export default DemoSignInPage;
