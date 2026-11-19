import React from "react";
import JobsDropdown from "../../components/jobs/JobsDropdown";
import Slider from "@mui/material/Slider";
import ModalCard from "../../components/ModalCard";
import { JobTypeEnum } from "../../types/job";

interface MobileFilterModalProps {
  keywords: string | undefined;
  setKeywords: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  workType: string;
  setWorkType: React.Dispatch<React.SetStateAction<string>>;
  listingTime: string;
  setListingTime: React.Dispatch<React.SetStateAction<string>>;
  salaryRange: [number, number];
  handleSalaryChange: (event: Event, newValue: number | number[]) => void;
  handleFilter: (action: string) => void;
  category: string[];
  setCategory: React.Dispatch<React.SetStateAction<string[]>>;
  setSalaryRange: React.Dispatch<React.SetStateAction<[number, number]>>;
}

/**
 * MobileFilterModal component provides a modal interface for filtering job listings.
 *
 * @param {MobileFilterModalProps} props - The props for the MobileFilterModal component.
 * @param {string | undefined} props.keywords - The search keywords entered by the user.
 * @param {(value: string) => void} props.setKeywords - Function to update the search keywords.
 * @param {string} props.location - The location entered by the user.
 * @param {(value: string) => void} props.setLocation - Function to update the location.
 * @param {string} props.workType - The selected work type.
 * @param {React.Dispatch<React.SetStateAction<string>>} props.setWorkType - Function to update the work type.
 * @param {string} props.listingTime - The selected listing time.
 * @param {React.Dispatch<React.SetStateAction<string>>} props.setListingTime - Function to update the listing time.
 * @param {[number, number]} props.salaryRange - The selected salary range.
 * @param {(event: Event, newValue: number | number[]) => void} props.handleSalaryChange - Function to handle salary range changes.
 * @param {() => void} props.handleFilter - Function to execute the search action.
 * @param {string} props.category - The selected job category.
 * @param {(value: string) => void} props.setCategory - Function to update the job category.
 * @param {React.Dispatch<React.SetStateAction<[number, number]>>} props.setSalaryRange - Function to update the salary range.
 *
 * @returns {JSX.Element} The rendered MobileFilterModal component.
 */
const MobileFilterModal: React.FC<MobileFilterModalProps> = ({
  keywords,
  setKeywords,
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
    <ModalCard
      id="mobileFilters"
      title="Filter Jobs"
      primaryButton={{
        label: "Apply",
        onClick: () => {
          handleFilter("apply");
        },
      }}
      secondaryButton={{
        label: "Reset Filter",
        onClick: () => handleFilter("reset"),
      }}
    >
      <div className="flex flex-col gap-4">
        {/* Keywords */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center w-full">
            <h2 className="flex-1 text-xl font-semibold">What</h2>
            {keywords !== "" && (
              <button
                className="text-end w-fit text-base text-Error cursor-pointer transition-colors duration-100 hover:text-Error/80"
                onClick={() => setKeywords("")}
              >
                Clear
              </button>
            )}
          </div>
          <input
            type="text"
            className="w-full h-12 px-4 text-lg font-normal border-2 border-DarkBlue text-Primary placeholder-primary/50 focus:outline-white input rounded-xl"
            placeholder="Enter Keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>

        {/* Location */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center w-full">
            <h2 className="flex-1 text-xl font-semibold">Where</h2>
            {location !== "" && (
              <button
                className="text-end w-fit text-base text-Error cursor-pointer transition-colors duration-100 hover:text-Error/80"
                onClick={() => setLocation("")}
              >
                Clear
              </button>
            )}
          </div>
          <input
            type="text"
            className="w-full h-12 px-4 text-lg font-normal border-2 border-DarkBlue text-Primary placeholder-primary/50 focus:outline-white input rounded-xl"
            placeholder="Enter City or Region"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Month */}
        <div className="flex flex-col w-full justify-between gap-2">
          <div className="flex justify-between items-center w-full">
            <h2 className="flex-1 text-xl font-semibold">Date Posted</h2>
            {listingTime !== "" && listingTime !== "Listed any time" && (
              <button
                className="text-end w-fit text-base text-Error cursor-pointer transition-colors duration-100 hover:text-Error/80"
                onClick={() => setListingTime("Listed any time")}
              >
                Clear
              </button>
            )}
          </div>
          <span className="flex-1">
            <JobsDropdown
              choices={listingTimes}
              label="Listed any time"
              selected={listingTime == "" ? "Listed any time" : listingTime}
              setSelected={setListingTime}
              className="h-12 text-lg"
              alt={false}
            />
          </span>
        </div>

        {/* Type */}
        <div className="flex flex-col w-full gap-2">
          <div className="flex justify-between items-center w-full">
            <h2 className="flex-1 text-xl font-semibold">Job Type</h2>
            {workType !== "Any type" && (
              <button
                className="text-end w-fit text-base text-Error cursor-pointer transition-colors duration-100 hover:text-Error/80"
                onClick={() => setWorkType("Any type")}
              >
                Clear
              </button>
            )}
          </div>
          <span className="flex-1">
            <JobsDropdown
              choices={["Any type", ...JobTypeEnum]}
              label="Any type"
              selected={workType == "" ? "Any type" : workType}
              setSelected={setWorkType}
              className="h-12 text-lg"
              alt={false}
            />
          </span>
        </div>

        {/* Salary */}
        <div className="">
          <div className="flex justify-between items-center w-full">
            <h2 className="flex-1 text-xl font-semibold">Salary Range</h2>
            {salaryRange[0] !== 0 ||
              (salaryRange[1] !== 250000 && (
                <button
                  className="text-end w-fit text-base text-Error cursor-pointer transition-colors duration-100 hover:text-Error/80"
                  onClick={() => setSalaryRange([0, 250000])}
                >
                  Clear
                </button>
              ))}
          </div>

          <Slider
            value={salaryRange}
            onChange={handleSalaryChange}
            valueLabelDisplay="auto"
            min={0}
            max={250000}
            step={1000}
          />
          <div className="flex items-center justify-center gap-4 text-center">
            <input
              type="text"
              className="w-full h-12 border-2 border-DarkBlue px-4 text-lg font-normal text-Primary placeholder-primary/50 focus:outline-white input rounded-xl"
              placeholder="Min Salary"
              value={`₱ ${salaryRange[0].toString()}`}
              onChange={(e) =>
                setSalaryRange([
                  Number(
                    e.target.value.replace("₱ ", "").replace(/[^0-9]/g, "")
                  ),
                  salaryRange[1],
                ])
              }
            />
            <div className="text-lg">to</div>
            <input
              type="text"
              className="w-full h-12 border-2 border-DarkBlue px-4 text-lg font-normal text-Primary placeholder-primary/50 focus:outline-white input rounded-xl"
              placeholder="Max Salary"
              value={`₱ ${salaryRange[1].toString()}`}
              onChange={(e) =>
                setSalaryRange([
                  salaryRange[0],
                  Number(
                    e.target.value.replace("₱ ", "").replace(/[^0-9]/g, "")
                  ),
                ])
              }
            />
          </div>
        </div>
      </div>
    </ModalCard>
  );
};

export default MobileFilterModal;
