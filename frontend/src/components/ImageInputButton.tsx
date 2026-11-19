import React from "react";
import { Upload, Loader2, X } from "lucide-react";

interface ImageInputButtonProps {
  id: string;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
  text?: string;
  onRemoveFile?: () => void;
  disabled?: boolean;
}

/**
 * @component ImageInputButton
 * @description A reusable button component for file input.
 * It displays different states:
 * 1. Default: "Upload file or image" prompt.
 * 2. File Selected: Displays the provided `text` (e.g., filename) and an optional 'X' button to remove the file if `onRemoveFile` is provided.
 * 3. Loading: Shows a spinner and "Processing..." text, disabling interactions.
 *
 * The actual file input is hidden and triggered by clicking the styled label.
 *
 * @param {ImageInputButtonProps} props - The props for the component.
 * @param {function(React.ChangeEvent<HTMLInputElement>): void} props.onFileChange - Handler for when a new file is selected.
 * @param {boolean} [props.loading=false] - Indicates if the component is in a loading state.
 * @param {string} [props.text] - Text to display when a file is selected (e.g., filename).
 * @param {function(): void} [props.onRemoveFile] - Handler for removing the selected file.
 *
 * @example
 * <ImageInputButton
 *   onFileChange={handleFileSelected}
 *   loading={isUploading}
 *   text={selectedFileName}
 *   onRemoveFile={handleClearFile}
 * />
 */
const ImageInputButton: React.FC<ImageInputButtonProps> = ({
  id,
  onFileChange,
  loading = false,
  text,
  onRemoveFile,
  disabled,
}) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (loading) return;
    onFileChange(event);
  };
  return (
    <div className="mt-2 mb-2">
      <label
        htmlFor={id}
        className={`flex items-center justify-center gap-2 w-64 h-10 border border-Primary rounded-md px-4 ${
          loading
            ? "bg-gray-200 text-gray-500 cursor-not-allowed" // Example loading styles
            : "cursor-pointer hover:bg-Primary/5" // Assuming Primary is a custom color
        }`}
      >
        {loading ? (
          <>
            <Loader2 size={20} className="text-Primary animate-spin" />
            <span className="text-Primary">Processing...</span>
          </>
        ) : (
          <>
            {text ? (
              <>
                <span className="text-Primary truncate max-w-[150px] xs:max-w-[180px] sm:max-w-[200px]">
                  {text}
                </span>
                {onRemoveFile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault(); // Important: prevent label's default action
                      e.stopPropagation(); // Important: stop event from bubbling to label
                      onRemoveFile();
                    }}
                    className="ml-2 p-1 text-red-500 hover:text-red-700 flex-shrink-0"
                    aria-label="Remove file"
                    disabled={loading || disabled}
                  >
                    <X size={20} className="text-Primary" />
                  </button>
                )}
              </>
            ) : (
              <>
                <Upload size={20} className="text-Primary" />
                <span className="text-Primary">Upload file or image</span>
              </>
            )}
          </>
        )}
        <input
          type="file"
          id={id}
          className="hidden"
          accept="image/*"
          onChange={handleInputChange} // Use the wrapper
          disabled={loading} // Disable the input when loading
        />
      </label>
    </div>
  );
};

export default ImageInputButton;
