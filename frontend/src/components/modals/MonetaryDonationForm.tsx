import React, { useRef, useState } from "react";
import WebModal from "./WebModal";
import DonationProps from "../../types/donation";
import { Banknote, UploadCloud, UserCircle } from "lucide-react";
import FileUploadField, { FileUploadHandle } from "./FileUploadField";
import DonationInputField from "./DonationInputField";
import { BackAndFontAndProfileHeader } from "../MobileHeaders";
import { toastPromise } from "../../pages/utils/ToastFxn";

// Constants for bank type filtering
const bankKeys = ["bdo", "bpi", "landbank"];
const ebankKeys = ["gcash", "maya"];

// Temporary hardcoded banking details
const fakeDetails: Record<string, string> = {
  bdo: "1234-5678",
  bpi: "8765-4321",
  landbank: "1122-3344",
  gcash: "0917-123-4567",
  maya: "0927-765-4321",
};

/**
 * Form component for monetary donations (either bank transfer or e-wallet)
 * @todo attach header for mobile
 * 
 * @component
 * @param {string} modalId - Unique identifier for the modal
 * @param {DonationProps} donationEvent - Donation event details
 * @param {"Bank" | "Ebank"} type - Type of monetary donation
 * 
 * @example
 * // Bank transfer donation
 * <MonetaryDonationForm
 *   modalId="bank-donation-1"
 *   donationEvent={donationData}
 *   type="Bank"
 * />
 */
