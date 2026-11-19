import { X } from "lucide-react";
import React from "react";
import CustomButton from "./CustomButton";

type WebModalProps = {
  /** Unique identifier for the modal */
  id: string;
  /** Main heading text for the modal */
  header: string;
  /** Optional subheading text */
  subheader?: string;
  /** Additional descriptive text below subheader */
  subtext?: string;
  /** Main content of the modal */
  body: React.ReactNode;
  /** Text for the primary action button */
  primaryButtonText: string;
  /** Optional text for the secondary action button */
  secondaryButtonText?: string;
  /** Varaint of secondary button from Button.tsx*/
  secondaryButtonVariant?: "major" | "minor";
  /** Callback for primary button click */
  primaryButtonAction: () => void;
  /** Optional callback for secondary button click */
  secondaryButtonAction?: () => void;
  /** Callback to reset state when modal closes */
  resetAction: () => void;
  /** Optional css overriding*/
  styles?: string;
  /** Color behind the modal*/
  backdrop?: "white" | "primary" | "none";
  /** Optional showing of close button on top right*/
  showTopRightClose?: boolean;
  /** How Buttons are arranged*/
  buttonLayout?: "horizontal" | "vertical";
  /** If the Button consumes the full width of the modal*/
  buttonFullWidth?: boolean;
  /** Is primary button disabled*/
  isPrimaryButtonDisabled?: boolean;
  /** Is secondary button disabled*/
  isSecondaryButtonDisabled?: boolean;
};

/**
 * A reusable modal component with responsive design and customizable content.
 * Supports both primary and secondary actions, and includes a close button.
 * @note Buttons snaps on the bottom right of the container. Expands Horizontally on mobile view
 *
 * @component
 * @example
 * // Basic usage
 * <WebModal
 *   id="confirmation-modal"
 *   header="Confirm Action"
 *   body={<p>Are you sure you want to proceed?</p>}
 *   primaryButtonText="Confirm"
 *   primaryButtonAction={handleConfirm}
 *   resetAction={resetModalState}
 * />
 *
 * @example
 * // With secondary action and additional text
 * <WebModal
 *   id="details-modal"
 *   header="Details"
 *   subheader="Additional Information"
 *   subtext="Please review carefully"
 *   body={<DetailsComponent />}
 *   primaryButtonText="Save"
 *   secondaryButtonText="Cancel"
 *   primaryButtonAction={handleSave}
 *   secondaryButtonAction={handleCancel}
 *   resetAction={resetModalState}
 * />
 */
const WebModal: React.FC<WebModalProps> = ({
  id,
  header,
  subheader,
  subtext,
  body,
  primaryButtonText,
  secondaryButtonText,
  secondaryButtonVariant = "minor",
  primaryButtonAction,
  secondaryButtonAction,
  resetAction,
  styles,
  backdrop = "primary",
  showTopRightClose = true,
  buttonLayout = "horizontal",
  buttonFullWidth = false,
  isPrimaryButtonDisabled = false,
  isSecondaryButtonDisabled = false,
}) => {
  return (
    <div className="flex items-center justify-center">
      {/* Modal Background */}
      {backdrop === "primary" && (
        <div
          className="fixed inset-0 bg-Gradient2 opacity-80"
          onClick={resetAction}
        />
      )}
      {backdrop === "white" && (
        <div className="fixed inset-0 bg-white" onClick={resetAction} />
      )}

      {/* Modal Box */}
      <form
        method="dialog"
        className={`
          modal-box
          w-[95vw] h-[88vh]
          sm:w-4xl sm:max-w-[80vw] sm:max-h-[80vh] sm:h-auto
          bg-white shadow-2xl sm:shadow-none
          rounded-2xl
          relative z-10 p-4 sm:p-6
          overflow-auto
          flex flex-col justify-between
          ${styles}
        `}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-5xl sm:text-3xl text-primary">
            {header}
          </h3>

          {/* Close Button (hidden on small screens) */}
          {showTopRightClose && (
            <button
              type="button"
              className="hidden sm:flex text-gray-500 hover:text-gray-700 transition cursor-pointer items-center"
              onClick={() => {
                resetAction();
                const modal = document.getElementById(id) as HTMLDialogElement;
                modal?.close();
              }}
            >
              <X size={20} />
              <span className="ml-1">Close</span>
            </button>
          )}
        </div>

        {/* Modal Body Content */}
        <div className="flex-grow overflow-auto">
          {subheader && (
            <h4 className="text-base sm:text-lg font-semibold text-primary mb-2">
              {subheader}
            </h4>
          )}
          {subtext && (
            <p className="text-sm sm:text-md text-primary mb-4">{subtext}</p>
          )}
          <div className="mb-6">{body}</div>
        </div>

        {/* Modal Buttons */}
        <div
          className={`
          flex
          ${buttonLayout === "vertical" ? "flex-col" : "flex-row"}
          ${buttonFullWidth ? "w-full" : "justify-end"}
          gap-3 sm:gap-4
          mt-auto pt-4
        `}
        >
          {secondaryButtonText && secondaryButtonAction && (
            <CustomButton
              isDisabled={isSecondaryButtonDisabled}
              variant={secondaryButtonVariant}
              onClick={secondaryButtonAction}
              type="button"
              className={`!border-none ${
                secondaryButtonVariant == "minor" ? "!text-Primary" : ""
              }  ${
                buttonFullWidth ? "!w-full" : "!w-auto"
              } !py-2 sm:!py-3 !px-6 sm:!px-8 !rounded-xl text-sm sm:text-base`}
            >
              {secondaryButtonText}
            </CustomButton>
          )}
          <CustomButton
            isDisabled={isPrimaryButtonDisabled}
            variant="major"
            onClick={primaryButtonAction}
            type="button"
            className={`!border-none ${
              buttonFullWidth ? "!w-full" : "!w-auto"
            } !py-2 sm:!py-3 !px-6 sm:!px-8 !rounded-xl text-sm sm:text-base`}
          >
            {primaryButtonText}
          </CustomButton>
        </div>
      </form>
    </div>
  );
};

export default WebModal;
