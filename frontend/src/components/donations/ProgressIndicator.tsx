import { useState, useEffect } from "react";
import { Sprout, Handshake, CheckCircle } from "lucide-react";
import { DonationStatusEnum } from "../../types/donation";


interface ProgressIndicatorProps {
  percentage: number; // 0 to 100
  status: DonationStatusEnum; // "funding", "ongoing", or "completed"
  handleDonate: () => void;
}

/**
 * 
 * @param percentage - The percentage of the progress indicator (0 to 100).
 * @param status - The status of the progress indicator, which can be "funding", "ongoing", or "completed".
 */
function ProgressIndicator({ percentage, status, handleDonate }: ProgressIndicatorProps) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getFundingText = () => {
    if (windowWidth > 500) {
      return `${status === "Active" ? `Gathered ${percentage}%` : "Launched"}`;
    } else {
      return status === "Active" ? `${percentage}%` : "";
    }
  };

  const getOngoingText = () => {
    if (windowWidth > 500) {
      if (status === "Ongoing") return "Ongoing";
      if (status === "Active") return "Ongoing";
      return "Deployed";
    } else {
      return "";
    }
  };

  const getCompletedText = () => {
    if (windowWidth > 500) {
      return `Completed ${status === "Completed" ? "100%" : ""}`;
    } else {
      return "";
    }
  };


  return (
    <div className="flex flex-col w-full">
      <div
        className={`flex h-14 w-full flex-row items-center rounded-lg text-white shadow-md ${
          status === "Completed" ? "pulse-bar bg-green-600" : "bg-gray-400/65"
        }`}
      >
        <div
          className={`flex h-full w-2/3 flex-row items-center rounded-lg ${
            status === "Ongoing"
              ? "pulse-bar shadow-md bg-yellow-500"
              : status === "Completed"
              ? "bg-gray-400"
              : "bg-gray-300"
          }`}
        >
          <div
            className={`flex h-full w-1/2 flex-row items-center justify-center rounded-lg ${
              status === "Active"
                ? "pulse-bar bg-transparent font-bold shadow-md hover:cursor-pointer"
                : "bg-gray-300"
            }`}
            onClick={()=>{
              if (status === "Active"){
                handleDonate()
              }
            }}
          >
            <Sprout className="w-6 h-6 mr-2" />
            <p className="line-clamp-1">{getFundingText()}</p>
          </div>
          <div
            className={`flex h-full w-1/2 flex-row items-center justify-center rounded-lg ${
              status === "Ongoing"
                ? "bg-transparent font-bold"
                : status === "Completed"
                ? "bg-gray-400"
                : ""
            }`}
          >
            <Handshake className="w-6 h-6 mr-2" />
            <p className="line-clamp-1">{getOngoingText()}</p>
          </div>
        </div>
        <div
          className={`flex h-full w-1/3 flex-row items-center justify-center rounded-lg bg-transparent ${
            status === "Completed" ? "bg-green-600 font-bold" : ""
          }`}
        >
          <CheckCircle className="w-6 h-6 mr-2" />
          <p className="line-clamp-1">{getCompletedText()}</p>
        </div>
      </div>
      <div className="flex flex-row justify-around m-1 text-xs text-gray-300 sm:hidden">
        <p>Funding</p>
        <p>Deploying</p>
        <p>Completed</p>
      </div>
    </div>
  );
}

export default ProgressIndicator;