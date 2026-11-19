import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useAuthContext();

  useEffect(() => {
    const validate_user = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/validate_user`,
        {
          method: "GET",
          credentials: "include", // Required to send the HTTP-only cookie
        }
      );

      if (response.ok) {
        const user = (await response.json()).user;
        dispatch({ type: "LOGIN", payload: user }); // Log in the user in the frontend context
      }
    };

    validate_user();
  }, [location, navigate]);

  return <p>Processing Google login...</p>;
};

export default GoogleCallback;
