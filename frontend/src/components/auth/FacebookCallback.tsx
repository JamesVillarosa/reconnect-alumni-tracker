import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";

const FacebookCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useAuthContext();

  useEffect(() => {
    const validate_user = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/validate_user`, // Use the environment variable for the API URL
        {
          method: "GET",
          credentials: "include", // Ensure that cookies (e.g., session cookies) are included in the request
        }
      );
      if (response.ok) {
        const user = (await response.json()).user;
        dispatch({ type: "LOGIN", payload: user }); // Dispatch the LOGIN action to update the state
        navigate("/"); // Redirect to the home page after successful login
      }
    }

    validate_user()
  }, [location, navigate]);

  return <p>Processing Facebook login...</p>;
};

export default FacebookCallback;
