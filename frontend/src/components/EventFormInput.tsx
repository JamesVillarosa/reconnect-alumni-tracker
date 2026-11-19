import { Calendar, Upload } from "lucide-react";
import { useRef } from "react";

interface TextfieldProps {
    label: string;
    value: string | number;
    placeholder: string;
    id?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    required?: boolean;
}

/**
 * A text field for Create Event Form in Create Event Form Page.
 * @param {string} label - label of the textfield
 * @param {string} value - value of the textfield
 * @param {string} placeholder - placeholder of the textfield
 * @param {string} id - optional; id of the textfield
 * @param {function} onChange - for changing the value to the given input by the user
 * @param {boolean} required - sets the textfield as required and adds a red asterisk at the end of the label
 * 
 * @example
 * <EventFormTextField
      label="Title"
      value={title}
      placeholder="Title"
      onChange={(e) => {setTitle(e.target.value)}}
      required={true}
    />
 */
export const EventFormTextField: React.FC<TextfieldProps> = ({
    label,
    value,
    placeholder,
    id,
    onChange,
    required = false,
}) => {
    return (
      <div className="flex flex-col">
        <label className="pl-1 text-lg font-bold text-Primary">
          {label}{required && <span className="text-Required">*</span>}
        </label>
        <input
            type="text"
            value={value === 0 ? '' : value}
            placeholder={placeholder}
            id={id}
            onChange={onChange}
            required={required}
            className={`w-full bg-white text-sm px-4 py-2 lg:py-3 border-2 border-DarkerPrimary rounded-xl focus:outline-none focus:ring-1 focus:ring-Secondary focus:border-blue-500`}
        />
      </div>
    );
};

/**
 * A textarea input for Create Event Form in Create Event Form Page.
 * @param {string} label - label of the textarea
 * @param {string} value - value of the textarea
 * @param {string} placeholder - placeholder of the textarea
 * @param {string} id - optional; id of the textarea
 * @param {function} onChange - for changing the value to the given input by the user
 * @param {boolean} required - sets the textarea as required and adds a red asterisk at the end of the label
 * 
 * @example
 * <EventFormTextAreaField
      label="Description"
      value={description}
      placeholder="Add description"
      onChange={(e) => {setDescription(e.target.value)}}
      required={true}
    />
 */
export const EventFormTextAreaField: React.FC<TextfieldProps> = ({
    label,
    value,
    placeholder,
    id,
    onChange,
    required = false,
}) => {
    return (
      <div className="flex flex-col">
        <label className="pl-1 text-lg font-bold text-Primary">
          {label}{required && <span className="text-Required">*</span>}
        </label>
        <textarea
            value={value}
            placeholder={placeholder}
            id={id}
            onChange={onChange}
            required={required}
            className={`w-full bg-white text-sm px-4 py-2 lg:py-3 border-2 border-DarkerPrimary rounded-xl focus:outline-none focus:ring-1 focus:ring-Secondary focus:border-blue-500`}
        />
      </div>
    );
};

/**
 * An upload image button and functionality for Create Event Form in Create Event Form Page.
 * Displays the uploaded image below the button.
 * @param {string} label - label of the image upload button
 * @param {string} value - value of the image upload button
 * @param {function} onChange - for changing the value to the given input by the user
 * @param {boolean} required - sets the textarea as required and adds a red asterisk at the end of the label
 * 
 * @example
 * <UploadImageButton
      label="Cover"
      value={coverImageString}
      changeImage={(file) => setCoverImageString(file ? URL.createObjectURL(file) : '')}
  />
 */
export const UploadImageButton: React.FC<{
  label: string;
  value: string;
  changeImage: (file: File | null) => void;
  required?: boolean;
}> = ({
  label,
  value,
  changeImage,
  required = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    changeImage(file);
  };

  return (
    <div className="flex flex-col">
      <label className="pl-1 text-lg font-bold text-Primary">
        {label}{required && <span className="text-Required">*</span>}
      </label>

      {/* Upload button */}
      <button
        type="button"
        className="flex gap-2 w-50 text-DarkerPrimary bg-white text-sm px-4 py-2 border-2 border-DarkerPrimary rounded-xl items-center cursor-pointer"
        onClick={handleButtonClick}
      >
        <Upload />
        Upload Image
      </button>

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Image preview / value */}
      {value && (
        <img
          src={value}
          alt="Uploaded preview"
          className="mt-4 w-full max-h-60 object-cover rounded-xl shadow-sm"
        />
      )}
    </div>
  );
};

/**
 * An date input for Create Event Form in Create Event Form Page.
 * @param {string} label - label of the date input
 * @param {string} value - value of the date input
 * @param {function} changeDate - for changing the value to the given input by the user
 * @param {boolean} required - sets the textarea as required and adds a red asterisk at the end of the label
 * 
 * @example
 * <DateInput 
      label="Date"
      value={date}
      changeDate={setDate}
      required={true}
  />
 */
export const DateInput: React.FC<{
  label: string,
  value: string,
  changeDate: (value: string) => void;
  required?: boolean
}> = ({
  label,
  value,
  changeDate,
  required = false,
}) => {
  return (
    <div className="flex flex-col">
      <label className="pl-1 text-lg font-bold text-Primary">
        {label}{required && <span className="text-Required">*</span>}
      </label>
      <div className="flex gap-2 w-50 text-DarkerPrimary bg-white text-sm px-4 py-2 border-2 border-DarkerPrimary rounded-xl items-center cursor-pointer">
        <Calendar />
        <input 
          type="date"
          value={value}
          onChange={(e) => {changeDate(e.target.value)}}
          required={required}
          className="focus:outline-none" 
        />
      </div>
    </div>
  );
};
