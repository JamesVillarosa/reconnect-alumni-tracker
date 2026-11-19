import axios, { AxiosError } from "axios";
import { FormEvent, useEffect, useState } from "react";

/**
 * This component is a modal concerning the management of details for education entries in the Profile Page (UserProfilePage.tsx)
 * @param {string} label - "Add" | "Edit"
 * @param {ref} modalRef - a reference to the modal to control its visibility
 * @param {string} notifySuccess - message to display in the snackbar in the Profile Page whenever an action is successful
 * @param {string} entryID - optional; the ID of the entry to be edited (when label == edit only)
 * 
 * @example
 * // label == "Add"
 * <ManageEducationEntryModal modalRef={educationModalRef} label="Add" 
        notifySuccess={() => {
            setToastMessage("Success");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000); // Hide after 3s
        }}
    />
 * 
 * @example
 * // type == "Edit"
 * <ManageEducationEntryModal modalRef={educationModalRef} label="Edit" entryID="001"/>
 */

export interface EducationEntryData {
  id?: string; // Needed if you implement Edit
  name?: string; // Used in useEffect
  title?: string; // Used in useEffect
  dateGraduated?: string | null; // Used in useEffect
  // Add other fields if needed by initial population
}

export interface CareerEntryData {
  id?: string;
  company?: string;
  position?: string;
  logo_url?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
}

