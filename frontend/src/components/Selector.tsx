import { useEffect, useState } from "react";

interface SelectorProps<T> {
  options: T[];
  onSelect: (selectedOption: T) => void;
  label: string | React.ReactNode;
  isRequired?: boolean;
  value?: T;
}

/**
 * A group-selector for form pages.
 * @param {string} label – Label displayed above the option buttons.
 * @param {T[]} options – Array of options to choose from.
 * @param {T} [value] – Currently selected option.
 * @param {(option: T) => void} onSelect – Callback fired with the newly selected option.
 *
 * @example
 * <Selector
 *   label="Donation Type"
 *   options={["Monetary", "Non-monetary"]}
 *   value={donationType}
 *   onSelect={setDonationType}
 * />
 */

const Selector = <T extends string>({
  options,
  onSelect,
  label,
  value,
  isRequired = false,
}: SelectorProps<T>) => {
  const [selected, setSelected] = useState<T>(value || options[0]);

  useEffect(() => {
    if (value && value !== selected) {
      setSelected(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleSelect = (option: T) => {
    setSelected(option);
    onSelect(option);
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
                              selected === option
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

export default Selector;
