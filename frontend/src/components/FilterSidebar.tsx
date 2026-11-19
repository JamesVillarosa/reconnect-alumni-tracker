import React from 'react';
import { Search, X } from 'lucide-react';
import Checkbox from './Checkbox';
import Button from './Button';

// Define the FiltersSidebarProps interface
type FiltersSidebarProps = {
  keywords: string;
  setKeywords: (value: string) => void;
  donationType: string;
  setDonationType: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  status?: string;
  setStatus?: (value: string) => void;
  resetFilters: () => void;
  onFiltersApply?: () => void;
};

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  keywords,
  setKeywords,
  donationType,
  setDonationType,
  sortBy,
  setSortBy,
  status,
  setStatus,
  resetFilters,
  onFiltersApply
}) => {
  // Count active filters to show user how many are applied
  const activeFilterCount = [
    donationType !== 'all',
    sortBy !== "Most Recent",
    status && status !== "All"
  ].filter(Boolean).length + (keywords ? 1 : 0);
  
  // Check if any filters are active
  const hasActiveFilters = activeFilterCount > 0;

  // Handle radio-style checkbox changes
  const handleRadioChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    if (onFiltersApply) {
      onFiltersApply();
    }
  };

  return (
    <div className="w-full md:w-64 bg-white p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl text-[#094EA0] font-bold">Filters</h3>
        </div>
        
        {/* Search */}
        <div className="mb-6">
            <label htmlFor="keywords-search" className="block text-[#094EA0] font-medium mb-2">Keywords</label>
            <div className="relative">
                <input
                    id="keywords-search"
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="Search donations..."
                    className="w-full p-2 pl-9 border border-[#E9EFF5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#094EA0]/75 text-[#094EA0]"
                    aria-label="Search by keywords"
                />
                <Search className="absolute left-3 top-2.5 text-[#094EA0]/60" size={18} />
                {keywords && (
                    <button 
                        onClick={() => {
                          setKeywords('');
                          if (onFiltersApply) onFiltersApply();
                        }}
                        className="absolute right-3 top-2.5 text-[#094EA0]/60 hover:text-[#094EA0]"
                        aria-label="Clear search"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        </div>
        
        {/* Donation Type */}
        <div className="mb-6">
            <h4 className="font-semibold text-[#094EA0] mb-2">Donation Type</h4>
            <div className="space-y-2">
                <Checkbox 
                    checked={donationType === 'monetary'}
                    onChange={() => handleRadioChange(setDonationType, 'monetary')}
                    label="Monetary"
                    className="text-[#094EA0]"
                />
                <Checkbox 
                    checked={donationType === 'nonMonetary'}
                    onChange={() => handleRadioChange(setDonationType, 'nonMonetary')}
                    label="Non-Monetary"
                    className="text-[#094EA0]"
                />
                <Checkbox 
                    checked={donationType === 'all'}
                    onChange={() => handleRadioChange(setDonationType, 'all')}
                    label="All Types"
                    className="text-[#094EA0]"
                />
            </div>
        </div>
                
        {/* Status Filter */}
        {setStatus && status && (
          <div className="mb-6">
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
        )}
        
        {/* Sort By */}
        <div className="mb-6">
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
        
        {/* Reset Filters Button */}
        <Button
            variant="major"
            className={`w-full text-[#094EA0] ${hasActiveFilters ? 'hover:bg-[#094EA0]/10' : 'opacity-50 cursor-not-allowed'}`}
            onClick={hasActiveFilters ? resetFilters : undefined}
            aria-label="Reset all filters"
        >
            Reset Filters
        </Button>
    </div>
  );
};

export default FiltersSidebar;