export const ManageEducationEntryModal: React.FC<{
  label: "Add" | "Edit";
  modalRef: React.RefObject<HTMLDialogElement | null>;
  notifySuccess?: (message: string, source: "education") => void;
  initialData?: EducationEntryData | null;
}> = ({ modalRef, label, notifySuccess, initialData }) => {
  // for month input type
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // ensures 2-digit month
  const currentDate = `${year}-${month}`;

  const [university, setUniversity] = useState<string>("");
  const [degree, setDegree] = useState<string>("");
  const [degreeType, setDegreeType] = useState<string>("Bachelor's");
  const [graduationDate, setGraduationDate] = useState<string>(currentDate);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (label === "Edit" && initialData) {
      // Populate state from the initialData passed in
      setUniversity(initialData.name || "");
      setDegree(initialData.title || "");
      setGraduationDate(initialData.dateGraduated || currentDate);
      // console.log("Modal populated for Edit:", initialData); // For debugging
    } else {
      // Reset form for 'Add' mode
      setUniversity("");
      setDegree("");
      setGraduationDate(currentDate);
    }
    // Clear errors when initialData or label changes (modal opens/switches mode)
    setError(null);
  }, [label, initialData, currentDate]); // Depend on label and initialData

  // print error whenever it is set
  useEffect(() => {
    if (!error) {
      console.log(error);
    }
  }, [error]);

  const handleClose = () => {
    if (label === "Add") {
      // reset fields
      setUniversity("");
      setDegree("");
      setGraduationDate(currentDate);
    }
    setError(null);
    setIsSubmitting(false);
    // close the modal
    modalRef.current?.close();
  };

  const handleSaveChanges = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    // reset fields
    // console.log(university);
    // console.log(degree);
    // console.log(graduationDate);

    const payload = {
      school_name: university,
      degree: degree,
      graduation_date: graduationDate,
      // logo_url: null // Add if you implement logo upload/selection
    };

    // API for editing/saving here
    try {
      let response;
      let successMessage = "";
      if (label === "Add") {
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/profile/education`,
          payload,
          {
            method: "POST",
            withCredentials: true,
          }
        );
        successMessage = "Education history succesfully added!";
        if (notifySuccess) {
          notifySuccess("Education entry added successfully!", "education");
        }
      } else if (label === "Edit") {
        const entryId = initialData?.id;
        if (!entryId) {
          // Throw error or set state if ID is missing
          console.error("Initial Data:", initialData); // Log again on error
          throw new Error("Cannot edit entry: Missing ID in initialData.");
        }
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/profile/education/${entryId}`,
          payload,
          {
            // Use axios.put for updates
            method: "PUT",
            withCredentials: true,
          }
        );
        if (notifySuccess) {
          notifySuccess("Education entry updated successfully!", "education");
        }
      }
      if (response && (response.status === 200 || response.status === 201)) {
        if (notifySuccess && typeof notifySuccess === "function") {
          notifySuccess(successMessage, "education");
        } else {
          console.error("notifySuccess prop is MISSING or NOT a function!");
        }
        handleClose();
      }
    } catch (err: unknown) {
      const error = err as AxiosError;
      console.error("Error saving education entry:", error);
      const errorMessage =
        (error.response?.data as { detail?: string })?.detail ||
        `Failed to ${label.toLowerCase()} education entry.`;
      setError(errorMessage);
      setIsSubmitting(false); // Keep modal open to show error
    }
  };

  return (
    <dialog ref={modalRef} id="education_modal" className="modal">
      <form
        onSubmit={handleSaveChanges}
        className="modal-box min-w-[340px] bg-white text-Primary rounded-2xl flex flex-col gap-3"
      >
        <h3 className="font-bold text-xl">{label + " Education Entry"}</h3>
        <ModalTextfield
          type="text"
          label="University"
          placeholder="Enter the full name of the University"
          value={university}
          onChange={(e) => {
            setUniversity(e.target.value);
          }}
          required={true}
          disabled={isSubmitting}
        />
        <ModalTextfield
          type="text"
          label="Degree"
          placeholder="Enter the full name of the degree"
          value={degree}
          onChange={(e) => {
            setDegree(e.target.value);
          }}
          required={true}
          disabled={isSubmitting}
        />
        <select
          value={degreeType}
          onChange={(e) => setDegreeType(e.target.value)}
          className="w-full text-Primary text-sm bg-white px-4 py-2 border border-[#A9C1DE] rounded-lg focus:outline-none focus:ring-1 focus:ring-Secondary focus:border-blue-500 placeholder-Primary"
        >
          <option>Bachelor's</option>
          <option>Associate</option>
          <option>Master's</option>
          <option>Doctoral</option>
        </select>
        <ModalTextfield
          type="month"
          label="Date of Graduation"
          placeholder="Month"
          value={graduationDate}
          onChange={(e) => {
            setGraduationDate(e.target.value);
          }}
          required={true}
          disabled={isSubmitting}
        />
        <div className="min-h-[7vh]" />
        <button
          className="text-white text-sm font-bold bg-Gradient2 px-4 py-2 rounded-lg"
          type="submit"
        >
          Save Changes
        </button>
        <button
          className="text-Primary text-sm font-bold bg-white px-4 py-2 rounded-lg"
          onClick={handleClose}
        >
          Close
        </button>
      </form>
    </dialog>
  );
};

/**
 * This component is a modal concerning the management of details for career entries in the Profile Page (UserProfilePage.tsx)
 * @param {string} label - "Add" | "Edit"
 * @param {ref} modalRef - a reference to the modal to control its visibility
 * @param {string} notifySuccess - message to display in the snackbar in the Profile Page whenever an action is successful
 * @param {string} entryID - optional; the ID of the entry to be edited (when label == edit only)
 * 
 * @example
 * // label == "Add"
 * <ManageCareerEntryModal modalRef={careerModalRef} label="Add" 
        notifySuccess={() => {
            setToastMessage("Success");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000); // Hide after 3s
        }}
    />
 * 
 * @example
 * // type == "Edit"
 * <ManageCareerEntryModal modalRef={careerModalRef} label="Edit" entryID="001"/>
 */

// export interface CareerEntryData {
//     id?: string;
//     company?: string;
//     position?: string;
//     logo_url?: string;
//     start_date?: string;
//     end_date?: string;
//     is_current?: boolean,
// }

