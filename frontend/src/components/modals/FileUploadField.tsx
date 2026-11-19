import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { X } from "lucide-react"; // Changed from ImageIcon to X

type Props = {
  /** Unique identifier for the file input */
  id: string;
  /** Currently selected file object */
  file: File | null;
  /** Callback when a new file is selected */
  onFileChange: (file: File) => void;
  /** Label text displayed above the upload button */
  label: string;
  /** Placeholder text for the upload button */
  placeholder?: string;
  /** Optional icon displayed inside the upload button */
  icon?: React.ReactNode;
  /** Whether the field is required (shows asterisk) */
  required?: boolean;
  /** Whether to show file preview and details */
  withPreview?: boolean;
  /** Callback when file removal is requested */
  onCancel: () => void;
};

/**
 * Ref handle for imperative operations on the FileUploadField component
 * @typedef {Object} FileUploadHandle
 * @property {Function} reset - Clears the currently selected file
 */
export type FileUploadHandle = {
  reset: () => void;
};

/**
 * A customizable file upload component with preview capabilities(new tab).
 * Supports both controlled usage and imperative handling via ref.
 * 
 * @component
 * @example
 * // Basic usage (controlled)
 * <FileUploadField
 *   id="document-upload"
 *   file={selectedFile}
 *   onFileChange={handleFileChange}
 *   label="Upload Document"
 *   required
 * />
 * 
 * @example
 * // With preview and icon (using ref)
 * const uploadRef = useRef<FileUploadHandle>(null);
 * 
 * <FileUploadField
 *   ref={uploadRef}
 *   id="image-upload"
 *   file={imageFile}
 *   onFileChange={setImageFile}
 *   label="Profile Picture"
 *   placeholder="Select an image"
 *   icon={<UploadIcon />}
 *   withPreview
 * />
 */
const FileUploadField = forwardRef<FileUploadHandle, Props>(
  (
    {
      id,
      file,
      onFileChange,
      label,
      placeholder = "Upload file or image",
      icon,
      required = true,
      withPreview,
      onCancel,
    },
    ref
  ) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Exposes imperative methods via ref
     */
    useImperativeHandle(ref, () => ({
      /**
       * Resets the file input field
       */
      reset: () => {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
    }));
    
    /**
     * Handles file selection from the input element
     * @param {React.ChangeEvent<HTMLInputElement>} e - The file input change event
     */
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        onFileChange(e.target.files[0]);
      }
    };

    /**
     * Formats file size into human-readable format (KB or MB)
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted file size string
     */
    const formatFileSize = (bytes: number) => {
      if (bytes < 1024 * 1000) {
        return `${(bytes / 1024).toFixed(1)}KB`;
      } else {
        return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
      }
    };

    return (
      <div className="flex flex-col">
        {/* Label */}
        <label className="pt-2 text-sm sm:text-base md:text-md font-semibold mb-1 text-Label">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>

        {/* Button Mask for Input Field */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center text-xs sm:text-sm w-48 sm:w-52 px-3 py-3 border-3 border-Primary bg-none rounded-lg text-Primary font-bold"
        >
          {icon && <span className="mr-2 text-Primary">{icon}</span>}
          {placeholder}
        </button>

        {/* File Input Field (Hidden) */}
        <input
          id={id}
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileInput}
        />

        {/* Preview with Remove Button */}
        {withPreview && file && (
          <div className="mt-5 w-full flex flex-wrap items-center gap-2 text-sm text-gray-700 overflow-x-hidden">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="text-red-500 hover:text-red-700 p-1"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
            <span className="truncate max-w-[10rem] sm:max-w-[16rem]">
              {file.name}
            </span>
            <span className="text-gray-500 font-extrabold">·</span>
            <a
              href={URL.createObjectURL(file)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-Secondary hover:underline"
            >
              Preview
            </a>
            <span className="text-gray-500 ml-auto mr-2">
              {formatFileSize(file.size)}
            </span>
          </div>
        )}
      </div>
    );
  }
);

export default FileUploadField;
