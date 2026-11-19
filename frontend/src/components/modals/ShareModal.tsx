import React, { useState } from "react";
import DonationInputField from "./DonationInputField";
import { Check, Copy } from "lucide-react";
import WebModal from "./WebModal";

const ShareModal: React.FC<{ donationTitle: string }> = ({ donationTitle }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const modalBody = (
    <div className="w-full">
      <h3 className="font-bold text-lg text-Primary text-center mb-5">
        Share {donationTitle}
      </h3>

      <div className="flex items-center gap-2 w-full mb-3">
        <div className="basis-[90%]">
          <DonationInputField
            type="text"
            value={window.location.href}
            placeholder="Shareable link"
            id="share_link_input"
            isDisabled={true}
            onChange={() => {}}
          />
        </div>

        <button
          onClick={handleCopy}
          className="basis-[5%] p-2"
          aria-label="Copy link"
        >
          {isCopied ? (
            <Check className="h-5 w-5 text-Primary"/>
          ) : (
            <Copy className="h-5 w-5 text-Primary hover:text-Secondary" />
          )}
        </button>
      </div>

      {isCopied && (
        <div className="text-left text-xs sm:text-sm text-Primary animate-fade-in">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );

  return (
    <dialog id="share_modal" className="modal">
      <div>
        <WebModal
          id="share_modal"
          header=""
          body={modalBody}
          primaryButtonText="Done"
          primaryButtonAction={() =>
            (
              document.getElementById("share_modal") as HTMLDialogElement
            )?.close()
          }
          resetAction={() =>
            (
              document.getElementById("share_modal") as HTMLDialogElement
            )?.close()
          }
          showTopRightClose={false}
          styles="w-[50vw] sm:w-[35vw] h-auto max-w-[80vw] sm:max-w-[35vw] max-h-[40vh]"
          backdrop={window.innerWidth < 640 ? "none" : "primary"}
        />
      </div>
    </dialog>
  );
};

export default ShareModal;
