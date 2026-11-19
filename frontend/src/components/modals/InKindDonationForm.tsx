import React, { useContext, useRef, useState } from "react";
import WebModal from "./WebModal";
import {
  Boxes,
  House,
  Phone,
  Trash,
  UploadCloud,
  UserCircle,
  Weight,
} from "lucide-react";
import DonationProps from "../../types/donation";
import FileUploadField, { FileUploadHandle } from "./FileUploadField";
import Button from "../Button";
import DonationInputField from "./DonationInputField";
import { BackAndFontAndProfileHeader } from "../MobileHeaders";
import { AuthContext } from "../../context/AuthContext";
import { toastPromise } from "../../pages/utils/ToastFxn";

/**
 * Form component for in-kind donations (either dropoff or pickup)
 * @todo input validation, date and time design, attach header for mobile
 *
 * @component
 * @param {string} modalId - Unique identifier for the modal
 * @param {DonationProps} donationEvent - Donation event details
 * @param {"Dropoff" | "Pickup"} type - Type of in-kind donation
 *
 * @example
 * // Basic usage
 * <InKindDonationForm
 *   modalId="donation-form-1"
 *   donationEvent={donationData}
 *   type="Pickup"
 * />
 */
const InKindDonationForm: React.FC<{
  modalId: string;
  donationEvent: DonationProps;
  type: "Dropoff" | "Pickup";
}> = ({ modalId, donationEvent, type }) => {
  const [step, setStep] = useState(1);
  const [items, setItems] = useState([{ item: "", quantity: "" }]);
  const [weight, setWeight] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [proofOfDonation, setProofOfDonation] = useState<File | null>(null);
  const [error, setError] = useState("");
  const fileUploadRef = useRef<FileUploadHandle>(null);
  const isMobile = window.innerWidth < 640;
  const authContext = useContext(AuthContext);

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
   * Temporary submission handler
   * @todo Convert to proper type and implement actual API integration
   */
  const handleSubmit = async () => {
    console.log("Items:", items);
    console.log("Weight:", weight);
    console.log("Address:", address);
    console.log("Contact Number:", contactNumber);
    console.log("Date:", pickupDate);
    console.log("Time:", pickupTime);
    console.log("Proof of Donation:", proofOfDonation?.name);
    const currentUser = authContext?.user;

    (document.getElementById(modalId) as HTMLDialogElement)?.close();
    // (document.getElementById('donation_details') as HTMLDialogElement).close();
    // const url = new URL(window.location.href);
    // url.searchParams.delete('id');
    // window.history.pushState({}, '', url.toString());

    const fileUrl = await handleImageUpload(proofOfDonation!);

    const donationData = {
      userId: currentUser?._id,
      driveId: donationEvent._id,
      donation_type: "Non-Monetary", // or DonationTypeEnum.non_monetary if you import enums
      non_monetary_method: type === "Dropoff" ? "Drop-off" : "Pick-up", // e.g., "Pick-up" or "Drop-off"
      items: items.map((item) => ({
        name: item.item,
        quantity: item.quantity,
      })),
      total_weight_kg: weight,
      pickup_address: address,
      contact_number: contactNumber,
      preferred_date: pickupDate,
      preferred_time: pickupTime,
      donationProofURL: fileUrl
    };

    try {
      toastPromise(
        fetch(
          `${import.meta.env.VITE_API_URL}/donation/${
            donationEvent._id
          }/donate/inkind`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(donationData),
          }
        ),
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
      .then(()=>{
        setError("");
        handleReset();
      })
    } catch (error) {
      console.error("Submission error:", error);
      setError("Failed to submit donation.");
    }
  };

  /**
   * Adds a new item field to the donation form
   */
  const addItemField = () => {
    setItems([...items, { item: "", quantity: "" }]);
  };

  /**
   * Removes an item field from the donation form
   * @param {number} index - Index of the item to remove
   */
  const removeItemField = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  /**
   * Handles changes to item fields
   * @param {number} index - Index of the item being changed
   * @param {"item" | "quantity"} field - Field to update
   * @param {string} value - New value for the field
   */
  const handleItemChange = (
    index: number,
    field: "item" | "quantity",
    value: string
  ) => {
    if (field === "quantity" && !/^\d*$/.test(value)) return;

    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  /**
   * Handles navigation between form steps
   * @param {boolean} isForward - Whether to move forward or backward
   */
  const handleStepChange = (isForward: boolean) => {
    if (!isForward) {
      if (step === 1) {
        handleReset();
        (document.getElementById(modalId) as HTMLDialogElement)?.close();
        return;
      }
      setStep((prev) => prev - 1);
      setError("");
      return;
    }

    const isPickupDateInvalid =
      donationEvent.end_date &&
      new Date(pickupDate) > new Date(donationEvent.end_date);

    if (step === 1) {
      const hasValidItems = items.every(
        (i) => i.item.trim() && i.quantity.trim()
      );
      if (!hasValidItems) {
        setError("Please add at least 1 item.");
        return;
      }
      setStep(2);
      setError("");
      return;
    }

    if (isMobile) {
      // Mobile view: all fields validated in Step 2
      if (
        !weight ||
        (type !== "Dropoff" && !address) ||
        !contactNumber ||
        !pickupDate ||
        !pickupTime ||
        !proofOfDonation
      ) {
        setError("Please complete all fields.");
        return;
      }

      if (isPickupDateInvalid) {
        setError("Pick-up date cannot be later than the donation's end date.");
        return;
      }

      handleSubmit();
      setError("");
      return;
    }

    // Web view: step-by-step validation
    if (step === 2) {
      if (!weight || (type !== "Dropoff" && !address) || !contactNumber) {
        setError("Please complete all fields in this step.");
        return;
      }

      setStep(3);
    } else if (step === 3) {
      if (!pickupDate || !pickupTime) {
        setError("Please complete all fields in this step.");
        return;
      }

      if (isPickupDateInvalid) {
        setError("Pick-up date cannot be later than the donation's end date.");
        return;
      }

      setStep(4);
    } else if (step === 4) {
      if (!proofOfDonation) {
        setError("Please upload proof of donation.");
        return;
      }

      handleSubmit();
    }

    setError("");
  };

  /**
   * Resets the form to its initial state
   */
  const handleReset = () => {
    setStep(1);
    setItems([{ item: "", quantity: "" }]);
    setWeight("");
    setAddress("");
    setContactNumber("");
    setPickupDate("");
    setPickupTime("");
    setProofOfDonation(null);
    fileUploadRef.current?.reset();
    setError("");
  };

  const dropOffComponent = (
    <div className="flex items-center justify-between bg-DarkerBlue text-white p-4 rounded-lg mb-4 mt-4">
      <div className="flex flex-col text-xs sm:text-sm">
        <h3 className="font-bold">Details:</h3>
        <p>{donationEvent.address}</p>
        <p>Contact Number: {donationEvent.contactNumber}</p>
      </div>
      <div className="text-right">
        <h2 className="font-bold text-xl sm:text-3xl">
          Dropoff
          <br />
          Location
        </h2>
      </div>
    </div>
  );

  const fileUploadComponent = (
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
  );

  const dateTimeComponent = (
    <>
      <DonationInputField
        placeholder=""
        label={`Preferred ${type} Date ${donationEvent.end_date 
          ? `(on or before ${donationEvent.end_date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
          }).replace(/\//g, '-')})`
        : ""}`}
        type="date"
        value={pickupDate}
        id={`${donationEvent._id}_${type}_date`}
        onChange={(e) => setPickupDate(e.target.value)}
        required
      />
      <DonationInputField
        placeholder=""
        label={`Preferred ${type} time`}
        type="time"
        value={pickupTime}
        id={`${donationEvent._id}_${type}_time`}
        onChange={(e) => setPickupTime(e.target.value)}
        required
      />
    </>
  );

  // Modal body content based on current step
  const modalBody = (
    <div className="flex flex-col gap-2">
      {/* Step 1 (Web and Mobile) */}
      {step === 1 && (
        <>
          {/* Cause Title */}
          <DonationInputField
            type="text"
            label="Cause Title"
            icon={<UserCircle />}
            value={donationEvent.title}
            placeholder={donationEvent.title}
            id={`${donationEvent._id}_cause_title`}
            onChange={() => {}}
            required
            isDisabled={true}
          />

          <label className="pt-2 text-md font-semibold sm:text-lg mb-1 text-Label">
            Items to Donate<span className="text-red-500">*</span>
          </label>

          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {/* Item */}
              <div className="flex-grow basis-[85%]">
                <div className="flex flex-col mb-2">
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-3 flex items-center text-Label text-xs sm:text-sm">
                      <Boxes size={24} />
                    </div>

                    <select
                      value={item.item}
                      onChange={(e) =>
                        handleItemChange(index, "item", e.target.value)
                      }
                      className="text-Label w-full 
                      text-xs sm:text-base md:text-md 
                      px-2.5 sm:px-4 
                      py-2 sm:py-2.5 lg:py-3 
                      bg-SemiWhite border border-Primary rounded-3xl 
                      focus:outline-none focus:ring-1 focus:ring-Secondary focus:border-blue-500 placeholder-Gray 
                      pl-10 sm:pl-12 appearance-none"
                      required
                    >
                      <option disabled value="" className="text-Gray">
                        Select an item
                      </option>
                      {donationEvent.item_requirements?.map((req) => (
                        <option
                          key={req.item_name}
                          value={req.item_name}
                          disabled={req.current_quantity >= req.target_quantity}
                          className={`
                          ${
                            req.current_quantity >= req.target_quantity
                              ? "text-Gray"
                              : "text-Label"
                          }
                          hover:bg-Secondary hover:text-white
                          transition-colors
                        `}
                        >
                          {req.item_name}
                        </option>
                      ))}
                    </select>
                    {/* Custom dropdown chevron */}
                    <div className="absolute right-3 top-2 sm:top-4 pointer-events-none">
                    <svg
                      className="h-4 w-4 text-Label opacity-70"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex-grow basis-[15%]">
                <DonationInputField
                  type="text"
                  value={item.quantity}
                  placeholder="Qty"
                  id={`${donationEvent._id}_quantity_${index}`}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                  required
                />
              </div>

              {/* Delete */}
              {items.length > 1 && (
                <button
                  onClick={() => removeItemField(index)}
                  type="button"
                  className="flex-shrink-0 basis-[5%] mb-2"
                >
                  <Trash size={20} className="text-red-500" />
                </button>
              )}
            </div>
          ))}

          {/* Add Item */}
          <Button
            variant="major"
            onClick={addItemField}
            type="button"
            className="!w-38 !py-1 !px-10 !rounded-xl"
          >
            Add Item
          </Button>
        </>
      )}

      {/* Web (Step 2) OR Mobile (Step 2 combined) */}
      {step === 2 && (
        <>
          {/* Weight */}
          <DonationInputField
            label="Weight of Donation (kg)"
            type="text"
            icon={<Weight />}
            value={weight}
            placeholder="e.g. 5"
            id={`${donationEvent._id}_weight`}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*\.?\d*$/.test(value)) {
                setWeight(value);
              }
            }}
            required
          />

          {/* Pickup Address */}
          {type === "Pickup" && (
            <DonationInputField
              label="Pickup Address"
              icon={<House />}
              type="text"
              value={address}
              placeholder="Enter full address"
              id={`${donationEvent._id}_pickup_address`}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          )}

          {/* Contact Number */}
          <DonationInputField
            label="Contact Number"
            icon={<Phone />}
            type="text"
            value={contactNumber}
            placeholder="e.g. 09XXXXXXXXX"
            id={`${donationEvent._id}_contact_number`}
            onChange={(e) => {
              if (/^\d*$/.test(e.target.value))
                setContactNumber(e.target.value);
            }}
            required
            maxLen={11}
          />

          {/* If on mobile, include date/time and file upload here */}
          {isMobile && (
            <>
              {dateTimeComponent}
              {type === "Dropoff" && dropOffComponent}
              {fileUploadComponent}
            </>
          )}
        </>
      )}

      {/* Step 3(Web) */}
      {!isMobile && step === 3 && dateTimeComponent}

      {/* Step 4(Web) */}
      {!isMobile && step === 4 && (
        <>
          {type == "Dropoff" && dropOffComponent}
          {fileUploadComponent}
        </>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );

  return (
    <>
      {window.innerWidth < 640 && (
        <div className="w-full">
          <BackAndFontAndProfileHeader className="flex justify-between w-full" />
        </div>
      )}
      <WebModal
        id={modalId}
        header="Process Donation"
        subheader="Donation Form"
        subtext="By submitting this form, you consent to the use of your email and contact number for future updates and communications"
        body={modalBody}
        primaryButtonText={
          (isMobile && step === 2) || (!isMobile && step === 4)
            ? "Finish"
            : "Next"
        }
        secondaryButtonText={step === 1 ? "Cancel" : "Back"}
        primaryButtonAction={() => handleStepChange(true)}
        secondaryButtonAction={() => handleStepChange(false)}
        resetAction={handleReset}
        backdrop={window.innerWidth < 640 ? "white" : "primary"}
      />
    </>
  );
};

export default InKindDonationForm;