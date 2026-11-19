import { useState } from "react";

interface MultiSelectorProps<T> {
  options: T[];
  onSelect: (selectedOptions: T[]) => void;
  label: string | React.ReactNode;
  isRequired?: boolean;
  values?: T[];
}

/**
 * A multi-selector for form pages, allowing multiple options to be selected.
 * @param {string} label – Label displayed above the option buttons.
 * @param {T[]} options – Array of options to choose from.
 * @param {T[]} [values] – Currently selected options.
 * @param {(options: T[]) => void} onSelect – Callback fired with the newly selected options.
 * @param {boolean} [isRequired] – Indicates if at least one selection is required.
 *
 * @example
 * <MultiSelector
 *   label="Donation Types"
 *   options={["Monetary", "Non-monetary", "Volunteer"]}
 *   values={selectedTypes}
 *   onSelect={setSelectedTypes}
 * />
 */
const MultiSelector = <T extends string>({
  options,
  onSelect,
  label,
  values = [],
  isRequired = false,
}: MultiSelectorProps<T>) => {
  const [selectedOptions, setSelectedOptions] = useState<T[]>(values);

  const handleSelect = (option: T) => {
    let updatedSelection: T[];
    if (selectedOptions.includes(option)) {
      updatedSelection = selectedOptions.filter((item) => item !== option);
    } else {
      updatedSelection = [...selectedOptions, option];
    }
    setSelectedOptions(updatedSelection);
    onSelect(updatedSelection);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="pb-2 text-sm font-medium text-Label">
        {label}
        {isRequired && <span className="text-Error">*</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            className={`px-3 py-1.5 rounded-4xl text-sm transition 
                            ${
                              selectedOptions.includes(option)
                                ? "bg-Primary text-white border border-Primary"
                                : "bg-transparent text-Label border border-Label hover:opacity-100"
                            }
                        `}
            onClick={() => handleSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MultiSelector;
