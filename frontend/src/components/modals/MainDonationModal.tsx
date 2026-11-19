import React, { useEffect, useState } from "react";
import MonetaryDonationForm from "./MonetaryDonationForm";
import InKindDonationFormRefactor from "./InKindDonationFormRefactor";
import type DonationProps from "../../types/donation";
import WebModal from "./WebModal";

/**
 * Main donation modal component that handles the donation type selection flow.
 * Provides a multi-step modal interface for selecting between monetary and in-kind donations,
 * with subsequent subtype selection.
 *
 * @component
 * @param {DonationProps} donation - The donation event details
 *
 * @example
 * <MainDonationModal donation={donationData} />
 */
const MainDonationModal: React.FC<{
  donation: DonationProps;
  onSuccess?: () => void;
}> = ({ donation, onSuccess }) => {
  const [donationType, setDonationType] = useState<
    "Monetary" | "InKind" | null
  >(null);
  const [subType, setSubType] = useState<
    "Bank" | "Ebank" | "Pickup" | "Dropoff" | null
  >(null);

  // Unique IDs for each modal per donation
  const typeModalId = `main_donation_modal_${donation._id}`;
  const subtypeModalId = `donation_subtype_modal_${donation._id}`;
  const finalMonetaryModalId = `monetary_donation_modal_${donation._id}`;
  const finalInKindModalId = `inkind_donation_modal_${donation._id}`;
  const thanksModalId = `thanks_donation_modal_${donation._id}`;

  // Add this to MainDonationModal.tsx, right after your state declarations
  useEffect(() => {
    // Only run this logic when the typeModalId is actually open/showing
    const modalElement = document.getElementById(typeModalId) as HTMLDialogElement;
    if (!modalElement?.open) return;
    
    const storedType = localStorage.getItem('activeDonationType');
    console.log("Checking stored donation type:", storedType);
    
    if (storedType === 'inkind') {
      console.log("Setting to InKind donation type");
      setDonationType('InKind');
      localStorage.removeItem('activeDonationType');
      
      // Close the type modal first
      (document.getElementById(typeModalId) as HTMLDialogElement)?.close();
      
      // Wait briefly then show subtype modal
      setTimeout(() => {
        console.log("Opening subtype modal for inkind");
        (document.getElementById(subtypeModalId) as HTMLDialogElement)?.showModal();
      }, 100);
    } else if (storedType === 'monetary') {
      console.log("Setting to Monetary donation type");
      setDonationType('Monetary');
      localStorage.removeItem('activeDonationType');
      
      // Close the type modal first
      (document.getElementById(typeModalId) as HTMLDialogElement)?.close();
      
      // Wait briefly then show subtype modal
      setTimeout(() => {
        console.log("Opening subtype modal for monetary");
        (document.getElementById(subtypeModalId) as HTMLDialogElement)?.showModal();
      }, 100);
    }
  }, [typeModalId, subtypeModalId]);

  /**
   * Handles donation type selection
   * @param {"Monetary" | "InKind"} type - Selected donation type
   */
  const handleTypeSelect = (type: "Monetary" | "InKind") => {
    setDonationType(type);
    (document.getElementById(typeModalId) as HTMLDialogElement)?.close();
    (document.getElementById(subtypeModalId) as HTMLDialogElement)?.showModal();
  };

  /**
   * Handles donation subtype selection
   * @param {"Bank" | "Ebank" | "Pickup" | "Dropoff"} type - Selected donation sub type
   */
  const handleSubtypeSelect = (
    type: "Bank" | "Ebank" | "Pickup" | "Dropoff"
  ) => {
    setSubType(type);

    const currentDonationType = donationType;
    const finalModalId =
      currentDonationType === "Monetary"
        ? finalMonetaryModalId
        : finalInKindModalId;

    (document.getElementById(subtypeModalId) as HTMLDialogElement)?.close();

    // Show the forms
    setTimeout(() => {
      (document.getElementById(finalModalId) as HTMLDialogElement)?.showModal();
    }, 100);
  };

  /**
   * Closes all modals in the donation flow
   */
  const closeAllModals = () => {
    [
      typeModalId,
      subtypeModalId,
      finalMonetaryModalId,
      finalInKindModalId,
    ].forEach((id) => {
      (document.getElementById(id) as HTMLDialogElement)?.close();
    });
  };

  return (
    <>
      {/* Main Type Selection Modal */}
      <dialog id={typeModalId} className="modal">
        <WebModal
          id={subtypeModalId}
          header=""
          body={
            <h3 className="font-bold text-lg text-Primary text-center">
              How would you like to donate?
            </h3>
          }
          primaryButtonText="In-Kind"
          primaryButtonAction={() => handleTypeSelect("InKind")}
          isPrimaryButtonDisabled={!donation.allow_non_monetary}
          secondaryButtonText="Monetary"
          secondaryButtonVariant="major"
          secondaryButtonAction={() => handleTypeSelect("Monetary")}
          isSecondaryButtonDisabled={!donation.allow_monetary}
          resetAction={closeAllModals}
          buttonLayout="vertical"
          showTopRightClose={false}
          styles="w-[70vw] sm:w-[30vw] h-auto max-w-[80vw] sm:max-w-[30vw] max-h-[40vh]"
          backdrop={window.innerWidth < 640 ? "none" : "primary"}
        />
      </dialog>

      {/* Subtype Selection Modal */}
      <dialog id={subtypeModalId} className="modal">
        <WebModal
          id={subtypeModalId}
          header=""
          body={
            <h3 className="font-bold text-lg text-Primary text-center">
              {donationType === "Monetary"
                ? "Choose a payment method:"
                : "How would you like to donate your items?"}
            </h3>
          }
          primaryButtonText={
            donationType === "Monetary" ? "GCash / Maya" : "Dropoff"
          }
          primaryButtonAction={
            donationType === "Monetary"
              ? () => handleSubtypeSelect("Ebank")
              : () => handleSubtypeSelect("Dropoff")
          }
          secondaryButtonText={
            donationType === "Monetary" ? "Bank Transfer" : "Pick-up"
          }
          secondaryButtonAction={
            donationType === "Monetary"
              ? () => handleSubtypeSelect("Bank")
              : () => handleSubtypeSelect("Pickup")
          }
          secondaryButtonVariant="major"
          buttonLayout="vertical"
          showTopRightClose={false}
          resetAction={closeAllModals}
          styles="w-[70vw] sm:w-[30vw] h-auto max-w-[80vw] sm:max-w-[30vw] max-h-[40vh]"
          backdrop={window.innerWidth < 640 ? "none" : "primary"}
        />
      </dialog>

      {/* Final Modals */}
      <dialog id={finalMonetaryModalId} className="modal">
        {subType && (subType === "Bank" || subType === "Ebank") && (
          <MonetaryDonationForm
            modalId={finalMonetaryModalId}
            donationEvent={donation}
            type={subType}
            onSuccess={() => {
              if (onSuccess) onSuccess();
            }}
          />
        )}
      </dialog>

      <dialog id={finalInKindModalId} className="modal">
        {subType && (subType === "Pickup" || subType === "Dropoff") && (
          <InKindDonationFormRefactor
            modalId={finalInKindModalId}
            donationEvent={donation}
            type={subType}
            onSuccess={() => {
              if (onSuccess) onSuccess();
            }}
          />
        )}
      </dialog>

      {/* Thank You Modal */}
      <dialog id={thanksModalId} className="modal">
        <WebModal
          id={thanksModalId}
          header=""
          body={
            <div className="text-Primary text-center text-lg sm:text:xl">
              <p>Please wait for a notification/email for verification</p>
              <br />
              <p>Thank you for your kind heart!</p>
            </div>
          }
          primaryButtonText="Go Back"
          primaryButtonAction={() => {
            (
              document.getElementById(thanksModalId) as HTMLDialogElement
            )?.close();
          }}
          resetAction={() => {
            (
              document.getElementById(thanksModalId) as HTMLDialogElement
            )?.close();
          }}
          showTopRightClose={false}
          styles="w-[70vw] sm:w-[30vw] h-auto max-w-[80vw] sm:max-w-[30vw] max-h-[40vh]"
          backdrop={window.innerWidth < 640 ? "none" : "primary"}
          buttonFullWidth={true}
        />
      </dialog>
    </>
  );
};

export default MainDonationModal;
