import React from "react";
import { X } from "lucide-react";
import Checkbox from "../../components/Checkbox";
import Button from "../../components/Button";

interface MobileFilterModalDonationsProps {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  keywords: string;
  handleKeywordChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  donationType: string;
  setDonationType: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  handleCloseModal: () => void;
  handleApply: () => void;
  handleReset: () => void;
}

const MobileFilterModalDonations: React.FC<MobileFilterModalDonationsProps> = ({
  dialogRef,
  keywords,
  handleKeywordChange,
  donationType,
  setDonationType,
  sortBy,
  setSortBy,
  status,
  setStatus,
  handleCloseModal,
  handleApply,
  handleReset,
}) => {
  // Count active filters to show user how many are applied
  const activeFilterCount = [
    donationType !== 'all',
    sortBy !== "Most Recent",
    status !== "All"
  ].filter(Boolean).length + (keywords ? 1 : 0);
  
  // Check if any filters are active
  const hasActiveFilters = activeFilterCount > 0;

  // Handle radio-style checkbox changes
  const handleRadioChange = (setter: (value: string) => void, value: string) => {
    setter(value);
  };

  return (
    <dialog ref={dialogRef} id="filter_modal_donations" className="modal">
      <div className="modal-box min-w-[340px] max-h-[80vh] overflow-hidden bg-white text-[#094EA0] rounded-2xl flex flex-col p-0">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white px-8 py-3 mt-5">
          <div className="flex flex-row items-start justify-between">
            <label className="text-2xl font-bold text-Primary">
              Filters
            </label>
            <button
              type="button"
              className="text-Primary w-min -mt-1 -mr-1"
              onClick={handleCloseModal}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-2">
          <div className="w-full flex flex-col gap-4">
            {/* Keyword Search Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-base font-semibold text-[#094EA0]">Keywords</label>
              </div>
              <input
                type="text"
                placeholder="Search donations..."
                value={keywords}
                onChange={handleKeywordChange}
                className="w-full text-[#094EA0] text-sm bg-white px-4 py-2 border border-[#E9EFF5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#094EA0]/75 placeholder-[#094EA0]"
                aria-label="Search by keywords"
              />
            </div>
            {/* Donation Type */}
            <div>
              <h4 className="font-semibold text-[#094EA0] mb-2">Donation Type</h4>
              <div className="space-y-2">
                <Checkbox
                  label="Monetary"
                  checked={donationType === 'monetary'}
                  onChange={() => handleRadioChange(setDonationType, 'monetary')}
                  className="text-[#094EA0]"
                />
                <Checkbox
                  label="Non-Monetary"
                  checked={donationType === 'nonMonetary'}
                  onChange={() => handleRadioChange(setDonationType, 'nonMonetary')}
                  className="text-[#094EA0]"
                />
                <Checkbox
                  label="All Types"
                  checked={donationType === 'all'}
                  onChange={() => handleRadioChange(setDonationType, 'all')}
                  className="text-[#094EA0]"
                />
              </div>
            </div>
            {/* Status Filter */}
            <div>
              <h4 className="font-semibold text-[#094EA0] mb-2">Status</h4>
              <div className="space-y-2">
                <Checkbox
                  checked={status === 'Active'}
                  onChange={() => handleRadioChange(setStatus, 'Active')}
                  label="In Progress"
                  className="text-[#094EA0]"
                />
                <Checkbox
                  checked={status === 'Closed'}
                  onChange={() => handleRadioChange(setStatus, 'Closed')}
                  label="Complete"
                  className="text-[#094EA0]"
                />
                <Checkbox
                  checked={status === 'All'}
                  onChange={() => handleRadioChange(setStatus, 'All')}
                  label="All Status"
                  className="text-[#094EA0]"
                />
              </div>
            </div>
            {/* Sort By */}
            <div>
              <h4 className="font-semibold text-[#094EA0] mb-2">Sort By</h4>
              <div className="space-y-2">
                <Checkbox
                  checked={sortBy === 'Most Recent'}
                  onChange={() => handleRadioChange(setSortBy, 'Most Recent')}
                  label="Most Recent"
                  className="text-[#094EA0]"
                />
                <Checkbox
                  checked={sortBy === 'Alphabetical'}
                  onChange={() => handleRadioChange(setSortBy, 'Alphabetical')}
                  label="Alphabetical (A-Z)"
                  className="text-[#094EA0]"
                />
                <Checkbox
                  checked={sortBy === 'Oldest'}
                  onChange={() => handleRadioChange(setSortBy, 'Oldest')}
                  label="Most Popular"
                  className="text-[#094EA0]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white px-8 py-3 mb-5">
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              onClick={handleApply}
              variant="major"
              className="w-full text-[#094EA0]"
            >
              Apply
            </Button>
            <Button
              type="button"
              onClick={handleReset}
              variant="major"
              className={`w-full text-[#094EA0] ${hasActiveFilters ? 'hover:bg-[#094EA0]/10' : 'opacity-50 cursor-not-allowed'}`}
              aria-label="Reset all filters"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default MobileFilterModalDonations; 