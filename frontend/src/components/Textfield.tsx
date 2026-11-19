// Textfield.tsx
import React from "react";

interface TextfieldProps {
  label: string;
  type?: string;
  value: string;
  placeholder: string;
  id?: string;
  icon?: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const Textfield: React.FC<TextfieldProps> = ({
  label,
  type = "text",
  value,
  placeholder,
  id,
  icon,
  onChange,
  required = false,
}) => {
  // background toggles based on whether there's any input
  const bgColor = value ? "bg-wInput" : "bg-SemiWhite";

  return (
    <div className="flex flex-col w-full">
      <label className="pt-2 pl-2 mb-1 font-semibold text-md lg:text-lg text-Primary">
        {label}
      </label>
      <div className="relative w-full">
        {icon && (
          <div className="absolute inset-y-0 flex items-center left-3 text-Primary">
            {icon}
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          required={required}
          className={`w-full px-4 py-2 lg:py-3 border border-[#A9C1DE] rounded-3xl focus:outline-none focus:ring-1 focus:ring-Secondary focus:border-transparent placeholder-[#97A9BE] ${
            icon ? "pl-10" : "pl-4"
          }`}
        />
      </div>
    </div>
  );
};

export default Textfield;
