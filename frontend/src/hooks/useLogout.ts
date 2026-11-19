import { useAuthContext } from "./useAuthContext";
import { toastPromise } from "../pages/utils/ToastFxn";
import axios from "axios";

export const useLogout = () => {
  const { dispatch } = useAuthContext();

  const logout = async () => {
    try {
      await toastPromise(
        axios.post(
          `${import.meta.env.VITE_API_URL}/auth/logout`,
          {},
          {
            withCredentials: true,
          }),
        {
          loading: {
            title: "Logging Out...",
            description: "Please wait while we log you out.",
            type: "info",
          },
          success: {
            title: "Logged Out!",
            description: "We have successfully logged you out.",
            type: "success",
          },
          error: {
            title: "Logout Failed",
            description: "There was an error logging you out.",
            type: "error",
          },
        }
      )
        .then(() => {
          localStorage.removeItem("recentJobs");
          dispatch({ type: "LOGOUT" });
        })
        .catch(() => {});
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return { logout };
};
