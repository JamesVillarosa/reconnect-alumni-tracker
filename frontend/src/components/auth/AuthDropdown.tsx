// AuthDropdown.tsx
import React from "react";
import { Triangle } from "lucide-react";

interface AuthDropdownProps {
  label?: string;
  value: string;
  placeholder: string;
  options: string[];
  id?: string;
  disabled: boolean;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const AuthDropdown: React.FC<AuthDropdownProps> = ({
  label,
  value,
  placeholder,
  options,
  id,
  disabled,
  onChange,
}) => {
  // pill‐shape bg: gray when disabled, “wInput” when a value’s selected, otherwise light
  const bgColor = disabled
    ? "bg-[#e9eff7]"
    : value
    ? "bg-wInput"
    : "bg-SemiWhite";

  return (
    <div className="flex flex-col mb-4 relative">
      {label && (
        <label
          htmlFor={id}
          className="pl-2 pb-1 text-md font-semibold lg:text-lg text-Primary"
        >
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full text-Primary text-left
          px-4 py-2 lg:py-3 pr-10
          border-2 border-Primary ${bgColor}
          rounded-3xl
          placeholder-[#97A9BE]
          focus:outline-none focus:ring-1 focus:ring-Secondary focus:border-Secondary
          transition-colors
          appearance-none
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
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#97A9BE]">
        <Triangle size={16} className="rotate-180" />
      </div>
    </div>
  );
};

export default AuthDropdown;
