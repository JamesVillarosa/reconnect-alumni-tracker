import { ChevronDown } from "lucide-react";
import { useState } from "react";

type JobsDropdownProps =
  | {
      choices: string[];
      label: string;
      selected: string[];
      setSelected: React.Dispatch<React.SetStateAction<string[]>>;
      multipleChoice: true;
      alt?: boolean;
      className?: string;
    }
  | {
      choices: string[];
      label: string;
      selected: string;
      setSelected: React.Dispatch<React.SetStateAction<string>>;
      multipleChoice?: false;
      alt?: boolean;
      className?: string;
    };

/**
 * A dropdown component for selecting one or multiple choices from a list.
 *
 * @param className - Additional classes to customize styling.
 * @param choices - List of selectable choices.
 * @param label - Placeholder text when no selection is made.
 * @param selected - The current selected choice(s).
 * @param multipleChoice - Whether multiple selections are allowed.
 * @param setSelected - Function to update the selection.
 * @param alt - Alternate styling toggle.
 */
const JobsDropdown = ({
  choices,
  label,
  selected,
  multipleChoice,
  setSelected,
  alt,
  className,
}: JobsDropdownProps) => {
  const [isOpen] = useState<boolean>(false);

  return (
    <div className="dropdown card cursor-pointer text-primary dropdown-start dropdown-bottom rounded-xl">
      <div
        tabIndex={0}
        role="button"
        className={`h-10 font-normal placeholder cursor-pointer flex justify-between focus:outline-white input ${
          alt
            ? "rounded-full text-white bg-transparent border-2"
            : "w-full rounded-xl border-2 sm:border-none border-DarkBlue outline-0 bg-white"
        } ${
          selected && (Array.isArray(selected) ? selected.length > 0 : selected)
            ? ""
            : "text-Primary/50"
        } ${className ?? ""}`}
      >
        <div className="flex overflow-hidden max-w-[27ch] gap-2 no-scrollbar rounded-full">
          {Array.isArray(selected) ? (
            selected.length > 0 ? (
              <>
                {/* Only one category selected */}
                {selected.length == 1 && (
                  <span className={`text-sm whitespace-nowrap`}>
                    {selected[0]}
                  </span>
                )}

                {/* Two or more categories selected */}
                {selected.length > 1 && (
                  <span className="text-sm whitespace-nowrap">
                    {selected.length} categories selected
                  </span>
                )}
              </>
            ) : (
              label
            )
          ) : selected ? (
            selected
          ) : (
            label
          )}
        </div>

        <ChevronDown
          className={`transition-all duration-75 ${
            alt ? "text-white" : "text-primary"
          } ${isOpen ? "rotate-180" : ""} ${className ?? ""}`}
          strokeWidth={2}
        />
      </div>

      <ul
        tabIndex={0}
        className="dropdown-content flex-nowrap overflow-y-auto max-h-[150px] sm:max-h-screen flex flex-col menu gap-1 bg-base-100 rounded-box shadow z-[1] rounded-xl mt-2 w-full"
      >
        {choices.map((choice, index) => (
          <div key={index} className="flex w-full">
            <a
              onClick={() => {
                if (multipleChoice) {
                  setSelected((prevSelected: string[] | string) => {
                    if (Array.isArray(prevSelected)) {
                      if (prevSelected.includes(choice)) {
                        return prevSelected.filter((c) => c !== choice);
                      } else {
                        return [...prevSelected, choice];
                      }
                    } else {
                      return [choice];
                    }
                  });
                } else {
                  setSelected(choice);
                }
              }}
              className={`grow rounded-lg p-2 text-lg sm:text-base active:bg-transparent focus:bg-transparent transition ${
                (
                  multipleChoice
                    ? Array.isArray(selected) && selected.includes(choice)
                    : selected === choice
                )
                  ? "bg-primary text-white"
                  : "hover:bg-MidBlue"
              }`}
            >
              {choice}
            </a>
          </div>
        ))}
        <div
          className="btn border-none hidden sm:flex bg-none w-full justify-center p-0 rounded-lg cursor-pointer font-semibold text-xs text-Error hover:bg-Error/15 transition-colors duration-75"
          onClick={() => {
            if (multipleChoice) {
              setSelected([]);
            } else {
              setSelected("");
            }
          }}
        >
          Clear {multipleChoice && `(${selected.length})`}
        </div>
      </ul>
    </div>
  );
};

export default JobsDropdown;
