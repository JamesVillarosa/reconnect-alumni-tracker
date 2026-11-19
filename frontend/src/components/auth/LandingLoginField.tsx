import { useState, useEffect } from "react";
import { Mail, Undo2 } from "lucide-react";
import { useAuthContext } from "../../hooks/useAuthContext";
import axios from "axios";
import { toast, toastPromise } from "../../pages/utils/ToastFxn";

interface LandingLoginFieldProps {
  toggleEmailAuth: boolean;
  showPassword: boolean;
  setShowPasswordVisible: (visible: boolean) => void;
  showPasswordVisible: boolean;
  setShowPassword: (show: boolean) => void;
  setToggleEmailAuth: (toggle: boolean) => void;
}

function LandingLoginField({
  toggleEmailAuth,
  showPassword,
  setShowPasswordVisible,
  showPasswordVisible,
  setShowPassword,
  setToggleEmailAuth,
}: LandingLoginFieldProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true); 
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const { dispatch } = useAuthContext();
  const [loading, setLoading] = useState(false);

  // validate email format
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(
      email && !emailRegex.test(email) ? "Invalid email address" : ""
    );
  };

  // validate password (only if not empty)
  const validatePassword = () => {
    setPasswordError(
      password && password.length < 8
        ? "Password must be at least 8 characters"
        : ""
    );
  };

  // check if form is valid
  useEffect(() => {
    const isEmailValid = email && !emailError;
    const isPasswordValid =
      !password || (password.length >= 8 && !passwordError);
    setIsFormValid((isEmailValid && isPasswordValid) as boolean);
  }, [email, emailError, password, passwordError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    setLoading(true);
    try {
      const user = await toastPromise(
        (async () => {
          // sign in
          await axios.post(
            `${import.meta.env.VITE_API_URL}/basic/sign-in`,
            { email, password, rememberMe },
            { withCredentials: true }
          );

          // get user data
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/auth/validate_user`,
            { withCredentials: true }
          );

          const user = response.data.user;
          if (!user) throw new Error("User not found after login");

          // dispatch user data
          dispatch({ type: "LOGIN", payload: user });
          return user;
        })(),
        {
          loading: {
            title: "Signing In...",
            description: "Please wait while we log you in.",
            type: "info",
          },
          success: undefined,
          error: {
            title: "Login Failed",
            description: "Invalid credentials or server error.",
            type: "error",
          },
        }
      );

      // Welcome Back message
      toast({
        title: "Welcome Back!",
        description: `Hello, ${user.first_name || "User"}`,
        isLoading: false,
        type: "success",
      });
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      sessionStorage.removeItem("firstName");
      setLoading(false);
    }
  };

  return (
    <fieldset
      className={
        "flex flex-col items-start justify-center w-full gap-3 p-2 fieldset border-base-300 " +
        (toggleEmailAuth ? "" : "hidden")
      }
    >
      <form onSubmit={handleSubmit} className="w-full">
        {/* EMAIL INPUT */}
        <div className="relative w-full">
          <label className="text-lg">Email</label>
          <input
            type="email"
            className={`w-full h-10 px-4 pr-12 text-gray-500 border-0 focus:outline-white input rounded-3xl validator ${
              emailError ? "border-red-500" : ""
            }`}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={validateEmail}
            required
          />
          <Mail
            className="absolute text-gray-300 transform -translate-y-1/2 right-4 top-12"
            size={20}
          />
          {emailError && (
            <p className="mt-2 ml-2 text-xs text-orange-300">{emailError}</p>
          )}
        </div>

        {/* PASSWORD INPUT */}
        <div className="relative w-full">
          <label className="text-lg">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            className="w-full h-10 px-4 pr-10 text-gray-500 border-0 focus:outline-white input rounded-3xl"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setShowPasswordVisible(e.target.value.length > 0);
            }}
            onBlur={validatePassword}
          />
          {passwordError && (
            <p className="mt-2 ml-2 text-xs text-orange-300">{passwordError}</p>
          )}

          {showPasswordVisible && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute transform translate-y-1/4 right-5 top-[2.2rem] hover:text-gray-700 text-Secondary duration-[0]"
            >
              {showPassword ? (
                <p className="duration-200 hover:text-Primary">HIDE</p>
              ) : (
                <p className="duration-200 hover:text-Primary">SHOW</p>
              )}
            </button>
          )}
        </div>

        {/* REMEMBER ME AND FORGOT PASSWORD */}
        <div className="flex flex-row justify-between w-full px-2 pt-1 text-white">
          <label className="text-white fieldset-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="text-white scale-90 bg-white border-white checkbox checkbox-primary"
            />
            Remember me for 30 days
          </label>
          <a href="/forgot-password" className="self-center font-bold">
            Forgot password
          </a>
        </div>

        {/* EMAIL SIGN IN BUTTON */}
        <div className="flex flex-col items-center justify-center w-full gap-8">
          <button
            type="submit" // Change to submit
            className={`w-full mt-3 text-base text-white transition-all duration-200 bg-transparent border-2 border-white rounded-full btn h-14 ${
              isFormValid
                ? "hover:bg-white hover:text-Primary active:brightness-90"
                : "opacity-60 cursor-not-allowed"
            }`}
            disabled={!isFormValid}
            onClick={() => setLoading(true)} // set loading state
          >
            {loading ? "" : "Log in"}{" "}
            {/* change button text based on loading state */}
            {loading && (
              <span className="loading loading-spinner loading-lg"></span>
            )}{" "}
            {/* show loader if loading */}
          </button>
          {/* GO BACK TO OAUTH OPTIONS BUTTON */}
          <button
            onClick={() => setToggleEmailAuth(false)}
            className="flex items-center justify-center h-12 text-sm font-normal text-white transition-all duration-200 bg-transparent border-2 border-white rounded-full min-w-1/2 active:brightness-90 hover:bg-Primary hover:border-Primary btn"
          >
            <Undo2 size={17} strokeWidth={2.5} />
            Login via Google instead
          </button>
        </div>
      </form>
    </fieldset>
  );
}

export default LandingLoginField;
