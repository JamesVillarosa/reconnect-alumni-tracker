import JobsDropdown from "../../components/jobs/JobsDropdown";
import { ChevronDown } from "lucide-react";
import Slider from "@mui/material/Slider";
import { JobFieldEnum, JobTypeEnum } from "../../types/job";
import InputField from "../InputField";

interface DesktopFilterControlsProps {
  keywords: string | undefined;
  setKeywords: (value: string) => void;
  category: string[];
  setCategory: React.Dispatch<React.SetStateAction<string[]>>;
  location: string;
  setLocation: (value: string) => void;
  workType: string;
  setWorkType: React.Dispatch<React.SetStateAction<string>>;
  listingTime: string;
  setListingTime: React.Dispatch<React.SetStateAction<string>>;
  salaryRange: [number, number];
  handleSalaryChange: (
    event: Event | React.SyntheticEvent,
    newValue: number | number[]
  ) => void;
  handleFilter: (action: string) => void;
  setSalaryRange: React.Dispatch<React.SetStateAction<[number, number]>>;
}

/**
 * DesktopFilterControls component provides a set of filter controls for job listings.
 *
 * @param {DesktopFilterControlsProps} props - The props for the component.
 * @param {string | undefined} props.keywords - The search keywords entered by the user.
 * @param {(value: string) => void} props.setKeywords - Function to update the search keywords.
 * @param {string} props.category - The selected job category.
 * @param {(value: JobFieldEnum) => void} props.setCategory - Function to update the job category.
 * @param {string} props.location - The location entered by the user.
 * @param {(value: string) => void} props.setLocation - Function to update the location.
 * @param {string} props.workType - The selected job type.
 * @param {React.Dispatch<React.SetStateAction<string>>} props.setWorkType - Function to update the job type.
 * @param {string} props.listingTime - The selected listing time filter.
 * @param {React.Dispatch<React.SetStateAction<string>>} props.setListingTime - Function to update the listing time filter.
 * @param {[number, number]} props.salaryRange - The selected salary range.
 * @param {(event: Event, newValue: number | number[]) => void} props.handleSalaryChange - Function to handle salary range slider changes.
 * @param {() => void} props.handleSearch - Function to trigger the search action.
 * @param {React.Dispatch<React.SetStateAction<[number, number]>>} props.setSalaryRange - Function to update the salary range.
 *
 * @returns {JSX.Element} The rendered DesktopFilterControls component.
 */
const DesktopFilterControls: React.FC<DesktopFilterControlsProps> = ({
  keywords,
  setKeywords,
  category,
  setCategory,
  location,
  setLocation,
  workType,
  setWorkType,
  listingTime,
  setListingTime,
  salaryRange,
  handleSalaryChange,
  handleFilter,
  setSalaryRange,
}) => {
  const listingTimes = [
    "Listed any time",
    "Last 24 hours",
    "Last 7 days",
    "Last 14 days",
    "This month",
    "Last 3 months",
    "Last 6 months",
    "This year",
  ];

  return (
    <section className="justify-center hidden w-full py-3 sm:flex bg-gradient-to-b from-10% from-Secondary to-Primary">
      <div className="flex flex-col h-full gap-4 p-6 text-white max-w-[1080px] w-full">
        {/* Row 1 */}
        <div className="flex flex-row items-end w-full gap-4">
          <div className="flex flex-row gap-4 grow">
            <div className="flex flex-col gap-1 flex-1/3">
              <h3 className="text-xl font-semibold">What</h3>
              <InputField
                name="keywords"
                label=""
                placeholder="Enter Keywords"
                value={keywords ? keywords : ""}
                className="w-full text-Primary"
                isRequired={false}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>
            <div className="flex flex-col justify-end min-h-full flex-1/3">
              <JobsDropdown
                choices={JobFieldEnum}
                label="Select Categories"
                selected={category}
                setSelected={setCategory}
                multipleChoice={true}
                alt={false}
              />
            </div>
            <div className="flex flex-col gap-1 flex-1/3">
              <h3 className="text-xl font-semibold">Where</h3>
              <InputField
                name="location"
                label=""
                placeholder="Enter City or Region"
                value={location}
                className="w-full text-Primary"
                isRequired={false}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Filter buttons */}
          <button
            className="btn transition-all duration-200 border-none text-white bg-Primary rounded-xl active:brightness-90 hover:bg-Primary/80"
            onClick={() => handleFilter("apply")}
          >
            Apply
          </button>
          <button
            className="btn transition-all duration-200 border-none text-primary bg-gray-200 rounded-xl active:brightness-90 hover:bg-white hover:text-Primary"
            onClick={() => handleFilter("reset")}
          >
            Reset
          </button>
        </div>

        {/* Row 2 */}
        <div className="flex flex-row items-end w-full gap-4">
          {/* Work Type */}
          <div className="min-w-[14ch]">
            <JobsDropdown
              choices={["Any setup", ...JobTypeEnum]}
              label="Job Type"
              selected={workType == "" ? "Any setup" : workType}
              setSelected={setWorkType}
              alt={true}
            />
          </div>

          {/* Salary Range */}
          <div className="outline-none dropdown">
            <div
              tabIndex={0}
              role="button"
              className="relative flex items-center"
            >
              <div className="flex items-center gap-3 w-full h-10 px-4 font-normal text-white bg-transparent border-2 rounded-full placeholder focus:outline-white input cursor-pointer">
                Salary range
                <ChevronDown
                  strokeWidth={2}
                  className={`transition-all duration-150 ease-in-out`}
                />
              </div>
            </div>
            <div
              tabIndex={0}
              className="mt-2 shadow-md dropdown-content card bg-base-100 z-1 w-full min-w-[300px] text-primary rounded-2xl"
            >
              <div className="card-body p-2">
                <div className="px-4 mt-2">
                  <Slider
                    value={salaryRange}
                    onChange={handleSalaryChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={250000}
                    step={100}
                  />
                </div>
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <InputField
                    name="minSalary"
                    label=""
                    type="number"
                    placeholder="Minimum Salary"
                    value={salaryRange[0]}
                    iconName="philippine-peso"
                    className="w-full"
                    onChange={(e) => {
                      setSalaryRange([Number(e.target.value), salaryRange[1]]);
                    }}
                  />
                  <span className="">to</span>
                  <InputField
                    name="maxSalary"
                    label=""
                    type="number"
                    placeholder="Maximum Salary"
                    value={salaryRange[1]}
                    iconName="philippine-peso"
                    className="w-full"
                    onChange={(e) => {
                      setSalaryRange([salaryRange[0], Number(e.target.value)]);
                    }}
                  />
                </div>

                <div
                  className="btn border-none bg-none w-full flex justify-center py-2 rounded-lg cursor-pointer font-semibold text-xs text-Error hover:bg-Error/15 transition-colors duration-75"
                  onClick={(e: React.SyntheticEvent) => {
                    handleSalaryChange(e, [0, 250000]); // reset
                  }}
                >
                  Clear
                </div>
              </div>
            </div>
          </div>

          {/* Time of listing */}
          <div className="min-w-[17ch]">
            <JobsDropdown
              choices={listingTimes}
              label="Listed any time"
              selected={listingTime == "" ? "Listed any time" : listingTime}
              setSelected={setListingTime}
              alt={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DesktopFilterControls;
