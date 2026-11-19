import React, {
  Suspense,
  FC,
  lazy,
  useEffect,
  useState,
  LazyExoticComponent,
} from "react";
// import { type IconName as LucideIconName } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";

// Type for the icon names, derived from lucide-react's dynamic imports
export type IconName = keyof typeof dynamicIconImports;

// Helper function to dynamically load Lucide icons using React.lazy
const loadIcon = (
  name: IconName
): React.LazyExoticComponent<FC<{ className?: string }>> => {
  const importPromise = dynamicIconImports[name];
  if (!importPromise) {
    return lazy(
      dynamicIconImports["alert-circle"] as () => Promise<{
        default: FC<{ className?: string }>;
      }>
    );
  }
  // Cast the promise to the expected type for React.lazy
  return lazy(
    importPromise as () => Promise<{ default: FC<{ className?: string }> }>
  );
};

interface ReusableInputFieldProps {
  id?: string;
  name: string;
  label?: string;
  value: string | number;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute; // 'text', 'password', 'email', 'number', etc.
  isTextArea?: boolean;
  rows?: number;
  isRequired?: boolean;
  disabled?: boolean;
  iconName?: IconName;
  iconPosition?: "left" | "right";
  onIconClick?: () => void;
  error?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string; // for the input element itself
  iconContainerClassName?: string; // for the icon's span container
  iconClassName?: string; // for the icon itself
  inputRef?: React.Ref<HTMLInputElement>; // to forward ref to the input element
}

const InputField: React.FC<ReusableInputFieldProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  isTextArea = false,
  rows = 0,
  isRequired = false,
  disabled = false,
  iconName,
  iconPosition = "left",
  onIconClick,
  error,
  className = "",
  labelClassName = "",
  inputClassName = "",
  iconContainerClassName = "",
  iconClassName = "",
  inputRef,
}) => {
  const [IconComponent, setIconComponent] = useState<LazyExoticComponent<
    FC<{ className?: string | undefined }>
  > | null>(null);
  const inputId = id || name; // Use provided id or fallback to name

  // Dynamically load the icon component if iconName is provided on mount
  useEffect(() => {
    const icon = iconName ? loadIcon(iconName) : null;
    setIconComponent(icon);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // style
  const baseLabelClasses = "block text-sm sm:text-md font-medium text-Label";
  const baseInputClasses =
    "block w-full rounded-xl focus:ring-2 focus:ring-opacity-50 transition duration-150 ease-in-out sm:text-sm";
  const enabledInputClasses =
    "border border-ProfileBorder bg-white placeholder-gray-400 focus:outline-none focus:border-transparent focus:ring-offset-0 focus:ring-Secondary";
  const disabledInputClasses =
    "disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:shadow-none cursor-not-allowed";
  const errorInputClasses =
    "border-[#ce5656] text-[#ce5656] placeholder-red-300 focus:border-[#ce5656] focus:ring-[#ce5656]";
  const baseIconContainerClasses = "absolute inset-y-0 flex items-center";
  const baseIconClasses = "h-5 w-5 text-DarkBlue";
  const baseErrorIconClasses = "h-5 w-5 text-Error";

  // Conditional padding for input based on icon presence and position
  let paddingClasses = "px-3 py-2"; // Default padding
  if (iconName) {
    paddingClasses =
      iconPosition === "left" ? "pl-10 pr-3 py-2" : "pr-10 pl-3 py-2";
  }

  return (
    <div className={`${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className={`${baseLabelClasses} ${labelClassName} mb-1`}
        >
          {label}
          {isRequired && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <div
        className={`w-full ${error ? "tooltip tooltip-error text-white" : ""}`}
        data-tip={error}
      >
        {/* Input container (for icon positioning) */}
        <div className="relative w-full">
          {/* Icon */}
          {IconComponent && !isTextArea && (
            <div
              className={`${baseIconContainerClasses} ${
                iconPosition === "left" ? "left-0 pl-3" : "right-0 pr-3"
              } ${
                onIconClick ? "cursor-pointer" : ""
              } ${iconContainerClassName}`}
              onClick={onIconClick}
              aria-hidden="true" // Icon is decorative or action described by context
            >
              <Suspense>
                <IconComponent
                  className={`${
                    error ? baseErrorIconClasses : baseIconClasses
                  } ${iconClassName}`}
                />
              </Suspense>
            </div>
          )}

          {/* Input element */}
          {isTextArea ? (
            <textarea
              id={inputId}
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              required={isRequired}
              disabled={disabled}
              ref={inputRef as React.Ref<HTMLTextAreaElement>}
              rows={rows || 3}
              className={`
                ${baseInputClasses}
                ${paddingClasses}
                resize-none
                ${disabled ? disabledInputClasses : enabledInputClasses}
                ${
                  error
                    ? errorInputClasses
                    : disabled
                    ? ""
                    : enabledInputClasses
                }
                ${inputClassName}
                `}
              aria-invalid={!!error}
              aria-describedby={error ? `${inputId}-error` : undefined}
            />
          ) : (
            <input
              type={type}
              id={inputId}
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              required={isRequired}
              disabled={disabled}
              ref={inputRef}
              className={`
      ${baseInputClasses}
      ${paddingClasses}
      ${disabled ? disabledInputClasses : enabledInputClasses}
      ${error ? errorInputClasses : disabled ? "" : enabledInputClasses}
      ${inputClassName}
    `}
              aria-invalid={!!error}
              aria-describedby={error ? `${inputId}-error` : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default InputField;
