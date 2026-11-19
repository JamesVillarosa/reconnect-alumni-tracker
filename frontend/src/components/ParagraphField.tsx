// ParagraphField.tsx
import React from "react";

interface ParagraphFieldProps {
  label: string;
  placeholder?: string;
  isResizable?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

/**
 * A multi-line text area for form descriptions or comments.
 * @param {string} label – Label shown above the textarea.
 * @param {string} [placeholder="Type here"] – Placeholder text when empty.
 * @param {string} [isResizable=false] – Option to allow resizing of text area.
 * @param {string} value – Controlled value of the textarea.
 * @param {(e: React.ChangeEvent<HTMLTextAreaElement>) => void} onChange – Change handler.
 *
 * @example
 * <ParagraphField
 *   label="Description*"
 *   placeholder="Enter detailed description"
 *   value={description}
 *   onChange={e => setDescription(e.target.value)}
 * />
 */

const ParagraphField: React.FC<ParagraphFieldProps> = ({
  label,
  placeholder = "Type here",
  isResizable = true,
  value,
  onChange,
}) => {
  // use the same logic for background as Textfield
  const bgColor = value ? "bg-wInput" : "bg-SemiWhite";

  return (
    <div className="flex flex-col mb-4">
      <label
        htmlFor="paragraph"
        className="pl-2 mb-1 font-semibold text-md lg:text-lg text-Primary"
      >
        {label}
      </label>
      <textarea
        id="paragraph"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`
          ${
          isResizable ? "" : "resize-none"
        } w-full min-h-30 px-4 py-4 border border-[#A9C1DE] rounded-3xl focus:outline-none focus:ring-1 focus:ring-Secondary focus:border-transparent text-sm
          w-full
          min-h-[120px]
          px-4 py-3
          border-2 ${bgColor} border-Primary
          rounded-3xl
          placeholder-[#97A9BE]
          focus:outline-none focus:ring-1 focus:ring-Secondary focus:border-Secondary
          transition-colors
          text-sm
        `}
      />
    </div>
  );
};

export default ParagraphField;
