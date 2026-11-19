import { JobCardSkeleton } from "./../../components/JobCardSkeleton";
import React, { useEffect } from "react";
import JobPostingCard from "../../components/JobPostingCard";
import { useState } from "react";
import JobProps, { BlankJob } from "../../types/job";
import { Frown, SearchX, Settings2 } from "lucide-react";
import UserJobDetails from "./UserJobDetails";
import ReportJobModal from "../../components/modals/ReportJobModal";
import JobReportedModal from "../../components/modals/JobReportedModal";
import PaginationButtons from "../../components/PaginationButtons";
import MobileFilterModal from "../../components/jobs/MobileFilterModal";
import DesktopFilterControls from "../../components/jobs/DesktopFilterControls";
import MobileCategorySlider from "../../components/jobs/MobileCategorySlider";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useJobsContext } from "../../hooks/useJobsContext";
import { useSavedJobsContext } from "../../hooks/useSavedJobsContext";
import DesktopNavbar from "../../components/DesktopNavbar";
import UserNavbar from "../../components/UserNavbar";
import FloatingActionButton from "../../components/FloatingActionButton";
import PrivilegedAction from "../utils/PrivilegedActionGuard";

const UserJobsPage: React.FC = () => {
  const navigate = useNavigate();

  // filter states
  const [keywords, setKeywords] = useState<string>("");
  const [category, setCategory] = useState<string[]>([]);
  const [location, setLocation] = useState<string>("");
  const [workType, setWorkType] = useState<string>("Any type");
  const [listingTime, setListingTime] = useState<string>("Listed any time");
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 250000]);

  const {
    allJobs,
    fetchJobs,
    total: totalJobs,
    loading: cardsLoading,
    setLoading: setCardsLoading,
  } = useJobsContext();
  const {
    savedJobs,
    fetchSavedJobs,
    total: totalSavedJobs,
  } = useSavedJobsContext();
  const [recentJobs, setRecentJobs] = useState<JobProps[]>([]);

  // Keeps track of the selected job to display its details in the right panel or modal (for mobile)
  const [selectedJob, setSelectedJob] = useState<JobProps>(BlankJob);
  const [currentTab, setCurrentTab] = useState<string>("Browse");

  // Pagination states
  const [totalBrowsePages, setTotalBrowsePages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalSavedPages, setTotalSavedPages] = useState<number>(0);
  const [currentSavedPage, setCurrentSavedPage] = useState<number>(1);
  const [totalRecentPages, setTotalRecentPages] = useState<number>(0);
  const [currentRecentPage, setCurrentRecentPage] = useState<number>(1); // for future purposes

  // dynamically update jobs to show
  const getCurrentJobs = () => {
    if (currentTab === "Browse") return allJobs;
    if (currentTab === "Saved") return savedJobs;
    if (currentTab === "Recent") return recentJobs;
    return [];
  };
  const jobsToRender = getCurrentJobs();

  // dynamically update pagination
  const totalPages: number =
    currentTab === "Browse"
      ? totalBrowsePages
      : currentTab === "Saved"
      ? totalSavedPages
      : totalRecentPages;

  const currentPageValue: number =
    currentTab === "Browse"
      ? currentPage
      : currentTab === "Saved"
      ? currentSavedPage
      : currentRecentPage;

  const handlePageChange = (page: number) => {
    if (currentPage === page) return; // do not refetch when page number did not change

    if (currentTab === "Browse") {
      setCurrentPage(page);
    } else if (currentTab === "Saved") {
      setCurrentSavedPage(page);
    } else if (currentTab === "Recent") {
      setCurrentRecentPage(page);
    }

    if (currentTab === "Browse")
      fetchJobs({
        keywords: keywords,
        category: category,
        workType: workType,
        salaryRange: salaryRange,
        listingTime: listingTime,
        currentPage: page,
      });

    if (currentTab === "Saved")
      fetchSavedJobs({
        keywords: keywords,
        category: category,
        workType: workType,
        salaryRange: salaryRange,
        listingTime: listingTime,
        currentPage: page,
      });
  };

  // helper function that adds recent jobs
  const addToRecentJobs = (job: JobProps) => {
    if (currentTab === "Recent") return; // do not update when currently in recents tab

    setRecentJobs((prev) => {
      const filtered = prev.filter((j) => j._id !== job._id); // remove if already exists
      const updated = [job, ...filtered].slice(0, 10); // add on top
      localStorage.setItem("recentJobs", JSON.stringify(updated)); // store in localStorage
      return updated;
    });
  };

  // checks if job is saved
  const isJobSaved = (jobId: string) =>
    savedJobs.some((job) => job._id === jobId);

  // Handles the search functionality by applying filters and fetching jobs
  const handleFilter = (action: string) => {
    // Close the mobile filter modal (if open)
    (document.getElementById("mobileFilters")! as HTMLDialogElement).close();

    console.log(
      keywords +
        "\n" +
        category +
        "\n" +
        location +
        "\n" +
        workType +
        "\n" +
        listingTime +
        "\n" +
        salaryRange
    );

    if (action == "reset") {
      const clearedKeywords = "";
      const clearedCategory: string[] = [];
      const clearedLocation = "";
      const clearedWorkType = "Any type";
      const clearedListingTime = "Listed any time";
      const clearedSalaryRange: [number, number] = [0, 250000];

      setKeywords(clearedKeywords);
      setCategory(clearedCategory);
      setLocation(clearedLocation);
      setWorkType(clearedWorkType);
      setListingTime(clearedListingTime);
      setSalaryRange(clearedSalaryRange);

      if (currentTab === "Browse")
        fetchJobs({
          keywords: clearedKeywords,
          category: clearedCategory,
          workType: clearedWorkType,
          salaryRange: clearedSalaryRange,
          listingTime: clearedListingTime,
        });

      if (currentTab === "Saved")
        fetchSavedJobs({
          keywords: clearedKeywords,
          category: clearedCategory,
          workType: clearedWorkType,
          salaryRange: clearedSalaryRange,
          listingTime: clearedListingTime,
        });

      // if (currentTab === "Recent")
    }

    if (action === "apply") {
      if (
        keywords ||
        category.length > 0 ||
        location ||
        workType !== "Any type" ||
        listingTime !== "Listed any time" ||
        salaryRange[0] > 0 ||
        salaryRange[1] < 250000
      ) {
        fetchJobs({
          keywords: keywords,
          category: category,
          workType: workType,
          salaryRange: salaryRange,
          listingTime: listingTime,
        });
      }
    }
  };

  // Opens the filter modal for mobile screens
  const summonMobileFilterModal = () => {
    if (window.innerWidth > 640) return; // Only open modal for mobile-sized screens
    (
      document.getElementById("mobileFilters")! as HTMLDialogElement
    ).showModal();
  };

  // Updates the salary range filter
  const handleSalaryChange = (
    _event: Event | React.SyntheticEvent,
    newValue: number | number[]
  ) => {
    if (Array.isArray(newValue)) {
      setSalaryRange(newValue as [number, number]);
    }
  };

  // Updates displayed jobs
  const handleChangeTab = (tabName: string) => {
    setCurrentTab(tabName);
    setSelectedJob(BlankJob);
  };

  // fetch jobs when categories change (for mobile view only)
  const updateJobs = () => {
    setCardsLoading(true);

    if (currentTab === "Browse") fetchJobs();
    if (currentTab === "Saved") fetchSavedJobs();
  };

  // Check if any filters are applied
  const areFiltersApplied = () => {
    return (
      keywords !== "" ||
      category.length > 0 ||
      location !== "" ||
      workType !== "" ||
      listingTime !== "" ||
      salaryRange[0] > 0 ||
      salaryRange[1] < 250000
    );
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryId = urlParams.get("id");

    if (queryId && allJobs.length > 0) {
      const job = allJobs.find((job) => job._id === queryId);
      if (job) {
        setSelectedJob(job);
        addToRecentJobs(job);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allJobs]);

  // update number of pages per tab
  useEffect(() => {
    setTotalBrowsePages(Math.ceil(totalJobs / 10));
    setTotalSavedPages(Math.ceil(totalSavedJobs / 10));
    setTotalRecentPages(Math.ceil(recentJobs.length / 10));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allJobs, savedJobs, recentJobs]);

  // save selected job card to recents
  useEffect(() => {
    const storedJobs = localStorage.getItem("recentJobs");
    if (storedJobs) {
      setRecentJobs(JSON.parse(storedJobs));
    }
  }, []);

  // check if there is query tab=saved, opens saved jobs if so
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryTab = urlParams.get("tab");
    if (queryTab === "saved") {
      setCurrentTab("Saved");
      fetchSavedJobs();
    } else {
      fetchJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // scrolls to top when changing pages
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  return (
    <div
      className={`min-h-screen max-w-screen ${
        selectedJob != BlankJob ? "fixed" : ""
      } sm:relative`}
    >
      {/* Mobile version navbar */}
      <div className="sm:hidden">
        <UserNavbar activePage="Jobs" />
      </div>
      {/* Desktop version navbar */}
      <div className="z-50 hidden shadow-md sm:block">
        <DesktopNavbar activePage="Jobs" />
      </div>
      <div className="flex justify-center">
        <main className="flex flex-col items-center w-full pb-20 sm:p-0 sm:pb-4">
          {/* Desktop Filters */}
          <DesktopFilterControls
            keywords={keywords}
            setKeywords={setKeywords}
            category={category}
            setCategory={setCategory}
            location={location}
            setLocation={setLocation}
            workType={workType}
            setWorkType={setWorkType}
            listingTime={listingTime}
            setListingTime={setListingTime}
            salaryRange={salaryRange}
            handleSalaryChange={handleSalaryChange}
            handleFilter={handleFilter}
            setSalaryRange={setSalaryRange}
          />

          {/* Mobile Filters */}
          <MobileFilterModal
            keywords={keywords}
            setKeywords={setKeywords}
            location={location}
            setLocation={setLocation}
            workType={workType}
            setWorkType={setWorkType}
            listingTime={listingTime}
            setListingTime={setListingTime}
            salaryRange={salaryRange}
            handleSalaryChange={handleSalaryChange}
            handleFilter={handleFilter}
            category={category}
            setCategory={setCategory}
            setSalaryRange={setSalaryRange}
          />

          {/* Mobile category slider and filter button */}
          <section className="max-w-full mb-4 p-3 bg-linear-to-b from-Secondary from-10% to-Primary w-full text-white block sm:hidden">
            <div className="px-4">
              <div className="flex items-center justify-between text-lg">
                <h2 className="my-5 text-4xl font-bold">Jobs</h2>
              </div>
              <div className="flex flex-row items-center justify-between">
                <h3 className="my-1 text-xl font-semibold">
                  Find Jobs by Category
                </h3>
                {/* Opens the mobile filter modal */}
                <button
                  className="p-2 mr-0 transition-all duration-100 border-none rounded-full btn bg-none dropdown dropdown-end hover:bg-Primary/50"
                  onClick={() => summonMobileFilterModal()}
                >
                  <Settings2 strokeWidth={2.75} size={25} />
                </button>
              </div>
            </div>
            {/* Horizontal category slider for mobile */}
            <MobileCategorySlider
              category={category}
              setCategory={setCategory}
              callAPI={updateJobs}
            />
          </section>

          {/* Tab selector for switching between "Browse", "Saved", and "Recent" */}
          <div className="flex items-center justify-center w-full my-1 text-lg sm:gap-2 sm:pt-4 sm:my-2 sm:text-2xl text-primary">
            {["Browse", "Saved", "Recent"].map((tabName) => (
              <button
                key={tabName}
                className={`min-w-fit w-36 flex justify-center items-center px-6 py-1 rounded-full transition-all duration-200 ${
                  currentTab === tabName
                    ? "font-semibold text-white bg-Primary"
                    : "hover:cursor-pointer font-normal"
                }`}
                onClick={() => handleChangeTab(tabName)}
              >
                {tabName}
              </button>
            ))}
          </div>

          {/* Main browsing section */}
          <section className="flex flex-row w-full max-w-[1080px] px-8 py-6 gap-6 h-full">
            {/* Job cards list (left panel) */}
            <aside className="sticky flex flex-col h-full flex-1/3">
              <div className="flex flex-col h-full gap-4 mb-16 sm:mb-15">
                {/* Render job cards */}
                {!cardsLoading &&
                  jobsToRender.length > 0 &&
                  jobsToRender.map((job, index) => {
                    const isRecent = recentJobs.some(
                      (recent) => recent._id === job._id
                    );
                    return (
                      <div
                        key={"card" + index}
                        onClick={() => {
                          setSelectedJob(job);
                          addToRecentJobs(job);
                        }}
                      >
                        <JobPostingCard
                          key={index}
                          job={job}
                          isSelected={selectedJob === job}
                          isRecent={isRecent}
                          isSaved={isJobSaved(job._id)}
                        />
                      </div>
                    );
                  })}

                {/* Conditional rendering for no jobs */}
                {!cardsLoading && jobsToRender.length === 0 && (
                  <div className="h-full w-full min-h-[300px] flex flex-col text-center justify-center items-center text-Primary">
                    {currentTab === "Browse" ? (
                      areFiltersApplied() ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <SearchX size={45} />
                          <span className="text-sm">
                            Sorry, we didn't find a match
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Frown size={45} />
                          <span className="text-sm">
                            There are no job postings at the moment
                          </span>
                        </div>
                      )
                    ) : currentTab === "Saved" ? (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Frown size={45} />
                        <span className="text-sm">
                          You haven't saved any jobs yet
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Frown size={45} />
                        <span className="text-sm">
                          You haven't viewed any jobs yet
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Skeleton loader */}
                {cardsLoading && (
                  <>
                    <JobCardSkeleton />
                    <JobCardSkeleton />
                    <JobCardSkeleton />
                  </>
                )}
              </div>

              {/* Pagination controls (only displayed if there are multiple pages) */}
              {totalPages > 1 && (
                <div className="fixed flex self-start justify-center p-3 my-4 shadow-xs bottom-20 w-fit sm:bottom-6 bg-FaintBlue shadow-DarkBlue/30 rounded-2xl sm:self-center text-primary">
                  <div className="gap-2 join">
                    <PaginationButtons
                      totalPages={totalPages}
                      currentPage={currentPageValue}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </div>
              )}
            </aside>

            {/* Job details preview (right panel for desktop) */}
            <div className="absolute top-0 right-0 z-20 self-start h-screen sm:z-0 sm:bg-none sm:sticky sm:top-6 pb-14 grow basis-2/3 sm:block sm:rounded-xl">
              {/* Placeholder card when no job is selected */}
              {selectedJob === BlankJob && (
                <div
                  className={
                    "hidden sm:flex sticky opacity-50 top-6 w-full h-full max-h-screen p-8 card text-primary rounded-3xl bg-[#E1F0FB] min-h-[50vh] " +
                    (selectedJob === BlankJob ? "" : "hidden")
                  }
                >
                  {allJobs.length > 0 ? (
                    <>
                      <h2 className="text-2xl font-semibold">
                        Select a Job Posting
                      </h2>
                      <h1 className="font-light">
                        to display its details here
                      </h1>
                    </>
                  ) : (
                    ""
                  )}
                </div>
              )}
              <AnimatePresence mode="wait">
                {/* Job details card for the selected job */}
                {selectedJob != BlankJob && (
                  <div
                    className={
                      "fixed bg-white top-0 right-0 sm:sticky sm:top-6 sm:bg-none h-full w-full max-w-screen max-h-screen card text-primary sm:rounded-3xl"
                    }
                  >
                    <UserJobDetails
                      jobData={selectedJob}
                      isSaved={isJobSaved(selectedJob._id)}
                      closePage={setSelectedJob}
                    />
                  </div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Create Job Button */}
          <PrivilegedAction actionProp="action">
            <FloatingActionButton
              icon={"plus"}
              text="Create Job"
              action={() => {
                navigate("/user/jobs/create-job");
              }}
            />
          </PrivilegedAction>

          {/* REPORT MODAL */}
          <dialog
            key={`report_modal_${selectedJob._id}`}
            id={`report_modal_${selectedJob._id}`}
            className="modal"
          >
            <ReportJobModal
              _jobId={selectedJob._id}
              jobTitle={selectedJob.title}
            />
          </dialog>

          {/* Confirmation modal for successfully reporting a job */}
          <dialog id="job_reported_modal" className="modal">
            <JobReportedModal />
          </dialog>
        </main>
      </div>
    </div>
  );
};

export default UserJobsPage;
