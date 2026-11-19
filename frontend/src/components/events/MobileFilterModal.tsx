import React from "react";
import { X } from "lucide-react";

/**
 * @interface MobileFilterModalProps
 * @description Defines the props accepted by the MobileFilterModal component.
 */
interface MobileFilterModalProps {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  searchValue: string;
  locationInput: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  months: string[];
  years: string[];
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleLocationInputChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  setStartMonth: (value: string) => void;
  setStartYear: (value: string) => void;
  setEndMonth: (value: string) => void;
  setEndYear: (value: string) => void;
  handleCloseModal: () => void;
  handleSearch: () => void;
  handleReset: () => void;
}

/**
 * @component MobileFilterModal
 * @description A modal component displayed on mobile devices for filtering search results. It includes inputs for keywords, location, and a date range.
 * Uses the HTML `<dialog>` element for modal functionality.
 * @returns {React.ReactElement} The rendered mobile filter modal component.
 */
const MobileFilterModal: React.FC<MobileFilterModalProps> = ({
  dialogRef,
  searchValue,
  locationInput,
  startMonth,
  startYear,
  endMonth,
  endYear,
  months,
  years,
  handleChange,
  handleLocationInputChange,
  setStartMonth,
  setStartYear,
  setEndMonth,
  setEndYear,
  handleCloseModal,
  handleSearch,
  handleReset,
}) => {
  return (
    <dialog ref={dialogRef} id="filter_modal" className="modal">
      <div className="modal-box min-w-[340px] bg-white text-Primary rounded-2xl flex flex-col gap-3 p-5">
        {/* Modal Header */}
        <div className="flex flex-row items-start justify-between mb-2">
          {" "}
          <label className="text-2xl font-bold text-Primary">
            Filters
          </label>{" "}
          <button
            type="button"
            className="text-Primary w-min -mt-1 -mr-1"
            onClick={handleCloseModal}
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="w-full flex flex-col gap-4">
          {" "}
          {/* Keyword Search Input */}
          <div>
            <label className="text-base font-medium text-Primary block mb-1">
              {" "}
              What
            </label>
            <input
              type="text"
              placeholder="Enter Keywords"
              value={searchValue}
              onChange={handleChange}
              className="w-full text-Primary text-sm bg-white px-4 py-2 border border-[#A9C1DE] rounded-lg focus:outline-none focus:ring-1 focus:ring-Secondary focus:border-blue-500 placeholder-Primary"
            />
          </div>
          {/* Location Input */}
          <div>
            <label className="text-base font-medium text-Primary block mb-1">
              {" "}
              Where
            </label>
            <input
              type="text"
              placeholder="Enter city or region"
              value={locationInput}
              onChange={handleLocationInputChange}
              className="w-full text-Primary text-sm bg-white px-4 py-2 border border-[#A9C1DE] rounded-lg focus:outline-none focus:ring-1 focus:ring-Secondary focus:border-blue-500 placeholder-Primary"
            />
          </div>
          {/* Date Range Filter */}
          <div>
            <label className="text-base font-medium text-Primary block mb-2">
              {" "}
              Date Range
            </label>
            <div className="flex flex-col gap-3">
              {" "}
              {/* Start Date Selectors */}
              <div>
                <span className="text-sm font-normal">From</span>
                <div className="flex gap-2 mt-1">
                  <select
                    value={startMonth}
                    onChange={(e) => setStartMonth(e.target.value)}
                    className="flex-1 rounded-md px-2 py-2 bg-white text-Primary border border-[#A9C1DE]"
                  >
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <select
                    value={startYear}
                    onChange={(e) => setStartYear(e.target.value)}
                    className="flex-1 rounded-md px-2 py-2 bg-white text-Primary border border-[#A9C1DE]"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* End Date Selectors */}
              <div>
                <span className="text-sm font-normal">To</span>
                <div className="flex gap-2 mt-1">
                  <select
                    value={endMonth}
                    onChange={(e) => setEndMonth(e.target.value)}
                    className="flex-1 rounded-md px-2 py-2 bg-white text-Primary border border-[#A9C1DE]"
                  >
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <select
                    value={endYear}
                    onChange={(e) => setEndYear(e.target.value)}
                    className="flex-1 rounded-md px-2 py-2 bg-white text-Primary border border-[#A9C1DE]"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-5 flex flex-col gap-2">
          {" "}
          {/* Added container for buttons */}
          <button
            type="button"
            onClick={handleSearch} // Apply filters and close uses passed handler
            className="bg-Gradient2 hover:bg-Primary text-white font-semibold rounded-lg h-10 transition-colors duration-200"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleReset} // Reset filters and close uses passed handler
            className="text-Primary hover:text-gray-300 text-sm transition-colors duration-200"
          >
            Reset Filters
          </button>
        </div>
      </div>
      {/* Click outside to close */}
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default MobileFilterModal;
