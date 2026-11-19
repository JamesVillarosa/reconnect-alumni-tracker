import React, { useCallback, useEffect, useRef, useState } from "react";
import UserNavbar from "../../components/UserNavbar";
import ProfilePicPlaceholder from "../../assets/placeholders/pfp_placeholder.avif";
import BGImagePlaceholder from "../../assets/placeholders/bg_placeholder.avif";
import { Ellipsis, Pencil } from "lucide-react";
import ProfileHistoryCard from "../../components/profile/ProfileHistoryCard";
import {
  EditProfileModal,
  ManageCareerEntryModal,
  ManageEducationEntryModal,
} from "../../components/profile/ProfilePageModals";
import { useAuthContext } from "../../hooks/useAuthContext";
import axios from "axios";
import { UserProps } from "../../types/user";
import { CareerEntry } from "../../types/career";
import { EducationEntry } from "../../types/education";
import DesktopNavbar from "../../components/DesktopNavbar";
import { BackAndSettingsHeader } from "../../components/MobileHeaders";
import { Link, useNavigate } from "react-router-dom";
import { UserSurveyBox } from "../../components/profile/SurveyBox";
import JobPostingCard from "../../components/JobPostingCard";
import JobProps from "../../types/job";
import { useSavedJobsContext } from "../../hooks/useSavedJobsContext";
import { CardSkeleton } from "../../components/Skeleton";
import EditProfilePicturesModal from "../../components/profile/EditProfilePicturesModal";
// import { JobCardSkeleton } from "../../components/JobCardSkeleton";
// import { DonationCardSkeleton } from "../../components/donations/DonationCardSkeleton";

// interface ProfileInfoState {
//     username: string;
//     bio: string;
//     location: string;
//     profilePicUrl: string;
//     headerPicUrl: string;
//     // role: RoleEnum | null; // if needed
// }

// // interface EducationEntry {
// //     id: string;
// //     user_id: string;
// //     school_name: string;
// //     degree: string;
// //     logo_url: string | null;
// //     graduation_date?: string | null;
// //     created_at: string;
// //     updated_at: string;

// // }

// interface CareerHistoryStateItem {
//     _id: string;
//     user_id: string;
//     imageSrc: string | null;
//     name: string; // company
//     title: string; // position
//     current: boolean; // is_current
//     dateStarted: string | null; // start_date
//     dateEnded: string | null; // end_date
// }

