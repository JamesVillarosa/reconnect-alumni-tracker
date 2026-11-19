import { X } from "lucide-react";
import React, { ReactNode } from "react";

interface MobileModalProps {
  id: string;
  className?: string;
  children: ReactNode;
  title: string;
  primaryButton?: {
    label: string;
    onClick: () => void;
    className?: string;
  };
  secondaryButton?: {
    label: string;
    onClick: () => void;
    className?: string;
  };
}

/**
 *
 * @param id - The id of the modal, use this to open the modal by calling `showModal(id)`
 * @param className - Additional classes to apply to the modal
 * @param children - The content to be displayed in the modal body
 * @param title - The text to be displayed in the header part
 * @param primaryButton - Configuration for the primary button (label, onClick, and optional className)
 * @param secondaryButton - Configuration for the secondary button (label, onClick, and optional className)
 */
const ModalCard: React.FC<MobileModalProps> = ({
  id,
  className,
  children,
  title,
  primaryButton,
  secondaryButton,
}) => {
  return (
    <dialog id={id} className={`text-white modal ${className || ""}`}>
      <div
        tabIndex={0}
        className="p-0 shadow-lg dropdown-content card card-sm bg-white z-1 min-w-80 rounded-2xl modal-box"
      >
        {/* Header */}
        <div className="bg-white sticky top-0 flex items-center w-full h-full text-primary px-6 py-4 justify-between border-b-DarkBlue border-b-2">
          <h2 className="font-bold text-3xl">{title}</h2>
          <form method="dialog">
            <button className="rounded-full w-fit p-1 text-lg transition-all duration-100 border-none text-Primary bg-none active:brightness-90 hover:bg-FaintBlue hover:text-Primary">
              <X />
            </button>
          </form>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 overflow-y-auto card-body max-h-[500px] px-9 pt-6 pb-9 text-Primary w-full">
          {children}
        </div>

        {/* Footer with configurable buttons */}
        {(primaryButton || secondaryButton) && (
          <div className="sticky bottom-0 bg-white border-t border-DarkBlue gap-2 p-6 flex justify-between">
            {secondaryButton && (
              <button
                onClick={secondaryButton.onClick}
                className={`btn btn-lg flex-1 px-4 py-2 text-Primary bg-none border border-Primary rounded-lg hover:bg- hover:bg-FaintBlue transition-all duration-100 ${
                  secondaryButton.className || ""
                }`}
              >
                {secondaryButton.label}
              </button>
            )}
            {primaryButton && (
              <button
                onClick={primaryButton.onClick}
                className={`btn btn-lg flex-1 px-4 py-2 bg-Primary text-white rounded-lg hover:bg-Primary/90 transition-all duration-100 ${
                  primaryButton.className || ""
                }`}
              >
                {primaryButton.label}
              </button>
            )}
          </div>
        )}
      </div>

      <form method="dialog" className="modal-backdrop bg-Gray/30">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default ModalCard;