export const ManageCareerEntryModal: React.FC<{
  label: "Add" | "Edit";
  modalRef: React.RefObject<HTMLDialogElement | null>;
  notifySuccess?: (message: string, source: "career") => void;
  initialData?: CareerEntryData | null;
}> = ({ modalRef, label, notifySuccess, initialData }) => {
  // for month input type
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // ensures 2-digit month
  const currentDate = `${year}-${month}`;

  // const exampleData = { imageSrc: "some_url", name: "Pledis Entertainment", title: "Money Maker", current: true, dateStarted: "2025-07", dateEnded: ""};

  const [company, setCompany] = useState<string>("");
  const [role, setRole] = useState<string>("");
  // const [logoUrl, setLogoUrl] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(currentDate);
  const [endDate, setEndDate] = useState<string>("");
  const [isCurrentCareer, setIsCurrentCareer] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (label === "Edit" && initialData) {
      // Populate state from the initialData passed in
      setCompany(initialData.company || "");
      setRole(initialData.position || "");
      setStartDate(initialData.start_date || currentDate);
      setEndDate(initialData.end_date || "");
      setIsCurrentCareer(initialData.is_current || false);
      // setLogoUrl(initialData.logo_url || '');
      // console.log("Modal populated for Edit:", initialData); // For debugging
    } else {
      // Reset form for 'Add' mode
      setCompany("");
      setRole("");
      setStartDate("");
      setEndDate("");
      setIsCurrentCareer(false);
    }
    // Clear errors when initialData or label changes (modal opens/switches mode)
    setError(null);
  }, [label, initialData, currentDate]);

  // print error whenever it is set
  useEffect(() => {
    if (!error) {
      console.log(error);
    }
  }, [error]);

  // placed here just to clear lint error
  useEffect(() => {
    console.log("Submitting: " + isSubmitting);
  }, [isSubmitting]);

  const handleClose = () => {
    if (!initialData) {
      // reset fields
      setCompany("");
      setRole("");
      setStartDate(currentDate);
      setEndDate("");
      setIsCurrentCareer(false);
    }

    // close the modal
    modalRef.current?.close();
  };

  const handleSaveChanges = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // console.log(company);
    // console.log(role);
    // console.log(startDate);
    // console.log(endDate);

    const payload = {
      company: company,
      position: role,
      start_date: startDate,
      end_date: endDate,
      is_current: isCurrentCareer,
      // logo_url: null // Add if you implement logo upload/selection
    };

    // API for editing/saving here
    try {
      let response;
      let successMessage = "";
      if (label === "Add") {
        console.log(payload);
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/profile/career`,
          payload,
          {
            method: "POST",
            withCredentials: true,
          }
        );
        console.log(response);
        successMessage = "Career history succesfully added!";
        if (notifySuccess) {
          notifySuccess("Career entry added successfully!", "career");
        }
      } else if (label === "Edit") {
        const entryId = initialData?.id;
        if (!entryId) {
          throw new Error("Cannot edit entry: Missing ID in initialData.");
        }
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/profile/career/${entryId}`,
          payload,
          {
            method: "PUT",
            withCredentials: true,
          }
        );
        if (notifySuccess) {
          notifySuccess("Career entry updated successfully!", "career");
        }
      }
      if (response && (response.status === 200 || response.status === 201)) {
        if (notifySuccess && typeof notifySuccess === "function") {
          notifySuccess(successMessage, "career");
        } else {
          console.error("notifySuccess prop is MISSING or NOT a function!");
        }
        handleClose();
      }
    } catch (err: unknown) {
      const error = err as AxiosError;
      console.error("Error saving education entry:", error);
      const errorMessage =
        (error.response?.data as { detail?: string })?.detail ||
        `Failed to ${label.toLowerCase()} education entry.`;
      setError(errorMessage);
      setIsSubmitting(false); // Keep modal open to show error
    }

    if (notifySuccess != null) {
      notifySuccess("Details saved successfully!", "career");
    }

    handleClose();
  };

  return (
    <dialog ref={modalRef} id="career_modal" className="modal">
      <form
        onSubmit={handleSaveChanges}
        className="modal-box min-w-[340px] bg-white text-Primary rounded-2xl flex flex-col gap-3"
      >
        <h3 className="font-bold text-xl">{label + " Career Entry"}</h3>
        <ModalTextfield
          type="text"
          label="Company Name"
          placeholder="Enter the full name of the Company"
          value={company}
          onChange={(e) => {
            setCompany(e.target.value);
          }}
          required={true}
        />
        <ModalTextfield
          type="text"
          label="Role"
          placeholder="Enter the full name of the role"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
          }}
          required={true}
        />
        <fieldset>
          <legend className="text-md font-medium lg:text-lg text-Primary">
            When did you work there?
          </legend>
          <h4 className="text-[0.8rem] text-Primary pt-2">Start Date</h4>
          <ModalTextfield
            type="month"
            label=""
            placeholder=""
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
            }}
            required={true}
          />
          <h4 className="text-[0.8rem] text-Primary pt-2">End Date</h4>
          <ModalTextfield
            type="month"
            label=""
            placeholder=""
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
            }}
            required={false}
            disabled={isCurrentCareer}
          />
        </fieldset>
        <div className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={isCurrentCareer}
            onChange={(e) => {
              setIsCurrentCareer(e.target.checked);
              setEndDate("");
            }}
            className="checkbox checkbox-sm border border-Primary rounded-sm checked:text-Primary"
          />
          <h3 className="text-sm text-Primary">I currently work here</h3>
        </div>
        <div className="min-h-[7vh]" />
        <button
          className="text-white text-sm font-bold bg-Gradient2 px-4 py-2 rounded-lg"
          type="submit"
        >
          Save Changes
        </button>
        <button
          className="text-Primary text-sm font-bold bg-white px-4 py-2 rounded-lg"
          onClick={handleClose}
        >
          Close
        </button>
      </form>
    </dialog>
  );
};

