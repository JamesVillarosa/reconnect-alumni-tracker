// Dropdown.tsx
import React from "react";
import { ChevronDown } from "lucide-react";

interface DropdownProps {
  label: string;
  value: string;
  placeholder?: string;
  options: string[];
  icon?: React.ReactNode;
  onChange: (selectedValue: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  value,
  placeholder = "Select an option",
  options,
  icon,
  onChange,
}) => {
  // pill-shape bg toggles when a value is selected
  const bgColor = value ? "bg-wInput" : "bg-SemiWhite";

  return (
    <div className="flex flex-col mb-4">
      <label className="pl-2 pb-1 text-md font-semibold lg:text-lg text-Primary">
        {label}
      </label>
      <div className="relative w-full">
        {icon && (
          <div className="absolute inset-y-0 left-3 flex items-center text-Primary">
            {icon}
          </div>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full text-Primary text-left
            px-4 py-2 lg:py-3
            border-2 border-Primary ${bgColor}
            rounded-3xl
            placeholder-[#97A9BE]
            focus:outline-none focus:ring-1 focus:ring-Secondary focus:border-Secondary
            transition-colors
            appearance-none
            ${icon ? "pl-12" : "pl-4"}
          `}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        {/* dropdown arrow */}
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#97A9BE]">
          <ChevronDown />
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