const UserProfilePage: React.FC = () => {
  const { user } = useAuthContext();
  const [profileInfo, setProfileInfo] = useState({
    username: "Loading...",
    bio: "",
    location: "",
    profilePicUrl: ProfilePicPlaceholder, // Use placeholder initially
    headerPicUrl: BGImagePlaceholder, // Use placeholder initially
  });
  const [userData, setUserData] = useState<UserProps | null>(null);
  const [educationHistory, setEducationHistory] = useState<EducationEntry[]>(
    []
  );
  const [careerHistory, setCareerHistory] = useState<CareerEntry[]>([]);

  const { savedJobs } = useSavedJobsContext();

  const educationModalRef = useRef<HTMLDialogElement>(null);
  const careerModalRef = useRef<HTMLDialogElement>(null);
  const editProfileModalRef = useRef<HTMLDialogElement>(null);
  const editPicturesModalRef = useRef<HTMLDialogElement>(null);

  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  console.log(userData); // just to clear lint error

  const handleShowToast = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000); // Hide after 3s
  }, []);

  // Fetches user details from database
  const fetchUserDetails = useCallback(async () => {
    try {
      // Expect the API to return data matching the 'User' type
      const response = await axios.get<UserProps>(
        `${import.meta.env.VITE_API_URL}/profile`,
        {
          method: "GET",
          withCredentials: true,
        }
      );
      const fetchedUserData = response.data;
      console.log("User data received:", fetchedUserData);
      setUserData(fetchedUserData);

      // Map to profileInfo state
      setProfileInfo({
        username: `${fetchedUserData.first_name} ${fetchedUserData.last_name}`,
        bio: fetchedUserData.biography ?? "",
        location: fetchedUserData.location ?? "",
        profilePicUrl: fetchedUserData.profile_picture || ProfilePicPlaceholder,
        headerPicUrl: fetchedUserData.header_picture || BGImagePlaceholder,
      });
    } catch (error: unknown) {
      // const message = error.response?.status === 401 ? "Unauthorized. Please log in." : "Failed to load profile data.";
      let message = "Failed to load profile data.";
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          message = "Unauthorized. Please log in.";
        }
      }
      handleShowToast(message);
      // Reset state to reflect error
      setProfileInfo((prev) => ({
        ...prev, // Keep pics?
        username: "Error loading profile",
        bio: "",
        location: "",
        verificationStatus: null,
      }));
      setEducationHistory([]);
      setCareerHistory([]);
      setUserData(null);
    }
  }, [handleShowToast]); // Dependency: authUser context (removed to clear lint error: user)

  // Fetches education details from database
  const fetchEducationHistory = useCallback(async () => {
    console.log("Fetching education history...");
    if (!user) return; // Added check

    try {
      const response = await axios.get<EducationEntry[]>( // Expect List[EducationEntryModel]
        `${import.meta.env.VITE_API_URL}/profile/education`,
        { method: "GET", withCredentials: true }
      );
      setEducationHistory(response.data ?? []);
    } catch (error: unknown) {
      // const message = error.response?.status === 401 ? "Unauthorized." : "Failed to load education history.";
      let message = "Failed to load education history.";
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          message = "Unauthorized.";
        }
      }
      handleShowToast(message);
      setEducationHistory([]);
    }
  }, [user, handleShowToast]); // Dependency: user

  // Fetches career details from database
  const fetchCareerHistory = useCallback(async () => {
    console.log("Fetching career history...");
    if (!user) return;

    try {
      const response = await axios.get<CareerEntry[]>( // Expect List[CareerEntryModel]
        `${import.meta.env.VITE_API_URL}/profile/career`,
        { method: "GET", withCredentials: true }
      );
      console.log("Career data received:", response.data);
      setCareerHistory(response.data ?? []);
    } catch (error: unknown) {
      console.error("Error fetching career history:", error);
      // const message = error.response?.status === 401 ? "Unauthorized." : "Failed to load career history.";
      let message = "Failed to load career history.";
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          message = "Unauthorized.";
        }
      }
      handleShowToast(message);
      setCareerHistory([]);
    }
  }, [user, handleShowToast]);

  const handleUpdateSuccess = useCallback(
    (
      message: string,
      // Add a parameter to identify the source of the update
      source: "profile" | "education" | "career"
    ) => {
      handleShowToast(message);
      console.log(
        `handleUpdateSuccess called! Source: ${source}, Message: ${message}`
      );
      console.log(
        `Update successful from: ${source}. Refetching relevant data...`
      );

      // Refetch data based on the source modal
      switch (source) {
        case "profile":
          console.log("Refetching: User Details");
          fetchUserDetails();
          break;
        case "education":
          console.log("Refetching: Education History");
          fetchEducationHistory();
          break;
        case "career":
          console.log("Refetching: Career History");
          fetchCareerHistory();
          break;
        default:
          console.warn(`Unknown source for handleUpdateSuccess: ${source}`);
          // Optionally refetch all as a fallback
          fetchUserDetails();
          fetchEducationHistory();
          fetchCareerHistory();
          break;
      }
    },
    [
      fetchUserDetails,
      fetchEducationHistory,
      fetchCareerHistory,
      handleShowToast,
    ]
  );

  const handlePictureUpdateSuccess = useCallback(
    (message: string, pictureType: "profile" | "header") => {
      handleShowToast(message);
      console.log(
        `Picture update successful: ${pictureType}. Refetching user details.`
      );
      fetchUserDetails(); // Refetch to get new image URLs
    },
    [fetchUserDetails, handleShowToast]
  );

  // useEffects
  useEffect(() => {
    if (user) {
      fetchUserDetails();
      fetchEducationHistory();
      fetchCareerHistory();
    } else {
      setProfileInfo({
        username: "Not logged in",
        bio: "",
        location: "",
        profilePicUrl: ProfilePicPlaceholder,
        headerPicUrl: BGImagePlaceholder,
      });
      setEducationHistory([]);
      setCareerHistory([]);
      setUserData(null);
    }
  }, [user, fetchUserDetails, fetchEducationHistory, fetchCareerHistory]); // fetchUserDetails is stable due to useCallback

  console.log(
    "[UserProfilePage] handleUpdateSuccess type before render:",
    typeof handleUpdateSuccess
  );

  return (
    <>
      <UserNavbar activePage="" />
      <DesktopNavbar activePage="" />
      <BackAndSettingsHeader />

      <div className="flex items-center justify-center overflow-hidden bg-white lg:bg-Tertiary">
        {/* limit the page to 1280px */}
        <div className="max-w-[1280px] w-full flex flex-col justify-center items-center mb-10 lg:mb-15">
          {/* modals */}
          <ManageEducationEntryModal
            modalRef={educationModalRef}
            label="Add"
            notifySuccess={(msg) => handleUpdateSuccess(msg, "education")}
          />
          <ManageCareerEntryModal
            modalRef={careerModalRef}
            label="Add"
            notifySuccess={(msg) => handleUpdateSuccess(msg, "career")}
          />
          <EditProfileModal
            modalRef={editProfileModalRef}
            notifySuccess={(msg) => handleUpdateSuccess(msg, "profile")}
            currentUsernameValue={profileInfo.username}
            currentBioValue={profileInfo.bio}
            currentLocationValue={profileInfo.location}
          />
          <EditProfilePicturesModal
            modalRef={editPicturesModalRef}
            notifySuccess={handlePictureUpdateSuccess} // Use the new handler
            notifyError={(msg) => handleShowToast(msg)} // Use general toast for errors
            currentProfilePicUrl={profileInfo.profilePicUrl}
            currentHeaderPicUrl={profileInfo.headerPicUrl}
          />

          <div className="flex flex-col gap-5 lg:flex-row lg:w-3/4 lg:m-15">
            <div className="flex flex-col lg:w-3/4 lg:gap-10">
              {/* profile card */}
              <div className="relative flex flex-col items-center overflow-hidden lg:rounded-3xl lg:border-ProfileBorder lg:border-[2px] lg:bg-white w-full min-h-[350px]">
                {isLoading ? (
                  <CardSkeleton
                    variant="profile"
                    className="w-full min-h-[350px]"
                  />
                ) : (
                  <>
                    <img
                      src={BGImagePlaceholder}
                      className="absolute top-0 object-cover w-full h-1/3 rounded-b-3xl"
                    />
                    <Pencil
                      style={{ color: "white" }}
                      className="absolute cursor-pointer top-4 right-4"
                      onClick={() => {
                        editPicturesModalRef.current?.showModal();
                      }}
                    />
                    <div className="z-10 mb-4 rounded-full w-2/7 aspect-w-1 aspect-h-1 mt-25 bg-Gradient2">
                      <img
                        src={ProfilePicPlaceholder}
                        className="object-cover w-full h-full p-1 rounded-full"
                      />
                    </div>
                    <div className="flex flex-col items-center justify-center w-full px-4 pb-10">
                      <h1 className="text-lg font-medium text-Primary">
                        {profileInfo.username}
                      </h1>
                      <br />
                      <h2
                        className="max-w-[350px] text-base text-center font-normal text-BlackText min-h-6"
                        style={{ whiteSpace: "pre-line" }}
                      >
                        {profileInfo.bio}
                      </h2>
                      <br />
                      <h2 className="text-base font-normal text-[#99A2AD] min-h-6">
                        {profileInfo.location}
                      </h2>
                      <br />
                      <div className="flex flex-row justify-center w-full gap-3">
                        <ProfileButton
                          label="Edit Profile"
                          color="bg-Gradient2"
                          textColor="white"
                          flex={true}
                          onClick={() => {
                            editProfileModalRef.current?.showModal();
                          }}
                        />
                        <ProfileButton
                          label="Share job opening"
                          color="bg-WhiteAndGrayGradient"
                          textColor="Primary"
                          flex={true}
                          onClick={() => {
                            navigate("/user/jobs/create-job");
                          }}
                        />
                        <button className="flex-none p-2 bg-WhiteAndGrayGradient rounded-xl">
                          <Ellipsis />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Education section */}
              <div className="flex flex-col p-5 lg:rounded-3xl lg:border-ProfileBorder lg:border-[2px] lg:bg-white lg:p-10">
                <div className="flex justify-between">
                  <h1 className="text-2xl font-semibold text-Primary">
                    Education
                  </h1>
                  <SectionButton
                    label="Add Entry"
                    color="bg-Gradient2"
                    textColor="white"
                    flex={true}
                    onClick={() => {
                      educationModalRef.current?.showModal();
                    }}
                  />
                </div>
                <br />
                {/* education history cards list */}
                <div className="relative flex flex-col gap-4">
                  {isLoading
                    ? [1, 2].map((i) => (
                        <CardSkeleton
                          key={i}
                          variant="generic"
                          className="w-full min-h-[90px] max-w-full"
                        />
                      ))
                    : educationHistory.map((educationEntry) => {
                        return (
                          <ProfileHistoryCard
                            key={educationEntry._id}
                            id={educationEntry._id}
                            imageLogo={educationEntry.logo_url ?? ""}
                            name={educationEntry.school_name}
                            title={educationEntry.degree}
                            type={"education"}
                            dateGraduated={educationEntry.graduation_date ?? ""}
                            notifySuccess={handleUpdateSuccess}
                          />
                        );
                      })}
                  {!isLoading && <ConnectingLine />}
                </div>
              </div>

              {/* Career section */}
              <div className="flex flex-col p-5 lg:rounded-3xl lg:border-ProfileBorder lg:border-[2px] lg:bg-white lg:p-10">
                <div className="flex justify-between">
                  <h1 className="text-2xl font-semibold text-Primary">
                    Career
                  </h1>
                  <SectionButton
                    label="Add Entry"
                    color="bg-Gradient2"
                    textColor="white"
                    flex={true}
                    onClick={() => {
                      careerModalRef.current?.showModal();
                    }}
                  />
                </div>
                <br />
                {/* education history cards list */}
                <div className="relative flex flex-col gap-4">
                  {isLoading
                    ? [1, 2].map((i) => (
                        <CardSkeleton
                          key={i}
                          variant="generic"
                          className="w-full min-h-[90px] max-w-full"
                        />
                      ))
                    : careerHistory.map((careerEntry) => {
                        return (
                          <ProfileHistoryCard
                            key={careerEntry._id}
                            id={careerEntry._id}
                            imageLogo={careerEntry.logo_url ?? ""}
                            name={careerEntry.company}
                            title={careerEntry.position}
                            type={"career"}
                            current={careerEntry.is_current}
                            dateStarted={careerEntry.start_date ?? ""}
                            dateEnded={careerEntry.end_date ?? ""}
                            notifySuccess={handleUpdateSuccess}
                          />
                        );
                      })}
                  {!isLoading && <ConnectingLine />}
                </div>
              </div>
            </div>

            {/* alerts */}
            <div className={`toast toast-end ${showToast ? "" : "hidden"}`}>
              <div className="alert bg-[#f4f6f8] text-Primary rounded-lg">
                <span>{toastMessage}</span>
              </div>
            </div>

            {/* shortcuts in profile */}
            <div className="flex flex-col gap-3 lg:w-1/4">
              {/* RSVPed Events */}
              {/* <div className="flex flex-col gap-5 justify-between w-full min-h-45 bg-white rounded-xl p-5 text-Primary border-ProfileBorder border-[2px]">
                                <h1 className="text-xl font-bold">RSVPed Events</h1>
                                {isLoading ? (
                                    <CardSkeleton variant="event"   />
                                ) : (
                                    userData?.rsvpd_events?.length ? (
                                        userData.rsvpd_events.map((eventID) => (
                                            <h3 key={eventID} className="text-xs font-bold">{eventID}</h3>
                                        ))
                                    ) : (
                                        <h3 className="text-xs font-bold">There is nothing here.</h3>
                                    )
                                )}
                                <Link to="/user/events" className="text-xs font-bold underline underline-offset-2">View events here.</Link>
                            </div> */}

              {/* Saved Job Postings */}
              <div className="flex flex-col gap-5 justify-between w-full min-h-45 bg-white rounded-xl p-5 text-Primary border-ProfileBorder border-[2px]">
                <h1 className="text-xl font-bold">Saved Job Postings</h1>
                {isLoading ? (
                  <CardSkeleton variant="job" />
                ) : (
                  savedJobs.slice(0, 2).map((job: JobProps, index: number) => (
                    <div
                      key={index}
                      onClick={() => navigate(`/user/jobs?id=${job._id}`)}
                      className="cursor-pointer"
                    >
                      <JobPostingCard
                        job={job}
                        isSelected={false}
                        isRecent={false}
                        isSaved={true}
                        compact={true}
                      />
                    </div>
                  ))
                )}
                <Link
                  to="/user/jobs"
                  className="text-xs font-bold underline underline-offset-2"
                >
                  View job postings here.
                </Link>
              </div>

              {/* Your Donations */}
              {/* <div className="flex flex-col gap-5 justify-between w-full min-h-45 bg-white rounded-xl p-5 text-Primary border-ProfileBorder border-[2px]">
                                <h1 className="text-xl font-bold">Your Donations</h1>
                                {isLoading ? (
                                    <CardSkeleton variant="donation"  />
                                ) : (
                                    <h3 className="text-xs font-bold">There is nothing here.</h3>
                                )}
                                <Link to="/user/donate" className="text-xs font-bold underline underline-offset-2">View donation causes here.</Link>
                            </div> */}

              {/* Your Surveys */}
              <div className="flex flex-col gap-5 justify-between w-full min-h-45 bg-white rounded-xl p-5 text-Primary border-ProfileBorder border-[2px]">
                <h1 className="text-xl font-bold">Your Surveys</h1>
                {isLoading ? (
                  <CardSkeleton
                    variant="generic"
                    className="w-full min-h-[70px]"
                  />
                ) : (
                  <UserSurveyBox userID={user ? user?._id : ""} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// local components

interface ProfileButtonProps {
  label: string;
  color: string;
  textColor: string;
  flex?: boolean;
  onClick: () => void;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({
  label,
  color,
  textColor,
  flex,
  onClick,
}) => {
  return (
    <button
      className={`text-sm text-${textColor} ${color} p-2 rounded-xl max-w-50 ${
        flex ? "flex-1" : ""
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

const SectionButton: React.FC<ProfileButtonProps> = ({
  label,
  color,
  textColor,
  onClick,
}) => {
  return (
    <button
      className={`text-sm text-${textColor} ${color} py-[6px] w-36 px-2 rounded-xl`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

const ConnectingLine: React.FC = () => {
  return (
    <div className="absolute top-4 left-4 w-5 h-[calc(100%-1rem)] rounded-full flex justify-center">
      <div className="w-1 h-full bg-[#82A5CF] rounded-full" />
    </div>
  );
};

export default UserProfilePage;
