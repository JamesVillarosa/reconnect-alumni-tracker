// src/components/profile/EditProfilePicturesModal.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Save } from "lucide-react";
import ImageInputButton from "../ImageInputButton"; // Ensure this path is correct
import { useAuthContext } from "../../hooks/useAuthContext";
import Button from "../Button";

// Default placeholder images
import DefaultProfilePic from "../../assets/placeholders/pfp_placeholder.avif";
import DefaultHeaderPic from "../../assets/placeholders/bg_placeholder.avif";

interface EditProfilePicturesModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  notifySuccess: (message: string, pictureType: "profile" | "header") => void;
  notifyError: (message: string) => void;
  currentProfilePicUrl: string;
  currentHeaderPicUrl: string;
}

const EditProfilePicturesModal: React.FC<EditProfilePicturesModalProps> = ({
  modalRef,
  notifySuccess,
  notifyError,
  currentProfilePicUrl,
  currentHeaderPicUrl,
}) => {
  const { user } = useAuthContext();
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [headerPicFile, setHeaderPicFile] = useState<File | null>(null);

  const [profilePicPreview, setProfilePicPreview] = useState<string>(
    currentProfilePicUrl || DefaultProfilePic
  );
  const [headerPicPreview, setHeaderPicPreview] = useState<string>(
    currentHeaderPicUrl || DefaultHeaderPic
  );

  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingHeader, setIsUploadingHeader] = useState(false);

  useEffect(() => {
    // Only update preview if a new file isn't already staged for that type
    if (!profilePicFile) {
      setProfilePicPreview(currentProfilePicUrl || DefaultProfilePic);
    }
  }, [currentProfilePicUrl, profilePicFile]); // profilePicFile ensures this doesn't overwrite a newly selected preview

  useEffect(() => {
    if (!headerPicFile) {
      setHeaderPicPreview(currentHeaderPicUrl || DefaultHeaderPic);
    }
  }, [currentHeaderPicUrl, headerPicFile]); // headerPicFile ensures this doesn't overwrite a newly selected preview

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "header"
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "profile") {
          setProfilePicFile(file);
          setProfilePicPreview(reader.result as string);
        } else {
          // type === "header"
          setHeaderPicFile(file);
          setHeaderPicPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
    // Clear the input value to allow re-selection of the same file if needed
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleRemoveFile = (type: "profile" | "header") => {
    if (type === "profile") {
      setProfilePicFile(null);
      setProfilePicPreview(currentProfilePicUrl || DefaultProfilePic); // Revert to current or default
    } else {
      setHeaderPicFile(null);
      setHeaderPicPreview(currentHeaderPicUrl || DefaultHeaderPic); // Revert to current or default
    }
  };

  const handleSubmit = async (type: "profile" | "header") => {
    const fileToUpload = type === "profile" ? profilePicFile : headerPicFile;
    // const endpointType =
    //   type === "profile" ? "profile-picture" : "header-picture";
    const setLoading =
      type === "profile" ? setIsUploadingProfile : setIsUploadingHeader;

    if (!fileToUpload) {
      notifyError(
        `No ${type === "profile" ? "profile" : "cover"} picture selected.`
      );
      return;
    }
    if (!user) {
      notifyError("User not authenticated. Please log in again.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", fileToUpload);

    try {
      const response = await axios.put<{ message: string; imageUrl: string }>(
        `${import.meta.env.VITE_API_URL}/profile/upload/image?pic_type=${type}`,
        formData,
        {
          withCredentials: true,
        }
      );
      notifySuccess(
        response.data.message ||
          `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } picture updated successfully!`,
        type
      );

      // Reset file state for the successfully uploaded image.
      // The preview will be updated by the useEffect listening to current...PicUrl props
      // once the parent component (UserProfilePage) refetches and passes down the new URL.
      if (type === "profile") {
        setProfilePicFile(null);
      } else {
        setHeaderPicFile(null);
      }
    } catch (err) {
      console.error(`Error uploading ${type} picture:`, err);
      let message = `Failed to upload ${
        type === "profile" ? "profile" : "cover"
      } picture.`;
      if (axios.isAxiosError(err) && err.response) {
        message =
          err.response.data.error || err.response.data.message || message;
      }
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    modalRef.current?.close();
    // Reset states if modal is closed without saving changes, reverting previews
    if (profilePicFile) handleRemoveFile("profile");
    if (headerPicFile) handleRemoveFile("header");
  };

  return (
    <dialog id="edit_profile_pictures_modal" className="modal" ref={modalRef}>
      <div className="modal-box bg-white p-0 px-5 rounded-lg shadow-xl w-11/12 max-w-md relative">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="font-bold text-lg text-Primary">
            Edit Profile Images
          </h3>
          <button
            className="btn btn-sm btn-circle btn-ghost text-Primary"
            onClick={closeModal}
            type="button"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Picture Section */}
          <div>
            <h4 className="text-md font-semibold text-Primary mb-2">
              Profile Picture
            </h4>
            <div className="flex flex-col items-center gap-3">
              <img
                src={profilePicPreview}
                alt="Profile Preview"
                className="w-32 h-32 rounded-full object-cover border-2 border-Primary/50 bg-gray-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DefaultProfilePic;
                }}
              />
              <div className="flex flex-row gap-4">
                <ImageInputButton
                  id="profile-pic-upload-input"
                  onFileChange={(e) => handleFileChange(e, "profile")}
                  loading={isUploadingProfile}
                  text={
                    profilePicFile
                      ? profilePicFile.name
                      : "Choose profile photo"
                  }
                  onRemoveFile={
                    profilePicFile && !isUploadingProfile
                      ? () => handleRemoveFile("profile")
                      : undefined
                  }
                  disabled={isUploadingProfile}
                />
                {profilePicFile && (
                  <button
                    type="button"
                    className="btn-sm  text-Primary hover:opacity-70 w-full max-w-[256px]"
                    onClick={() => handleSubmit("profile")}
                    disabled={isUploadingProfile || !profilePicFile}
                  >
                    <Save size={30} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Header Picture Section */}
          <div>
            <h4 className="text-md font-semibold text-Primary mb-2">
              Cover Photo
            </h4>
            <div className="flex flex-col items-center gap-3">
              <img
                src={headerPicPreview}
                alt="Header Preview"
                className="w-full h-32 rounded-md object-cover border-2 border-Primary/50 bg-gray-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DefaultHeaderPic;
                }}
              />
              <div className="flex flex-row gap-4">
                <ImageInputButton
                  id="header-pic-upload-input"
                  onFileChange={(e) => handleFileChange(e, "header")}
                  loading={isUploadingHeader}
                  text={
                    headerPicFile ? headerPicFile.name : "Choose cover photo"
                  }
                  onRemoveFile={
                    headerPicFile && !isUploadingHeader
                      ? () => handleRemoveFile("header")
                      : undefined
                  }
                  disabled={isUploadingHeader}
                />
                {headerPicFile && (
                  <button
                    type="button"
                    className="btn-sm text-Primary hover:opacity-70 w-full max-w-[256px]"
                    onClick={() => handleSubmit("header")}
                    disabled={isUploadingHeader || !headerPicFile}
                  >
                    <Save size={30} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="modal-action p-4 border-t border-gray-200">
          <Button
            children={"Done"}
            variant="major"
            type="button"
            onClick={closeModal}
          />
        </div>
      </div>
      {/* Modal backdrop for closing when clicking outside */}
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={closeModal}>
          {" "}
          close
        </button>
      </form>
    </dialog>
  );
};

export default EditProfilePicturesModal;
