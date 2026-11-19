import React from "react";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  className,
}) => {
  return (
    <label
      className={`flex items-center space-x-2 cursor-pointer ${className}`}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 border-2 rounded border-[#094EA0] accent-[#094EA0] cursor-pointer sr-only"
        />
        <div className={`w-4 h-4 border-2 rounded ${checked ? 'bg-[#094EA0] border-[#094EA0]' : 'border-[#094EA0]'}`}>
          {checked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg 
                className="w-3 h-3 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
      {label && <span className={`text-sm ${className}`}>{label}</span>}
    </label>
  );
};

export default Checkbox;