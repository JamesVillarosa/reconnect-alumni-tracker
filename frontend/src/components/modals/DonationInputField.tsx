import React from "react";

interface DonationInputFieldProps {
  /** The label text displayed above the input field */
  label?: string;
  /** The type of input (e.g., 'text', 'number', 'email') */
  type?: string;
  /** The current value of the input field */
  value: string;
  /** Placeholder text displayed when the input is empty */
  placeholder: string;
  /** Unique identifier for the input element */
  id?: string;
  /** Optional icon displayed inside the input field on the left side */
  icon?: React.ReactNode;
  /** Callback function triggered when input value changes */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Whether the field is required (shows asterisk) */
  required?: boolean;
  /** Additional custom CSS classes for styling */
  styles?: string;
  /** Whether the input is disabled */
  isDisabled?: boolean;
  /** Maximum length of input */
  maxLen?: number;
}

/**
 * A customizable input field component for donation forms with optional icon and label.
 * 
 * @component
 * @example
 * // Basic usage
 * <DonationInputField
 *   label="Full Name"
 *   type="text"
 *   value={name}
 *   placeholder="Enter your full name"
 *   onChange={(e) => setName(e.target.value)}
 *   required
 * />
 * 
 * @example
 * // With icon
 * <DonationInputField
 *   label="Email"
 *   type="email"
 *   value={email}
 *   placeholder="your@email.com"
 *   onChange={(e) => setEmail(e.target.value)}
 *   icon={<EnvelopeIcon className="h-4 w-4" />}
 * />
 */
const DonationInputField: React.FC<DonationInputFieldProps> = ({
  label,
  type = "text",
  value,
  placeholder,
  id,
  icon,
  onChange,
  required = false,
  styles,
  isDisabled,
  maxLen,
}) => {
  return (
    <div className="flex flex-col mb-2">
      {/* Label */}
      {label && (
        <label className="pt-2 text-sm sm:text-base md:text-md font-semibold mb-1 text-Label">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Icon */}
      <div className="relative w-full">
        {icon && (
          <div className="absolute inset-y-0 left-3 flex items-center text-Label text-xs sm:text-sm">
            {icon}
          </div>
        )}

        {/* Input Field */}
        <input
          maxLength={maxLen}
          type={type}
          value={value}
          placeholder={placeholder}
          id={id}
          onChange={onChange}
          required={required}
          className={`${isDisabled ? "text-Gray" : "text-Label"} w-full ${styles} 
            text-xs sm:text-base md:text-md 
            px-2.5 sm:px-4 
            py-2 sm:py-2.5 lg:py-3 
            bg-SemiWhite border border-Primary rounded-3xl 
            focus:outline-none focus:ring-1 focus:ring-Secondary focus:border-blue-500 placeholder-Gray 
            ${icon ? "pl-10 sm:pl-12" : "pl-3 sm:pl-5"}`}
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};

export default DonationInputField;
