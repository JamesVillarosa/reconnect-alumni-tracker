import React, { useState, useEffect, FormEvent } from "react";
import Textfield from "../components/Textfield";
import Button from "../components/Button";
import Footer from "../components/auth/Footer";
import ReConnect from "../components/auth/ReConnect";

import {
  Mail,
  Lock,
  CircleUser,
  Eye,
  EyeOff,
  CheckCircle,
  Circle,
} from "lucide-react";

import { showToast } from "../components/utils/ToastFxn";


// import images
import Logo from "../assets/logos/logo.png";
import ICSLogo from "../assets/logos/ics.png";
import UPLBLogo from "../assets/logos/up.png";
import FBLogo from "../assets/logos/fb.png";
import GoogleLogo from "../assets/logos/google.png";
import AuthDropdown from "../components/auth/AuthDropdown";
import { useAuthContext } from "../hooks/useAuthContext";

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [firstname, setFirstName] = useState<string>("");
  const [lastname, setLastName] = useState<string>("");

  // password rule checks
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*.]/.test(password);
  const isMinLength = password.length >= 8;

  const isPasswordValid =
    hasUppercase && hasNumber && hasSpecialChar && isMinLength;

  const [showWorkDetails, setShowWorkDetails] = useState<boolean>(false); // indicator for next step of traditonal sign up

  const [studentNumber, setStudentNumber] = useState<string>("");

  // work details
  const [company, setCompany] = useState<string>("");
  const [classification, setClassification] = useState<string>("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [industryValue, setIndustryValue] = useState<string>("");
  const [tenureStatus, setTenureStatus] = useState<string>("");
  const [salaryRange, setSalaryRange] = useState<string>("");
  const [isNotWorking, setIsNotWorking] = useState<boolean>(false);
  const [ratherNotSay, setRatherNotSay] = useState<boolean>(false);
  const [isWorkDetailsDisabled, setIsWorkDetailsDisabled] =
    useState<boolean>(false);
  const { dispatch } = useAuthContext();

  // values
  const classificationOptions: string[] = ["NGO", "Private", "Government"];
  const industryOptions: string[] = [
    "Agriculture, Forestry, Fishing",
    "Construction",
    "Finance, Insurance, and Real State",
    "Manufacturing",
    "Mining",
    "Public Administration",
    "Retail Trade",
    "Services",
    // "Transportation, Communications, Electric, Gas, and Sanitary Services",
    "Wholesale Trade",
    "Other",
  ];
  const tenureOptions: string[] = ["Contractual", "Permanent"];
  const salaryRangeOptions: string[] = [
    "Less than ₱9,100",
    "₱9,100 to ₱18,199",
    "₱18,200 to ₱36,399",
    "₱36,400 to ₱63,699",
    "₱63,700 to ₱109,199",
    "₱109,200 to ₱181,999",
    "At least ₱182,000 and up",
  ];

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = urlParams.get("access_token");

    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
      console.log("OAuth Access Token:", accessToken);
    }
  }, []);

  const handleAgreeAndContinue = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // prevent page from reloading
    setShowWorkDetails(true); // proceed to next step of tranditional sign up (ask for work details)
  };

  const handleDisableWorkDetails = (
    isNotWorking: boolean,
    ratherNotSay: boolean
  ) => {
    if (isNotWorking || ratherNotSay) {
      setCompany("");
      setClassification("");
      setSelectedIndustry("");
      setIndustryValue("");
      setTenureStatus("");
      setSalaryRange("");
      setIsWorkDetailsDisabled(true);
    } else {
      setIsWorkDetailsDisabled(false);
    }
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // print out the data to be sent to the backend for debugging
    // console.log("Sending signup data:", {
    //   email: email,
    //   password: password,
    //   first_name: firstname,
    //   last_name: lastname,
    //   current_career: {
    //     company: company,
    //     classification: classification,
    //     industry: industryValue,
    //     tenured_status: tenureStatus === "Permanent",
    //     salary_range: salaryRange,
    //     is_current: true, // Assuming is_current should always be true for the current career.
    //   },
    //   auth_provider: "local",
    //   account_status: "Active",
    //   verification_status: "Unverified",
    // });

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/basic/sign-up`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email,
          password: password,
          student_number: studentNumber,
          first_name: firstname,
          last_name: lastname,
          role: "alumni", // Setting role to alumni
          current_career: {
            company: company,
            classification: classification,
            industry: industryValue,
            tenured_status: tenureStatus === "Permanent",
            salary_range: salaryRange,
            is_current: true,
          },
          auth_provider: "local",
          account_status: "Active",
          verification_status: "Unverified",
        }),
      });

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
        showToast("success", "Registration Successful", `Welcome, ${user.first_name || "User"}!`);
      } else {
        const errorData = await response.json();
        console.error("Registration failed:", errorData);
        showToast("error", "Registration Failed", errorData.message || "An error occurred during registration.");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      showToast("error", "Registration Failed", "An error occurred during registration.");
    }
  };

  const handleSignupWithGoogle = () => {
    const googleClientId = "YOUR_GOOGLE_CLIENT_ID";
    const redirectUri = "http://google/sign-in";
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?
    client_id=${googleClientId}
    &redirect_uri=${redirectUri}
    &response_type=token
    &scope=email%20profile`;

    window.location.href = googleAuthUrl;
  };

  const handleSignupWithFacebook = () => {
    const facebookClientId = "YOUR_FACEBOOK_CLIENT_ID";
    const redirectUri = "http://facebook/auth/signin";
    const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?
    client_id=${facebookClientId}
    &redirect_uri=${redirectUri}
    &response_type=token
    &scope=email,public_profile`;

    window.location.href = facebookAuthUrl;
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-Tertiary">
      {/* header part with logos and app name */}
      <div className="flex flex-row items-center justify-center w-full md:justify-between pt-7 pl-15 pr-15">
        <div className="flex flex-row items-center justify-center">

          <a href="https://uplb.edu.ph/">
            <img
              src={UPLBLogo}
              alt="UPLBLogo"
              className="h-auto m-1 w-13 sm:w-17 md:w-19 lg:w-21"
            />
          </a>
          <a href="https://ics.uplb.edu.ph/">
            <img
              src={ICSLogo}
              alt="ICS Logo"
              className="w-12 h-auto m-1 sm:w-16 md:w-18 lg:w-20"
            />
          </a>
          <a href="/user">
            <img
              src={Logo}
              alt="Logo"
              className="w-12 h-auto m-1 sm:w-16 md:w-18 lg:w-20"
            />
          </a>

        </div>
        <div className="hidden md:block">
          <ReConnect size="text-3xl" />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center w-full">
        <h1 className="w-full px-10 pt-3 mb-6 text-3xl font-bold text-center lg:text-4xl text-Primary lg:pt-1 lg:pb-8">
          {showWorkDetails ? "Tell us more" : "Connect with us and your peers"}
        </h1>
        {/* sign up card */}
        <div
          className={`w-full bg-white px-5 py-2 mb-15 rounded-2xl max-w-sm md:max-w-lg lg:max-w-xl ${showWorkDetails ? "hidden" : ""
            }`}
        >
          <form onSubmit={handleAgreeAndContinue}>
            <Textfield
              label="First name*"
              type="text"
              placeholder="Enter your first name"
              value={firstname}
              icon={<CircleUser size={20} className="text-[#467EBA]" />}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Textfield
              label="Last name*"
              type="text"
              placeholder="Enter your last name"
              value={lastname}
              icon={<CircleUser size={20} className="text-[#467EBA]" />}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            <Textfield
              label="Email*"
              type="email"
              placeholder="Enter your email"
              value={email}
              icon={<Mail size={20} className="text-[#467EBA]" />}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {/* TODO: Implement strong password using preline as suggested by ui/ux team */}
            <div className="relative">
              <Textfield
                label="Password*"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                icon={<Lock />}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2/9 transform focus:outline-none text-[#467EBA]"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>

              <ul className="mt-2 space-y-1 text-sm text-Primary">
                <li className="flex items-center">
                  {hasUppercase ? (
                    <CheckCircle className="mr-2 text-Primary" />
                  ) : (
                    <Circle className="mr-2 text-Gray" />
                  )}
                  Includes uppercase letter
                </li>
                <li className="flex items-center">
                  {hasNumber ? (
                    <CheckCircle className="mr-2 text-Primary" />
                  ) : (
                    <Circle className="mr-2 text-Gray" />
                  )}
                  Includes number
                </li>
                <li className="flex items-center">
                  {hasSpecialChar ? (
                    <CheckCircle className="mr-2 text-Primary" />
                  ) : (
                    <Circle className="mr-2 text-Gray" />
                  )}
                  Includes special character (.!@#$%^&*)
                </li>
                <li className="flex items-center">
                  {isMinLength ? (
                    <CheckCircle className="mr-2 text-Primary" />
                  ) : (
                    <Circle className="mr-2 text-Gray" />
                  )}
                  At least 8 characters
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={!isPasswordValid}
              className={`w-full py-2 mt-4 font-semibold text-md text-white rounded-xl transition 
    ${
      isPasswordValid
        ? "bg-Gradient2 hover:bg-Gradient1 hover:brightness-110 cursor-pointer"
        : "bg-gray-300 cursor-not-allowed"
    }`}
            >
              Agree & Continue
            </button>
          </form>

          <div className="flex items-center w-full pt-4">
            <hr className="flex-grow border-t border-[#D9D9D9]" />
            <span className="text-sm font-medium text-black px-7">or</span>
            <hr className="flex-grow border-t border-[#D9D9D9]" />
          </div>

          <div>
            <Button onClick={handleSignupWithGoogle} variant="minor">
              <div className="flex flex-row items-center justify-center">
                <div>
                  <img
                    src={GoogleLogo}
                    alt="Google logo"
                    className="w-5 mr-2 rounded-full"
                  />
                </div>
                <p>Sign up with Google</p>
              </div>
            </Button>
            <Button onClick={handleSignupWithFacebook} variant="minor">
              <div className="flex flex-row items-center justify-center">
                <div>
                  <img
                    src={FBLogo}
                    alt="Facebook logo"
                    className="w-5 mr-2 rounded-full"
                  />
                </div>
                <p>Sign up with Facebook</p>
              </div>
            </Button>
          </div>
          <div className="py-2 mt-2 text-center">
            <span className="text-sm md:text-md lg:text-base text-Primary">
              Already have an account?
              <a
                href="/"
                className="pl-1 pr-1 font-bold text-Primary hover:text-Secondary"
              >
                Sign in
              </a>
            </span>
          </div>
        </div>

        {/* work details cards */}
        <div className={showWorkDetails ? "" : "hidden"}>
          {/* left portion */}
          <form
            id="work_details"
            onSubmit={handleSignup}
            className="flex flex-col gap-10 md:flex-row"
          > 
            <div>
              <fieldset>
                <legend className="py-2 pl-2 mb-1 font-semibold text-md lg:text-lg text-Primary">
                  What is your student number?
                </legend>
                <div
                  className={`w-full bg-white px-5 py-2 mb-5 rounded-2xl max-w-sm md:max-w-lg lg:max-w-xl lg:min-w-sm`}
                >
                  <Textfield
                    label="Student Number"
                    type="text"
                    placeholder="YYYY-XXXXX"
                    value={studentNumber}
                    onChange={(e) => setStudentNumber(e.target.value)}
                    required={true}
                  />
                </div>
              </fieldset>
              <fieldset>
                <legend className="py-2 pl-2 mb-1 font-semibold text-md lg:text-lg text-Primary">
                  Where do you currently work?
                </legend>
                <div
                  className={`w-full bg-white px-5 py-2 mb-5 rounded-2xl max-w-sm md:max-w-lg lg:max-w-xl lg:min-w-sm`}
                >
                  <Textfield
                    label="Employer/Company"
                    type="text"
                    placeholder=""
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required={!isWorkDetailsDisabled}
                  />
                  {/* Classification */}
                  <AuthDropdown
                    id="classification_dropdown"
                    label="Classification"
                    value={classification}
                    placeholder="Click to select a choice"
                    options={classificationOptions}
                    disabled={isWorkDetailsDisabled}
                    onChange={(e) => setClassification(e.target.value)}
                  />
                  <h1 className="pt-2 pl-2 mb-1 font-semibold text-md lg:text-lg text-Primary">
                    Or...
                  </h1>
                  <label className="flex items-center gap-2 pb-2 pl-3">
                    <input
                      type="checkbox"
                      className="border rounded-md checkbox border-Primary text-Primary"
                      checked={isNotWorking}
                      onChange={(e) => {
                        if (ratherNotSay) {
                          setRatherNotSay(false);
                        }
                        setIsNotWorking(e.target.checked);
                        handleDisableWorkDetails(e.target.checked, ratherNotSay);
                      }}
                    />
                    <span className="text-Primary">
                      I am currently not working
                    </span>
                  </label>
                  <label className="flex items-center gap-2 pb-4 pl-3">
                    <input
                      type="checkbox"
                      className="border rounded-md checkbox border-Primary text-Primary"
                      checked={ratherNotSay}
                      onChange={(e) => {
                        if (isNotWorking) {
                          setIsNotWorking(false);
                        }
                        setRatherNotSay(e.target.checked);
                        handleDisableWorkDetails(isNotWorking, e.target.checked);
                      }}
                    />
                    <span className="text-Primary">I would rather not say</span>
                  </label>
                </div>
              </fieldset>
            </div>
            <div>
              {/* Industry Section */}
              <fieldset>
                <legend className="py-2 pl-2 mb-1 font-semibold text-md lg:text-lg text-Primary">
                  What industry are you part of?
                </legend>
                <div
                  className={`w-full bg-white px-5 py-2 mb-5 rounded-2xl max-w-sm md:max-w-lg lg:max-w-xl lg:min-w-sm`}
                >
                  <AuthDropdown
                    id="industry_dropdown"
                    value={selectedIndustry}
                    placeholder="Click to select a choice"
                    options={industryOptions}
                    disabled={isWorkDetailsDisabled}
                    onChange={(e) => {
                      setSelectedIndustry(e.target.value);
                      if (e.target.value != "Other") {
                        setIndustryValue(e.target.value);
                      }
                    }}
                  />
                  {selectedIndustry === "Other" && (
                    <Textfield
                      label=""
                      type="text"
                      placeholder="Enter industry"
                      value={industryValue}
                      onChange={(e) => setIndustryValue(e.target.value)}
                      required
                    />
                  )}
                </div>
              </fieldset>
              {/* Tenured Status Section */}
              <fieldset>
                <legend className="py-2 pl-2 mb-1 font-semibold text-md lg:text-lg text-Primary">
                  What is your tenure status at work?
                </legend>
                <div
                  className={`w-full bg-white px-5 py-2 mb-5 rounded-2xl max-w-sm md:max-w-lg lg:max-w-xl lg:min-w-sm`}
                >
                  <AuthDropdown
                    id="tenure_dropdown"
                    value={tenureStatus}
                    placeholder="Click to select a choice"
                    options={tenureOptions}
                    disabled={isWorkDetailsDisabled}
                    onChange={(e) => setTenureStatus(e.target.value)}
                  />
                </div>
              </fieldset>
              {/* Salary Range Section */}
              <fieldset>
                <legend className="py-2 pl-2 mb-1 font-semibold text-md lg:text-lg text-Primary">
                  Please tell us your salary range
                </legend>
                <div
                  className={`w-full bg-white px-5 py-2 mb-5 rounded-2xl max-w-sm md:max-w-lg lg:max-w-xl lg:min-w-sm`}
                >
                  <AuthDropdown
                    id="salary_dropdown"
                    value={salaryRange}
                    placeholder="Click to select a choice"
                    options={salaryRangeOptions}
                    disabled={isWorkDetailsDisabled}
                    onChange={(e) => setSalaryRange(e.target.value)}
                  />
                </div>
              </fieldset>
            </div>
          </form>
        </div>
        <button
          type="submit"
          form="work_details"
          className={`w-full max-w-80 mt-4 mb-20 bg-Gradient2 text-white font-bold hover:bg-Gradient1 hover:brightness-110 py-2 ${showWorkDetails ? "" : "hidden"
            } text-md lg:text-md font-semibold rounded-xl transition`}
        >
          Finish
        </button>
      </div>

      {/* footer */}
      <div className="flex w-full">
        <Footer />
      </div>
    </div>
  );
};

export default SignUpPage;
