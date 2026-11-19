import React, { useEffect, useState } from "react";

interface PaginationButtonsProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

/**
 * This component renders a pagination control in the format "Prev [input for currentPage] of [totalPages] Next".
 * The user can type a page number into the input field to navigate directly to that page.
 *
 * @param {PaginationButtonsProps} props - The props for the component.
 * @param {number} props.totalPages - The total number of pages.
 * @param {number} props.currentPage - The currently active page.
 * @param {(page: number) => void} props.onPageChange - Function to handle page changes.
 *
 * @returns {JSX.Element} The rendered pagination component.
 *
 * @example
 * ```tsx
 * <PaginationButtons
 *   totalPages={34}
 *   currentPage={1}
 *   onPageChange={(page) => console.log("Page changed to:", page)}
 * />
 * ```
 */
const PaginationButtons: React.FC<PaginationButtonsProps> = ({
  totalPages,
  currentPage,
  onPageChange,
}) => {
  const [inputPage, setInputPage] = useState(currentPage.toString());

  // Update input field when currentPage changes (e.g., via Prev/Next buttons)
  useEffect(() => {
    setInputPage(currentPage.toString());
  }, [currentPage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers (and empty string for typing)
    if (value === "" || /^\d+$/.test(value)) {
      const num = parseInt(value, 10);
      // If the value is a number, enforce min/max constraints
      if (value === "" || (num >= 1 && num <= totalPages)) {
        setInputPage(value);
      }
    }
  };

  const handleInputSubmit = () => {
    const pageNum = parseInt(inputPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    } else {
      // Reset to currentPage if input is invalid
      setInputPage(currentPage.toString());
    }
  };

  return (
    <div className="flex items-center justify-center w-full max-w-[400px] mx-auto gap-1 sm:gap-2">
      {/* Prev Button */}
      <button
        className="text-primary hover:underline disabled:text-gray-400 disabled:pointer-events-none text-base sm:text-base px-3 sm:px-3"
        onClick={() => {
          if (currentPage >= 1) {
            onPageChange(currentPage - 1);
          }
        }}
        disabled={currentPage === 1}
      >
        Prev
      </button>

      {/* Page Indicator: [input for currentPage] of [totalPages] */}
      <div className="flex text-primary text-base sm:text-base gap-3 items-center font-semibold">
        <input
          type="text"
          value={inputPage}
          onChange={handleInputChange}
          onBlur={handleInputSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleInputSubmit();
            }
          }}
          className="bg-white w-12 h-8 rounded-lg flex font-normal items-center justify-center text-center text-Primary outline-DarkerBlue"
          min="1"
          max={totalPages}
        />
        <span>of</span>
        <div>{totalPages}</div>
      </div>

      {/* Next Button */}
      <button
        className="text-primary hover:underline disabled:text-gray-400 disabled:pointer-events-none text-base sm:text-base px-3 sm:px-3"
        onClick={() => {
          if (currentPage <= totalPages) {
            onPageChange(currentPage + 1);
          }
        }}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default PaginationButtons;
