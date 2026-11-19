import React from "react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
/**
 * @interface DesktopFilterBarProps
 * @description Defines the props accepted by the DesktopFilterBar component. This includes state values, event handlers, constants (like months/years), and refs
 * necessary for managing the filter bar's functionality and appearance on desktop views.
 */
interface DesktopFilterBarProps {
  // State values
  isPopularActive: boolean;
  isSoonActive: boolean;
  selectedLocation: string;
  isLocationActive: boolean; // Desktop location dropdown open state
  locationInput: string;
  isDateActive: boolean; // Date filter applied state
  isDesktopDateDropdownOpen: boolean; // Desktop date dropdown open state
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;

  // Handlers/Setters from parent
  handlePopularFilter: () => void;
  handleSoonFilter: () => void;
  handleLocationFilter: () => void; // Opens desktop location dropdown
  handleLocationInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLocationKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  toggleDesktopDateDropdown: () => void; // Toggles desktop date dropdown visibility
  setStartMonth: (value: string) => void;
  setStartYear: (value: string) => void;
  setEndMonth: (value: string) => void;
  setEndYear: (value: string) => void;
  activateDateFilter: () => void; // Function to set isDateActive to true
  handleResetFilters: () => void;

  // Constants
  months: string[];
  years: string[];

  // Refs from parent
  locationRef: React.RefObject<HTMLDivElement | null>;
  dateRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * @component DesktopFilterBar
 * @description A horizontal filter bar component designed for desktop layouts. It provides quick filter buttons ('Popular', 'Happening Soon'), a dropdown for location search,
 * and a dropdown for selecting a date range. It also includes a button to reset all filters. This component is conditionally rendered (hidden on smaller screens).
 * @returns {React.ReactElement | null} The rendered desktop filter bar component, or null if hidden.
 */
const DesktopFilterBar: React.FC<DesktopFilterBarProps> = ({
  isPopularActive,
  isSoonActive,
  selectedLocation,
  isLocationActive,
  locationInput,
  isDateActive,
  isDesktopDateDropdownOpen,
  startMonth,
  startYear,
  endMonth,
  endYear,
  handlePopularFilter,
  handleSoonFilter,
  handleLocationFilter,
  handleLocationInputChange,
  handleLocationKeyPress,
  toggleDesktopDateDropdown,
  setStartMonth,
  setStartYear,
  setEndMonth,
  setEndYear,
  activateDateFilter,
  handleResetFilters,
  months,
  years,
  locationRef,
  dateRef,
}) => {
  return (
    <div className="hidden lg:flex flex-row gap-4 items-center justify-center w-full px-4">
      {/* Popular filter button */}
      <button
        onClick={handlePopularFilter}
        className={`border px-4 py-2 rounded-full ${
          isPopularActive
            ? "border-Secondary bg-Secondary text-white"
            : "border-Primary text-Primary hover:bg-Primary/10"
        } transition-colors duration-200`}
      >
        Popular
      </button>

      {/* Happening soon filter button */}
      <button
        onClick={handleSoonFilter}
        className={`border px-4 py-2 rounded-full ${
          isSoonActive
            ? "border-Secondary bg-Secondary text-white"
            : "border-Primary text-Primary hover:bg-Primary/10"
        } transition-colors duration-200`}
      >
        Happening Soon
      </button>

      {/* Location dropdown */}
      <div className="relative" ref={locationRef}>
        <button
          onClick={handleLocationFilter} // Opens the dropdown
          className={`border px-4 py-2 rounded-full ${
            selectedLocation // Highlight if a location is selected
              ? "border-Secondary bg-Secondary text-white"
              : isLocationActive // Highlight if dropdown is open
              ? "border-Secondary bg-Secondary text-white"
              : "border-Primary text-Primary hover:bg-Primary/10" // Default and hover
          } transition-colors duration-200`}
        >
          <div className="flex flex-row items-center justify-center gap-1">
            {selectedLocation || "Location"}
            {isLocationActive ? <FaCaretUp /> : <FaCaretDown />}
          </div>
        </button>

        {/* Location Dropdown Content */}
        {isLocationActive && (
          <div className="absolute mt-2 w-70 z-20 bg-white shadow-lg p-5 rounded-xl text-Primary border border-gray-200">
            <span className="text-sm font-medium">Search for a location</span>
            <input
              type="text"
              value={locationInput}
              onChange={handleLocationInputChange}
              onKeyDown={handleLocationKeyPress} // Handle Enter key press
              className="w-full px-3 py-2 my-2 border border-Primary focus:outline-Primary rounded-lg placeholder:text-sm text-base"
              placeholder="Enter city or region"
              autoFocus // Automatically focus the input when dropdown opens
            />
          </div>
        )}
      </div>

      {/* Date range dropdown */}
      <div className="relative" ref={dateRef}>
        <button
          onClick={toggleDesktopDateDropdown} // Toggles dropdown visibility
          className={`border px-4 py-2 rounded-full ${
            isDateActive // Highlight if date filter is active
              ? "border-Secondary bg-Secondary text-white"
              : isDesktopDateDropdownOpen // Also highlight if dropdown is open
              ? "border-Secondary bg-Secondary text-white"
              : "border-Primary text-Primary hover:bg-Primary/10" // Default and hover
          } transition-colors duration-200`}
        >
          <div className="flex flex-row items-center justify-center gap-1">
            Date Range{" "}
            {isDesktopDateDropdownOpen ? <FaCaretUp /> : <FaCaretDown />}
          </div>
        </button>

        {/* Date Range Dropdown Content */}
        {isDesktopDateDropdownOpen && (
          <div className="absolute mt-2 w-80 z-20 bg-white shadow-lg p-5 rounded-xl text-Primary border border-gray-200">
            <div className="flex flex-col gap-4">
              {/* Start Date Selectors */}
              <div>
                <span className="font-semibold text-sm">Start Date</span>
                <div className="flex gap-2 mt-1">
                  <select
                    value={startMonth}
                    onChange={(e) => {
                      setStartMonth(e.target.value);
                      activateDateFilter(); // Activate filter on change
                    }}
                    className="flex-1 border border-Primary rounded-md px-2 py-1 text-sm bg-white"
                  >
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <select
                    value={startYear}
                    onChange={(e) => {
                      setStartYear(e.target.value);
                      activateDateFilter(); // Activate filter on change
                    }}
                    className="flex-1 border border-Primary rounded-md px-2 py-1 text-sm bg-white"
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
                <span className="font-semibold text-sm">End Date</span>
                <div className="flex gap-2 mt-1">
                  <select
                    value={endMonth}
                    onChange={(e) => {
                      setEndMonth(e.target.value);
                      activateDateFilter(); // Activate filter on change
                    }}
                    className="flex-1 border border-Primary rounded-md px-2 py-1 text-sm bg-white"
                  >
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <select
                    value={endYear}
                    onChange={(e) => {
                      setEndYear(e.target.value);
                      activateDateFilter(); // Activate filter on change
                    }}
                    className="flex-1 border border-Primary rounded-md px-2 py-1 text-sm bg-white"
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
        )}
      </div>

      {/* Reset all filters button */}
      <button
        onClick={handleResetFilters}
        className="flex underline text-Primary items-center text-center hover:text-Secondary transition-colors duration-200 text-sm ml-2"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default DesktopFilterBar;