const MonetaryDonationForm: React.FC<{
  modalId: string;
  donationEvent: DonationProps;
  type: "Bank" | "Ebank";
  onSuccess?: () => void;
}> = ({ modalId, donationEvent, type, onSuccess }) => {
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [proofOfDonation, setProofOfDonation] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const fileUploadRef = useRef<FileUploadHandle>(null);

  /**
   * Filters and formats banking details based on donation type
   * @todo replace with donationEvent.bankingDetails once types are updated
   */
  const bankingDetailsList = Object.entries(donationEvent.bankingDetails || fakeDetails)
    .filter(([key]) => {
      if (type === "Bank") return bankKeys.includes(key);
      if (type === "Ebank") return ebankKeys.includes(key);
      return false;
    })
    .map(([key, value]) => (
      <p key={key} className="text-white text-sm sm:text-md">
        {key.toUpperCase()} - {value}
      </p>
    ));

  const handleImageUpload = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const res = await toastPromise(
        fetch(`${import.meta.env.VITE_API_URL}/images/upload`, {
          method: "POST",
          body: formData,
        }),
        {
          loading: {
            title: "Uploading...",
            description: "Uploading proof of donation",
            type: "info",
          },
          success: {
            title: "Success!",
            description: "Uploaded proof of donation",
            type: "success",
          },
          error: {
            title: "Failed!",
            description: "There was an error uploading the proof.",
            type: "error",
          },
        }
      );
  
      if (!res.ok) {
        console.error("Image upload failed");
        return null;
      }
  
      const data = await res.json();
      // console.log(data);
      return data.secure_url as string;
    } catch (err) {
      console.error("Error uploading image:", err);
      return null;
    }
  };

  /**
   * Handles form submission with validation
   * @todo Convert to proper type and implement actual API integration
   */
  const handleSubmit = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      setError("Please enter a valid donation amount.");
      return;
    }

    if (!proofOfDonation) {
      setError("Please upload proof of donation.");
      return;
    }

    console.log(`Submitting donation for event ID: ${donationEvent._id}`);
    console.log("Donation Amount:", donationAmount);
    console.log("Proof of Donation:", proofOfDonation.name);

    // Close current modal
    const currentModal = document.getElementById(modalId) as HTMLDialogElement;
    if (currentModal) currentModal.close();
    
    // Try to close donation details modal if it exists
    // const donationDetailsModal = document.getElementById('donation_details') as HTMLDialogElement;
    // if (donationDetailsModal) donationDetailsModal.close();

    // Update URL
    // const url = new URL(window.location.href);
    // url.searchParams.delete('id');
    // window.history.pushState({}, '', url.toString());

    const fileUrl = await handleImageUpload(proofOfDonation);

    toastPromise(
      fetch(`${import.meta.env.VITE_API_URL}/donation/donation/${donationEvent._id}/donate/bank`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ amount: donationAmount, proof_url: fileUrl}),
      }),
      {
        loading: {
          title: "Submitting...",
          description: "Monetary donation is being submitted.",
          type: "info",
        },
        success: {
          title: "Success!",
          description: "Donation submitted successfully. Thank you for your kind heart",
          type: "success",
        },
        error: {
          title: "Failed!",
          description: "There was an error submitting the donation.",
          type: "error",
        },
      }
    )
    .then((response)=>{
      console.log("RESPONSE FROM MONETARY ENDPOINT: ", response.json());
      handleReset();
    });
  };

  /**
   * Resets the form to its initial state
   */
  const handleReset = () => {
    setDonationAmount("");
    setProofOfDonation(null);
    fileUploadRef.current?.reset();
    setError("");
  };

  /**
   * Handles donation amount input with validation
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleDonationAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setDonationAmount(value);
      setError("");
    }
  };

  const modalBody = (
    <div>
      {/* Cause Title */}
      <DonationInputField
        type="text"
        label="Cause Title"
        icon={<UserCircle />}
        value={donationEvent.title}
        placeholder={donationEvent.title}
        id={`${donationEvent._id}_cause_title`}
        onChange={() => { }}
        required
        isDisabled={true}
      />

      {/* Banking Details */}
      <div className="flex items-center justify-between bg-DarkerBlue text-white p-4 py-10 sm:py-6 rounded-lg mt-6 mb-6 sm:mb-4 sm:mt-4">
        <div className="flex flex-col">
          <h3 className="font-bold text-xs sm:text-sm">Banking Details:</h3>
          {bankingDetailsList}
        </div>
        <div className="text-right">
          <h2 className="font-bold text-2xl sm:text-4xl">
            {type === "Bank" ? "Bank" : "Gcash/"}
            <br />
            {type === "Bank" ? "Transfer" : "Maya"}
          </h2>
        </div>
      </div>

      {/* Donation Amount */}
      <DonationInputField
        label="Donation Amount"
        type="text"
        value={donationAmount}
        placeholder="Amount in PHP"
        icon={<Banknote />}
        id={`donation_amount_${donationEvent._id}`}
        onChange={handleDonationAmountChange}
        required={true}
      />
      
      {/* Proof of Donation */}
      <FileUploadField
        id={`${donationEvent._id}_proof_of_donation`}
        file={proofOfDonation}
        onFileChange={(file) => {
          setProofOfDonation(file);
          setError("");
        }}
        label="Proof of Donation"
        required
        withPreview={true}
        icon={<UploadCloud />}
        ref={fileUploadRef}
        onCancel={()=>{setProofOfDonation(null)}}
      />

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );

  return (
    <>
      {window.innerWidth < 640 && <div className="w-full">
        <BackAndFontAndProfileHeader className="flex justify-between w-full" />
      </div>}
      <WebModal
        id={modalId}
        header="Process Donation"
        subheader="Donation Form"
        subtext="By submitting this form, you consent to the use of your email and contact number for future updates and communications"
        body={modalBody}
        primaryButtonText="Finish"
        primaryButtonAction={handleSubmit}
        secondaryButtonText="Cancel"
        secondaryButtonAction={() => {
          handleReset();
          const modal = document.getElementById(modalId) as HTMLDialogElement;
          modal?.close();
        }}
        resetAction={handleReset}
        backdrop={window.innerWidth < 640 ? "white" : "primary"}
      />
    </>
  );
};

export default MonetaryDonationForm;