/*  EditProfileModal:
    This component is a pop-up modal concerning career entries in the Profile Page (UserProfilePage.tsx)
*/

export const EditProfileModal: React.FC<{
  currentBioValue: string;
  currentLocationValue: string;
  currentUsernameValue: string;
  currentFirstName?: string;
  currentLastName?: string;
  modalRef: React.RefObject<HTMLDialogElement | null>;
  notifySuccess: (message: string) => void;
}> = ({
  currentBioValue,
  currentLocationValue,
  currentUsernameValue,
  currentFirstName,
  currentLastName,
  modalRef,
  notifySuccess,
}) => {
  const [name, setName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [bio, setBio] = useState<string>("");

  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set state when props are available or change
    setName(currentUsernameValue || "");
    setLocation(currentLocationValue || "");
    setBio(currentBioValue || "");
    setError(null);
    setIsSubmitting(false);
  }, [currentUsernameValue, currentLocationValue, currentBioValue, modalRef]);

  // print error whenever it is set
  useEffect(() => {
    if (!error) {
      console.log(error);
    }
  }, [error]);

  // placed here just to clear lint error
  useEffect(() => {
    console.log("Submitting: " + isSubmitting);
  }, [isSubmitting]);

  const splitName = (
    fullName: string
  ): { firstName: string; lastName: string } => {
    const trimmedName = fullName.trim();
    if (!trimmedName) return { firstName: "", lastName: "" };
    const firstSpaceIndex = trimmedName.indexOf(" ");
    if (firstSpaceIndex === -1) return { firstName: trimmedName, lastName: "" };
    const firstName = trimmedName.substring(0, firstSpaceIndex);
    const lastName = trimmedName.substring(firstSpaceIndex + 1).trim();
    return { firstName, lastName };
  };

  const handleClose = () => {
    modalRef.current?.close();
  };

  const handleSaveChanges = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    let hasChanges = false;

    // reset fields
    console.log(name);
    console.log(location);
    console.log(bio);

    const { firstName: extractedFirstName, lastName: extractedLastName } =
      splitName(name);

    if (!extractedFirstName) {
      setError("First name cannot be empty.");
      setIsSubmitting(false);
      return;
    }

    const profileData: {
      first_name?: string;
      last_name?: string;
      biography?: string | null;
      location?: string | null;
    } = {};

    if (currentFirstName !== undefined && currentLastName !== undefined) {
      if (
        extractedFirstName !== currentFirstName ||
        extractedLastName !== currentLastName
      ) {
        profileData.first_name = extractedFirstName;
        profileData.last_name = extractedLastName;
        hasChanges = true;
      }
    } else {
      // If original names aren't passed, always send the split names
      profileData.first_name = extractedFirstName;
      profileData.last_name = extractedLastName;
      // Assume change if original names aren't available for comparison (or adjust logic)
      hasChanges = true; // Or compare combined name state !== currentUsernameValue
    }

    // Compare other fields
    if (bio !== currentBioValue) {
      profileData.biography = bio;
      hasChanges = true;
    }
    if (location.trim() !== currentLocationValue) {
      profileData.location = location.trim() || null;
      hasChanges = true;
    }

    // Don't submit if nothing changed
    if (!hasChanges) {
      setError("No changes were made.");
      setIsSubmitting(false);
      return;
    }

    console.log("Submitting profile changes (Split Name):", profileData);

    // API to edit profile here
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/profile`,
        profileData, // Send object with first_name and last_name
        { withCredentials: true }
      );

      notifySuccess("Profile details changed successfully!");
      handleClose();
    } catch (err: unknown) {
      const error = err as AxiosError;
      console.error("Failed to update profile:", error);
      const backendError = (error.response?.data as { detail?: string })
        ?.detail;
      setError(
        backendError || "An error occurred while saving. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog ref={modalRef} id="career_modal" className="modal">
      <form
        onSubmit={handleSaveChanges}
        className="modal-box min-w-[340px] bg-white text-Primary rounded-2xl flex flex-col gap-3"
      >
        <h3 className="font-bold text-xl">{"Edit Profile"}</h3>
        <ModalTextfield
          type="text"
          label="Name"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          required={true}
        />
        <ModalTextfield
          type="text"
          label="Location"
          placeholder="Enter your location"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
          }}
          required={true}
        />
        <ModalTextfield
          type="text"
          label="Bio"
          placeholder="Share something about you"
          value={bio}
          onChange={(e) => {
            setBio(e.target.value);
          }}
          required={true}
        />
        <ModalTextfield
          type="text"
          label="Contact Number"
          placeholder="Enter your contact number"
          value={contactNumber}
          onChange={(e) => {
            setContactNumber(e.target.value);
          }}
          required={true}
        />
        <ModalTextfield
          type="text"
          label="Email"
          placeholder="Enter your active email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          required={true}
        />
        <div className="min-h-[7vh]" />
        <button
          className="text-white text-sm font-bold bg-Gradient2 px-4 py-2 rounded-lg"
          type="submit"
        >
          Save Changes
        </button>
        <button
          className="text-Primary text-sm font-bold bg-white px-4 py-2 rounded-lg"
          onClick={handleClose}
        >
          Close
        </button>
      </form>
    </dialog>
  );
};

/*  ModalTextfield: This component is a textfield specific to the following modals in Profile Page (UserProfilePage.tsx):
        ManageEducationEntryModal
        ManageCareerEntryModal
*/
interface ModalTextfieldProps {
  type: "text" | "number" | "month";
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
}
const ModalTextfield: React.FC<ModalTextfieldProps> = ({
  type,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col">
      <label className="text-md font-medium mb-1 text-Primary">{label}</label>
      <div className="relative w-full">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`w-full text-Primary text-sm bg-white px-4 py-2 border border-[#A9C1DE] rounded-lg focus:outline-none focus:ring-1 focus:ring-Secondary focus:border-blue-500 placeholder-Primary`}
        />
      </div>
    </div>
  );
};
