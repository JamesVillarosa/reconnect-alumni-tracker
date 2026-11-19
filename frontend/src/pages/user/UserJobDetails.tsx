import React, { useContext, useEffect, useRef, useState } from "react";
import JobProps, { BlankJob } from "../../types/job";
import Text from "../../components/Text";
import Button from "../../components/Button";
import {
  Banknote,
  BriefcaseBusiness,
  MapPin,
  // UsersRound,
  Bookmark,
  Flag,
  SquareArrowOutUpRight,
  Image,
  ArrowLeft,
  CircleAlert,
  LibraryBig,
  Calendar,
  Clock,
  Workflow,
  // UsersRound,
  // DivideCircle,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useSavedJobsContext } from "../../hooks/useSavedJobsContext";
import dayjs from "dayjs";
import { toast } from "../utils/ToastFxn";
import PrivilegedAction from "../utils/PrivilegedActionGuard";

// const num_alum = 5;

const UserJobDetails: React.FC<{
  jobData: JobProps;
  isSaved: boolean;
  closePage: React.Dispatch<React.SetStateAction<JobProps>>;
}> = ({ jobData, isSaved, closePage }) => {
  const location = useLocation();

  // For mobile view, get job data from location state
  if (!jobData) {
    jobData = location.state.jobData;
  }

  const authContext = useContext(AuthContext);
  const { bookmarkJob, removeSavedJob } = useSavedJobsContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolledPastTop, setHasScrolledPastTop] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

  // Track window size changes and update isMobile state
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth <= 640;
      setIsMobile(newIsMobile);

      // Close the modal if it exists and is open when resizing
      const modal = document.getElementById(
        "my_modal_3"
      ) as HTMLDialogElement | null;
      if (modal?.open) {
        modal.close();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Function to get scroll value of the modal body
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop } = scrollRef.current;
      setHasScrolledPastTop(scrollTop > 10);
    }
  };

  // Automatically reset the scroll when selecting a different job card
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [jobData]);

  const handleFlag = async () => {
    if (!jobData) return;

    const currentUser = authContext?.user;
    if (!currentUser) {
      console.log("Error: You need to be logged in to report a job.");
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/jobs/${jobData._id}/report/status`,
        {
          params: {
            user_id: currentUser._id,
          },
          withCredentials: true,
        }
      );

      const { has_pending_report } = response.data;

      if (has_pending_report) {
        console.log("User has a pending report");

        toast({
          title: "Pending Report!",
          description: "You already have a pending report for this job.",
          type: "warning",
          isLoading: false,
        });
      } else {
        console.log("No pending report found");
        const reportModal = document.getElementById(
          `report_modal_${jobData._id}`
        ) as HTMLDialogElement | null;
        reportModal?.showModal();
      }
    } catch (error) {
      console.error("Error checking report status:", error);
    }
  };

  const handleApply = async () => {
    // open the application link in a new tab
    if (!jobData) return;
    const applicationLink = jobData.application_link;
    if (applicationLink) {
      window.open(applicationLink, "_blank");
    }
  };

  return !jobData ? (
    <div className="w-full h-full">
      <button
        className="sticky py-4 ml-5 top-6 left-6 sm:hidden"
        onClick={() => {
          closePage(BlankJob);
        }}
      >
        <ArrowLeft
          size={42}
          className="p-1 transition-colors duration-100 rounded-full cursor-pointer text-Primary bg-FaintBlue hover:bg-DarkBlue"
        />
      </button>
      <div className="flex flex-col h-full w-full items-center justify-center sm:bg-[#F2F8FF] rounded-3xl text-Error">
        <CircleAlert size={36} />
        <span className="text-xl font-bold">Unable to load job</span>
        <span className="text-xs">An unexpected error occurred</span>
      </div>
    </div>
  ) : isMobile ? (
    // MOBILE VIEW

    <motion.div
      key="mobile-job-detail"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-col w-full h-full max-h-screen overflow-y-auto"
    >
      {/* Back Button */}
      <button
        className="sticky py-4 ml-5 top-6 left-6 sm:hidden"
        onClick={() => {
          closePage(BlankJob);
        }}
      >
        <ArrowLeft
          size={42}
          className="p-1 transition-colors duration-100 rounded-full cursor-pointer text-Primary bg-FaintBlue hover:bg-DarkBlue"
        />
      </button>

      {/* Header */}
      <div className="flex flex-col gap-4 py-3 pt-12 px-9">
        <Image size={60} className="-ml-1 text-Primary" />

        {/* Job & Company Name */}
        <div className="flex flex-col ">
          <Text text={jobData.title} format="title" />
          <a
            href={jobData.company_url}
            target="_blank"
            className="flex items-center gap-1 -mt-1 transition-colors duration-100 hover:text-DarkBlue"
          >
            <Text
              text={jobData.company_name}
              format="body"
              className="text-black underline transition-colors duration-100 hover:text-DarkBlue"
            />
            <SquareArrowOutUpRight size={15} />
          </a>
        </div>

        {/* Location & Salary */}
        <div className="flex flex-col">
          <Text text={jobData.location} format="body" />
          <Text
            text={`PHP ${jobData.min_salary} - PHP ${jobData.max_salary}`}
            format="body"
            className="-mt-1"
          />
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 pt-3 text-md text-white overflow-x-auto">
          <span className="flex items-center gap-1 p-1 px-3 rounded-full bg-green-400">
            <Clock size={15} />
            {jobData.status}
          </span>
        </div>

        {/* Alumni working here */}
        {/* <div className="flex items-center gap-2 mt-4">
          <UsersRound size={15} className="text-Primary" />
          <Text
            text={`${num_alum} other ${
              num_alum > 1 ? "alumni work" : "alumnus works"
            } here`}
            format="small"
          />
        </div> */}
      </div>

      <div className="flex py-6">
        <hr className="flex-grow border border-MidBlue" />
      </div>

      <div className="flex flex-col gap-6">
        {/* Important Job Details */}
        <section
          className="px-12"
          id="JobDetails"
          ref={scrollRef}
          onScroll={handleScroll}
        >
          <div className="">
            <Text text="Job Details" format="subheading" className="pb-2" />
            <Text
              text="Category"
              format="small"
              className="!font-bold"
              icon={<LibraryBig size={18} />}
            />
            <Text
              text={jobData.job_field}
              format="small"
              className="mb-2 pl-7"
            />
            <Text
              text="Salary"
              format="small"
              className="!font-bold"
              icon={<Banknote size={18} />}
            />
            <Text
              text={`PHP ${jobData.min_salary} - ${jobData.max_salary} a month`}
              format="small"
              className="mb-2 pl-7"
            />
            <Text
              text="Job Type"
              format="small"
              className="!font-bold"
              icon={<BriefcaseBusiness size={18} />}
            />
            <Text
              text={jobData.job_type}
              format="small"
              className="mb-2 pl-7"
            />
            <Text
              text="Location"
              format="small"
              className="!font-bold"
              icon={<MapPin size={18} />}
            />
            <Text
              text={jobData.location}
              format="small"
              className="mb-2 pl-7"
            />
          </div>
        </section>

        {/* Full Job Description */}
        <section className="px-12 pb-6">
          <div className="">
            <Text
              text="Full Job Description"
              format="subheading"
              className="pb-1"
            />
            <Text text={jobData.description} format="body" />
            <Text
              text="Job Requirements and Qualifications:"
              format="label"
              className="mt-6"
            />
            <ul className="pl-6 list-disc list-outside">
              {jobData.qualifications.map((qualification, index) => (
                <li key={index} className="marker:text-Primary">
                  <Text text={qualification} format="small" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Floating action buttons */}
      <div className="sticky left-0 flex flex-wrap self-start w-full gap-2 px-8 bottom-6 sm:px-12 sm:hidden">
        <PrivilegedAction>
          <Button
            onClick={handleFlag}
            variant="minor"
            className="btn !border-none !bg-FaintBlue hover:bg-Primary w-min px-3 h-12 flex items-center justify-center rounded-lg"
          >
            <Flag size={20} className="text-Primary" />
          </Button>
        </PrivilegedAction>
        <PrivilegedAction>
          <Button
            onClick={() => {
              if (isSaved) removeSavedJob(jobData._id);
              else bookmarkJob(jobData);
            }}
            variant="minor"
            className="btn !border-none !bg-FaintBlue w-min px-3 h-12 flex items-center justify-center"
          >
            <Bookmark
              size={20}
              style={{
                fill: isSaved ? "var(--color-Primary)" : "none",
                color: "var(--color-Primary)",
              }}
              className="text-Primary"
            />
          </Button>
        </PrivilegedAction>
        <PrivilegedAction>
          <Button
            onClick={handleApply}
            variant="major"
            className="btn !h-12 border-none flex-1"
          >
            Apply
          </Button>
        </PrivilegedAction>
      </div>
    </motion.div>
  ) : (
    // DESKTOP VIEW
    <div className="flex flex-col w-full h-full pb-3 bg-FaintBlue overflow-x-clip rounded-3xl">
      <div className="sticky top-0 flex flex-col w-full px-12 py-6 pt-8 border-b-2 rounded-t-3xl bg-FaintBlue border-ProfileBorder">
        <div
          className={`transition-all duration-200 ${
            hasScrolledPastTop
              ? "max-h-0 opacity-0"
              : "max-h-[500px] opacity-100"
          }`}
        >
          <Image size={60} className="-ml-1 text-Primary" />
        </div>
        <div className="py-4">
          <Text text={jobData.title} format="title" />
          <a
            href={jobData.company_url}
            className="flex items-center gap-1 -mt-1 transition-colors duration-100 hover:text-DarkBlue"
          >
            <Text
              text={jobData.company_name}
              format="body"
              className="text-black underline transition-colors duration-100 hover:text-DarkBlue"
            />
            <SquareArrowOutUpRight size={15} />
          </a>
        </div>
        <div
          className={`overflow-hidden transition-all duration-200 ${
            hasScrolledPastTop
              ? "max-h-0 opacity-0"
              : "max-h-[500px] opacity-100"
          }`}
        >
          {/* <div className="pb-4"> */}
          <div>
            <Text text={jobData.location} format="body" />
            <Text
              text={`PHP ${jobData.min_salary} - PHP ${jobData.max_salary}`}
              format="body"
              className="-mt-1"
            />
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 pt-3 text-md text-white overflow-x-auto">
          <span className="flex items-center gap-1 p-1 px-3 rounded-full bg-green-400">
            <Clock size={15} />
            {jobData.status}
          </span>
        </div>

        <div className="flex flex-row items-center justify-start w-full gap-2">
          <PrivilegedAction>
            <Button
              onClick={handleApply}
              variant="major"
              className=" border-none w-fit md:w-full max-w-50 !h-12"
            >
              Apply
            </Button>
          </PrivilegedAction>
          <PrivilegedAction>
            <Button
              onClick={handleFlag}
              variant="minor"
              className="btn !border-none w-min px-3 h-12 flex items-center justify-center rounded-lg"
            >
              <Flag size={20} className="text-Primary" />
            </Button>
          </PrivilegedAction>
          <PrivilegedAction>
            <Button
              onClick={() => {
                if (isSaved) removeSavedJob(jobData._id);
                else bookmarkJob(jobData);
              }}
              variant="minor"
              className="btn !border-none w-min px-3 h-12 flex items-center justify-center"
            >
              <motion.div
                key={isSaved ? "saved" : "unsaved"} // triggers animation on toggle
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.3 }}
              >
                <Bookmark
                  size={20}
                  style={{
                    fill: isSaved ? "var(--color-Primary)" : "none",
                    color: "var(--color-Primary)",
                  }}
                  className="text-Primary"
                />
              </motion.div>
            </Button>
          </PrivilegedAction>
        </div>
      </div>

      <div
        className="overflow-y-auto py-9"
        id="JobDetails"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        <div className="px-12">
          <Text text="Job Details" format="subheading" className="pb-2" />
          <Text
            text="Category"
            format="small"
            className="!font-bold"
            icon={<LibraryBig size={18} />}
          />
          <Text text={jobData.job_field} format="small" className="mb-2 pl-7" />
          <Text
            text="Salary"
            format="small"
            className="!font-bold"
            icon={<Banknote size={18} />}
          />
          <Text
            text={`PHP ${jobData.min_salary} - ${jobData.max_salary} a month`}
            format="small"
            className="mb-2 pl-7"
          />
          <Text
            text="Job Type"
            format="small"
            className="!font-bold"
            icon={<BriefcaseBusiness size={18} />}
          />
          <Text text={jobData.job_type} format="small" className="mb-2 pl-7" />
          <Text
            text="Job Level"
            format="small"
            className="!font-bold"
            icon={<Workflow size={18} />}
          />
          <Text text={jobData.job_level} format="small" className="mb-2 pl-7" />
          <Text
            text="Location"
            format="small"
            className="!font-bold"
            icon={<MapPin size={18} />}
          />
          <Text text={jobData.location} format="small" className="mb-2 pl-7" />
          <Text
            text="Date"
            format="small"
            className="!font-bold"
            icon={<Calendar size={18} />}
          />
          <span className="flex pl-7 mb-2 gap-2">
            <Text
              text={dayjs(jobData.start_date).format("MMMM D, YYYY")}
              format="small"
              className=""
            />
            -
            <Text
              text={dayjs(jobData.end_date).format("MMMM D, YYYY")}
              format="small"
              className=""
            />
          </span>
        </div>

        <div className="flex py-6">
          <hr className="flex-grow border border-MidBlue" />
        </div>

        <div className="px-12">
          <Text
            text="Full Job Description"
            format="subheading"
            className="pb-1"
          />
          <Text text={jobData.description} format="body" />
          <Text
            text="Job Requirements and Qualifications:"
            format="label"
            className="mt-6"
          />
          <ul className="pl-6 list-disc list-outside">
            {jobData.qualifications.map((qualification, index) => (
              <li key={index} className="marker:text-Primary">
                <Text text={qualification} format="small" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserJobDetails;
