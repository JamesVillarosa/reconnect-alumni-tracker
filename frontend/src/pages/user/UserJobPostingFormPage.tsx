import React, { JSX, useEffect, useRef, useState } from "react";
import { AnimatePresence, Reorder } from "framer-motion";
import { Check, Plus, Trash, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";
import { toastPromise } from "../utils/ToastFxn";
import axios from "axios";
import UserMultiStepForm from "./UserMultiStepForm";
import { Slider } from "@mui/material";
import Selector from "../../components/Selector";
import { JobFieldEnum, JobLevelEnum, JobTypeEnum } from "../../types/job";
import InputField from "../../components/InputField";
import { useInputErrors } from "../utils/InputError";

const UserJobPostingFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { errors, setFieldError, clearFieldError } = useInputErrors();

  // State variables to store form data
  const [name, setName] = useState<string>("");
  const [location, setLocation] = useState("");
  const [url, setURL] = useState<string>("");
  const [application, setApplication] = useState<string>("");

  const [jobTitle, setJobTitle] = useState<string>("");
  const [jobCategory, setJobCategory] = useState<string>("Web Developer");
  const [setUp, setJobSetUp] = useState<string>("Intern");
  const [employmentType, setEmploymentType] =
    useState<JobTypeEnum>("Full-Time");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [description, setDescription] = useState<string>("");
  const [qualifications, setQualifications] = useState<
    { id: string; value: string }[]
  >([{ id: crypto.randomUUID(), value: "" }]);
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 250000]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccessful, setIsSuccessful] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);

  const { user } = useAuthContext();

  const steps: string[] = [
    "Company Information",
    "Job Information",
    "Category & Setup",
    "Salary & Date",
    "Qualifications",
  ];

  const JOB_LEVEL_OPTIONS: JobLevelEnum[] = [
    "Intern",
    "Entry Level",
    "Junior",
    "Mid Level",
    "Senior",
    "Lead",
    "Principal",
  ];

  /**
   * Clears all error messages from the form.
   */
  // const clearAllErrors = () => {
  //   setErrors({});
  // };

  // reset form
  const resetForm = () => {
    setName("");
    setLocation("");
    setURL("");
    setApplication("");
    setJobCategory("Web Developer");
    setJobSetUp("Intern");
    setEmploymentType("Full-Time");
    setStartDate(undefined);
    setEndDate(undefined);
    setDescription("");
    setQualifications([{ id: crypto.randomUUID(), value: "" }]);
    setSalaryRange([0, 250000]);
  };

  // API Call - Create job post
  const handleForm = async () => {
    try {
      setIsLoading(true);
      const jobPayload = JSON.stringify({
        title: jobTitle,
        location,
        company_name: name,
        company_url: url,
        application_link: application,
        job_field: jobCategory,
        job_level: setUp,
        job_type: employmentType,
        start_date: startDate ? startDate.toISOString() : null,
        end_date: endDate ? endDate.toISOString() : null,
        description,
        qualifications: qualifications.map((q) => q.value),
        min_salary: salaryRange[0],
        max_salary: salaryRange[1],
        authorId: user?._id, // replace with actual logged-in user’s ObjectId
        status: "Still Hiring", // default or configurable
        date_posted: new Date().toISOString(), // or let backend assign
        flagged: false, // default
        author_name: `${user?.first_name || ""} ${
          user?.last_name || ""
        }`.trim(),
      });

      toastPromise(
        axios.post(`${import.meta.env.VITE_API_URL}/jobsbasbsbab`, jobPayload, {
          method: "POST",
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }),
        {
          loading: {
            title: "Posting...",
            description: "Job post is being posted.",
            type: "info",
          },
          success: {
            title: "Success!",
            description: "Job posted successfully.",
            type: "success",
          },
          error: {
            title: "Failed!",
            description: "There was an error posting the job.",
            type: "error",
            button: {
              label: "Retry",
              onClick: () => {
                // goToPrevStep();
                handleForm();
              },
            },
          },
        }
      )
        .then(() => {
          setIsSuccessful(() => true);
          resetForm();
        })
        .catch(() => {
          setIsSuccessful(() => false);
        });
    } finally {
      setIsLoading(false);
      // goToNextStep();
    }
  };

  const retrySubmission = () => {
    // goToPrevStep();
    handleForm();
  };

  // scrollRef should be attached to the scrollable container
  const scrollRef = useRef<HTMLDivElement>(null);
  const [action, setAction] = useState<string>("");

  // auto-scroll to bottom when new qualification is added
  useEffect(() => {
    if (scrollRef.current && action == "add") {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qualifications]);

  // Handles Salary Change
  const handleSalaryChange = (_event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      setSalaryRange(newValue as [number, number]);
    }
  };

  // Adds a new empty qualification field
  const addQualification = () => {
    setQualifications([
      ...qualifications,
      { id: crypto.randomUUID(), value: "" },
    ]);
  };

  // Removes a qualification by index
  const removeQualification = (id: string) => {
    setQualifications(qualifications.filter((q) => q.id !== id));
  };

  // Updates job category (mobile dev, web dev, etc.)
  const handleJobCategory = (category: string) => {
    setJobCategory(category);
  };
  // Updates employment type
  const handleEmploymentType = (type: JobTypeEnum) => {
    setEmploymentType(type);
  };

  // Updates a specific qualification's value
  const updateQualification = (id: string, value: string) => {
    setQualifications(
      qualifications.map((q) => (q.id === id ? { ...q, value } : q))
    );
  };

  const JOB_FIELD_OPTIONS: JobFieldEnum[] = [
    "Web Developer",
    "Mobile Developer",
    "Backend Developer",
    "Frontend Developer",
    "Full Stack Developer",
    "UI/UX Developer",
    "QA Tester",
    "DevOps Engineer",
    "Data Analyst",
    "Project Manager",
  ];

  const JOB_TYPE_OPTIONS: JobTypeEnum[] = ["Full-Time", "Part-Time"];

  //   function to help render the proper fields for current section
  const renderStep = (): JSX.Element | null => {
    switch (activeStep) {
      case 0:
        return (
          <section className="w-full px-6 py-3">
            <div className="flex flex-col gap-6">
              {/* Company Name & Link */}
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full">
                  <InputField
                    name="companyName"
                    label="Company Name"
                    value={name}
                    isRequired={true}
                    error={errors["companyName"]}
                    iconName="building-2"
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="w-full">
                  <InputField
                    name="companyURL"
                    label="Company URL"
                    value={url}
                    isRequired={true}
                    error={errors["companyURL"]}
                    iconName="link"
                    onChange={(e) => setURL(e.target.value)}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="w-full">
                <InputField
                  name="companyLocation"
                  label="Location"
                  value={location}
                  isRequired={true}
                  error={errors["companyLocation"]}
                  iconName="map-pin"
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
          </section>
        );
      case 1:
        return (
          <section className="w-full px-6 py-3">
            <div className="flex flex-col">
              <div className="flex flex-col gap-6">
                {/* Title */}
                <div className="w-full">
                  <InputField
                    name="jobTitle"
                    label="Job Title"
                    value={jobTitle}
                    isRequired={true}
                    error={errors["jobTitle"]}
                    iconName="type"
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>

                {/* Link to Job Post */}
                <div className="w-full">
                  <InputField
                    name="applicationLink"
                    label="Job Link"
                    value={application}
                    isRequired={true}
                    error={errors["applicationLink"]}
                    iconName="link"
                    onChange={(e) => setApplication(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="w-full">
                  <div className="w-full">
                    <InputField
                      name="jobDescription"
                      label="Job Description"
                      rows={9}
                      value={description}
                      isRequired={true}
                      error={errors["jobDescription"]}
                      isTextArea={true}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      case 2:
        return (
          <section className="w-full px-6 py-3">
            <div className="flex flex-col">
              <div className="flex flex-col gap-6">
                {/* Field */}
                <Selector
                  label="Category"
                  options={JOB_FIELD_OPTIONS}
                  onSelect={handleJobCategory}
                  value={jobCategory}
                  isRequired={true}
                />

                {/* Job Set Up */}
                <Selector
                  label="Set Up"
                  options={JOB_LEVEL_OPTIONS}
                  onSelect={(level) => setJobSetUp(level)}
                  isRequired={true}
                />

                <Selector
                  label="Employment Type"
                  options={JOB_TYPE_OPTIONS}
                  onSelect={handleEmploymentType}
                  value={employmentType}
                  isRequired={true}
                />
              </div>
            </div>
          </section>
        );
      case 3:
        return (
          <section className="w-full px-6 py-3">
            <div className="flex flex-col">
              <div className="flex flex-col gap-6">
                {/* Salary */}
                <div className="w-full">
                  <label className="font-medium text-sm text-Label">
                    Monthly Salary<span className="text-error">*</span>
                  </label>
                  <Slider
                    value={salaryRange}
                    onChange={handleSalaryChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={250000}
                    step={100}
                    className="mt-3"
                  />
                  <div className="flex flex-col sm:flex-row sm:gap-4 w-full justify-center items-center">
                    {/* Minimum Salary */}
                    <InputField
                      type="number"
                      label="Minimum"
                      name="minSalary"
                      value={salaryRange[0]}
                      isRequired={true}
                      error={errors["minSalary"]}
                      iconName="philippine-peso"
                      className="w-full"
                      onChange={(e) =>
                        setSalaryRange([Number(e.target.value), salaryRange[1]])
                      }
                    />

                    <span>to</span>

                    <InputField
                      type="number"
                      label="Maximum"
                      name="maxSalary"
                      value={salaryRange[1]}
                      isRequired={true}
                      error={errors["maxSalary"]}
                      iconName="philippine-peso"
                      className="w-full"
                      onChange={(e) =>
                        setSalaryRange([salaryRange[0], Number(e.target.value)])
                      }
                    />
                  </div>
                </div>

                {/* Application Period */}
                <div className="w-full">
                  <label className="font-medium text-sm text-Label">
                    Application Period<span className="text-error">*</span>
                  </label>

                  <div className="flex flex-col sm:flex-row sm:gap-4 w-full justify-center items-center">
                    <InputField
                      label="Start date"
                      type="date"
                      name="startDate"
                      value={
                        startDate ? startDate.toISOString().split("T")[0] : ""
                      }
                      isRequired={true}
                      error={errors["startDate"]}
                      iconName="calendar"
                      iconPosition="right"
                      className="w-full"
                      onChange={(e) => {
                        const dateStr = e.target.value;
                        setStartDate(dateStr ? new Date(dateStr) : undefined);
                      }}
                    />

                    <span className="">to</span>

                    <InputField
                      label="End date"
                      type="date"
                      name="endDate"
                      value={endDate ? endDate.toISOString().split("T")[0] : ""}
                      isRequired={true}
                      error={errors["endDate"]}
                      iconName="calendar"
                      iconPosition="right"
                      className=" !w-full"
                      onChange={(e) => {
                        const dateStr = e.target.value;
                        setEndDate(dateStr ? new Date(dateStr) : undefined);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      case 4:
        return (
          <section className="w-full px-6 py-3">
            <div className="flex flex-col">
              {/* Qualifications */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="paragraph"
                  className="text-font-medium text-sm text-Label"
                >
                  Qualification/s<span className="text-error">*</span>
                </label>

                <div
                  ref={scrollRef}
                  className="flex flex-col w-full h-full overflow-x-hidden overflow-y-hidden"
                >
                  <Reorder.Group
                    axis="y"
                    values={qualifications}
                    onReorder={(newList) => setQualifications(newList)}
                    className="flex flex-col gap-2"
                  >
                    <AnimatePresence>
                      {qualifications.map((item) => (
                        <Reorder.Item
                          key={item.id}
                          value={item}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="flex relative items-center gap-1 w-full p-1"
                        >
                          <InputField
                            type="text"
                            name="qualifications"
                            placeholder="Specify job qualification"
                            value={item.value}
                            isRequired={true}
                            error={errors["qualifications"]}
                            iconName="layers"
                            className="!w-full"
                            onChange={(e) => {
                              updateQualification(item.id, e.target.value);
                            }}
                          />

                          <Trash
                            size={36}
                            className="absolute right-2 top-1.5 btn text-Error cursor-pointer h-fit p-2 transition-colors duration-100 border-none bg-none hover:bg-Error/15 rounded-full"
                            onClick={() => {
                              removeQualification(item.id);
                              setAction(() => {
                                return "delete";
                              });
                            }}
                          />
                        </Reorder.Item>
                      ))}
                    </AnimatePresence>
                  </Reorder.Group>
                </div>

                <button
                  className="flex mt-1 h-10 z-10 btn sticky bottom-3 rounded-3xl border-none bg-DarkBlue text-white hover:bg-Secondary"
                  onClick={() => {
                    setAction(() => {
                      return "add";
                    });
                    addQualification();
                  }}
                >
                  <Plus size={21} />
                  Add qualification
                </button>
              </div>
            </div>
          </section>
        );
      case 5:
        return (
          <section className="flex flex-col items-center justify-center w-full h-full text-center px-4 gap-4">
            {/* SUCCESSFUL */}
            {isSuccessful && (
              <>
                <div className="w-20 h-20 rounded-full text-Accent bg-green-100 flex items-center justify-center">
                  <Check size={50} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-Primary">
                    Job Posted Successfully!
                  </h2>
                  <p className="text-sm text-BlackText">
                    Thank you for submitting. Your job opportunity has been
                    posted.
                  </p>
                </div>
              </>
            )}

            {/* FAIL */}
            {!isSuccessful && (
              <>
                <div className="w-20 h-20 rounded-full text-Error bg-red-100 flex items-center justify-center">
                  <X size={50} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-Error">
                    Job Posting Failed!
                  </h2>
                  <p className="text-sm text-BlackText">
                    An error has occured. Your job opportunity was not posted.
                  </p>
                </div>
                <button
                  onClick={retrySubmission}
                  className="btn mt-2 bg-Error text-white px-4 py-2 rounded-xl hover:bg-red-400 transition"
                >
                  Retry
                </button>
              </>
            )}
          </section>
        );
      default:
        return null;
    }
  };

  // function to validate the current step; returns true if valid
  const validateStep = (step: number): boolean => {
    let isValid = true;
    let errorMessage = "";

    switch (step) {
      case 0:
        if (!name.trim() || !url.trim() || !location.trim()) {
          errorMessage = "Please fill in all required fields.";
          if (!name.trim())
            setFieldError("companyName", "Please provide the company name");
          if (!url.trim())
            setFieldError(
              "companyURL",
              "Please provide the link to the company site"
            );
          if (!location.trim())
            setFieldError(
              "companyLocation",
              "Please provide the company location"
            );
          isValid = false;
        }
        if (name.trim()) clearFieldError("companyName");
        if (url.trim()) clearFieldError("companyURL");
        if (location.trim()) clearFieldError("companyLocation");
        break;

      case 1:
        if (!jobTitle.trim() || !application.trim() || !description.trim()) {
          errorMessage = "Please fill in all required fields.";
          if (!jobTitle.trim())
            setFieldError("jobTitle", "Please provide the job title");
          if (!application.trim())
            setFieldError(
              "applicationLink",
              "Please provide the application link"
            );
          if (!description.trim())
            setFieldError(
              "jobDescription",
              "Please provide the job description"
            );
          isValid = false;
        }
        if (jobTitle.trim()) clearFieldError("jobTitle");
        if (application.trim()) clearFieldError("applicationLink");
        if (description.trim()) clearFieldError("jobDescription");
        break;

      case 2:
        if (!jobCategory || !setUp || !employmentType) {
          errorMessage = "Please select all required options.";
          if (!jobCategory)
            setFieldError("jobCategory", "Please select a job category");
          if (!setUp)
            setFieldError("workSetup", "Please select the work setup");
          if (!employmentType)
            setFieldError(
              "employmentType",
              "Please select the employment type"
            );
          isValid = false;
        }
        if (jobCategory) clearFieldError("jobCategory");
        if (setUp) clearFieldError("workSetup");
        if (employmentType) clearFieldError("employmentType");
        break;

      case 3:
        if (!startDate || !endDate) {
          errorMessage = "Please select start and end dates.";
          if (!startDate)
            setFieldError("startDate", "Please select a starting date");
          if (!endDate)
            setFieldError("endDate", "Please select an ending date");
          isValid = false;
        } else if (
          salaryRange[0] < 0 ||
          salaryRange[1] > 250000 ||
          salaryRange[0] > salaryRange[1]
        ) {
          errorMessage = "Please enter a valid salary range.";
          setFieldError(
            "salaryRange",
            "Enter a valid range between 0 and 250,000"
          );
          isValid = false;
        } else if (startDate && startDate <= new Date()) {
          errorMessage = "Please enter a starting date later than today.";
          setFieldError("startDate", "Starting date must be later than today");
          isValid = false;
        } else if (endDate && endDate <= startDate) {
          errorMessage =
            "Please enter an ending date later than the starting date.";
          setFieldError(
            "endDate",
            "Ending date must be later than the starting date"
          );
          isValid = false;
        }

        if (startDate && startDate > new Date()) clearFieldError("startDate");
        if (endDate && startDate && endDate > startDate)
          clearFieldError("endDate");
        if (
          salaryRange[0] >= 0 &&
          salaryRange[1] <= 250000 &&
          salaryRange[0] <= salaryRange[1]
        )
          clearFieldError("salaryRange");
        break;

      case 4:
        if (qualifications.length === 1 && qualifications[0].value === "") {
          errorMessage = "Please enter at least 1 qualification.";
          setFieldError("qualifications", "Add at least one qualification");
          isValid = false;
        } else if (!qualifications.every((q) => q.value.trim())) {
          errorMessage = "Please fill in all qualification fields.";
          setFieldError("qualifications", "Fill in all qualification fields");
          isValid = false;
        } else {
          clearFieldError("qualifications");
        }
        break;

      default:
        break;
    }

    // If there is an error, scroll to the error message for better visibility
    if (errorMessage && scrollRef.current) {
      const errorElement = scrollRef.current.querySelector(".text-red-500");
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth" });
      }
    }

    return isValid;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-linear-to-b from-Secondary from-10% to-Primary max-h-screen ">
      <UserMultiStepForm
        navigateTo={() => navigate("/user/jobs")}
        steps={steps}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        title="New Job Opportunity"
        isLoading={isLoading}
        validateStep={validateStep}
        onSubmit={() => {
          if (!validateStep(4)) return;

          setActiveStep((prev) => prev + 1);
          handleForm();
        }}
        resetForm={() => {
          resetForm();
          setActiveStep(-1);
        }}
      >
        {renderStep()}
      </UserMultiStepForm>
    </div>
  );
};

export default UserJobPostingFormPage;
