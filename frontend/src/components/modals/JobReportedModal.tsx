import React from "react";
import WebModal from "./WebModal";

/**
 * Modal component to display when a job has already been reported
 * @component
 * @example
 * <JobReportedModal />
 * 
 * @description This modal provides feedback to users that they've already submitted a report for a job.
 * It uses the WebModal component with preconfigured settings for consistency.
 */
const JobReportedModal: React.FC = () => {
  const modalId = "job_reported_modal";
  return (
    <WebModal
      id={modalId}
      header=""
      body={
        <div className="text-Primary text-center text-lg sm:text:xl">
          <p>You have already reported this job.</p>
        </div>
      }
      primaryButtonText="Close"
      primaryButtonAction={() => {
        (document.getElementById(modalId) as HTMLDialogElement)?.close();
      }}
      resetAction={() => {}}
      showTopRightClose={false}
      styles="w-[70vw] sm:w-[30vw] h-auto max-w-[80vw] sm:max-w-[30vw] max-h-[40vh]"
      backdrop="primary"
      buttonFullWidth={true}
    />
  );
};

export default JobReportedModal;
