import React from "react";
import { Funnel } from "lucide-react";
import DonationsDropdown from "../../components/donations/DonationsDropdown";

interface DonationPageHeaderProps {
  keywords: string;
  setKeywords: (value: string) => void;
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  status: string;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  onFiltersApply: () => void;
  onCreateCause?: () => void;
}

/**
 * Header component for donation page containing title and controls
 * @component
 * @param {DonationPageHeaderProps} props - Component props
 * @returns {JSX.Element} Page header with search, filters, and creation controls
 */
const DonationPageHeader: React.FC<DonationPageHeaderProps> = ({
  keywords,
  setKeywords,
  sortBy,
  setSortBy,
  status,
  setStatus,
  onFiltersApply,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between w-full p-2 sm:p-0">
      <div className="my-2 text-4xl font-bold text-primary xl:text-5xl w-max">
        Donation Drives
      </div>

      <div className="flex gap-2">
        {/* Filters Dropdown */}
        {/* The button to open the modal */}
        <label
          htmlFor="filter_modal"
          className="flex items-center gap-1 p-2 transition duration-200 bg-transparent border-2 cursor-pointer rounded-2xl sm:px-4 text-primary hover:bg-MidBlue"
        >
          <Funnel size={18} strokeWidth={2} />
          <span className="hidden sm:block">Filter</span>
        </label>

        {/* The hidden checkbox that toggles the modal */}
        <input type="checkbox" id="filter_modal" className="modal-toggle" />

        {/* The modal itself */}
        <div className="modal" role="dialog">
          <div className="modal-box min-w-[340px] bg-white text-Primary rounded-2xl flex flex-col gap-3 p-5 overflow-visible">
            <div className="p-0 card-body">
              <div className="flex flex-col w-full gap-4">
                <h2 className="text-2xl font-bold text-Primary">Filters</h2>
                <div className="flex flex-col gap-4 overflow-visible">
                  <input
                    type="text"
                    className="w-full input rounded-xl text-Primary text-sm bg-white px-2 py-2 h-10 border border-[#A9C1DE] focus:outline-none focus:ring-1 focus:ring-Secondary focus:border-blue-500 placeholder-Primary"
                    placeholder="Enter Keywords"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                  <DonationsDropdown
                    label="Sort by"
                    selected={sortBy}
                    setSelected={setSortBy}
                    choices={["Most Recent", "Alphabetical", "Most Popular"]}
                    className="flex-1 rounded-md px-2 py-2 bg-white text-Primary border border-[#A9C1DE]"
                  />
                  <DonationsDropdown
                    label="Select status"
                    selected={status}
                    setSelected={setStatus}
                    choices={["Active", "Completed"]}
                    className="flex-1 rounded-md px-2 py-2 bg-white text-Primary border border-[#A9C1DE]"
                  />
                </div>
                <button
                  className="h-10 px-5 text-white transition-all duration-200 border-none bg-Gradient2 rounded-xl active:brightness-90 hover:bg-MidBlue hover:brightness-110 btn"
                  onClick={() => {
                    onFiltersApply();
                    // close the modal by unchecking the checkbox
                    (
                      document.getElementById(
                        "filter_modal"
                      ) as HTMLInputElement
                    ).checked = false;
                  }}
                >
                  Apply
                </button>
                <button
                  className="h-10 px-5 transition-all duration-200 bg-white border-2 text-primary rounded-xl active:brightness-90 hover:bg-MidBlue hover:text-Primary btn"
                  onClick={() => {
                    // clear the filters
                    setKeywords("");
                    setSortBy("Most Recent");
                    setStatus("Active");
                    // call the apply filters function to reset the filters
                    onFiltersApply();
                    // close the modal by unchecking the checkbox
                    (
                      document.getElementById(
                        "filter_modal"
                      ) as HTMLInputElement
                    ).checked = false;
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* The backdrop/close button */}
          <label className="modal-backdrop" htmlFor="filter_modal">
            Close
          </label>
        </div>
      </div>
    </div>
  );
};

export default DonationPageHeader;
