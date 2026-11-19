import React from "react";
import { DonationStatusEnum } from "../types/donation";
interface PulsingProgressBarProps {
    progress: number; // percentage from 0 to 100
    raisedAmount: number; // optional, default is 0
    className?: string;
    hasMoney?: boolean;
    status?: DonationStatusEnum;
}

const PulsingProgressBar: React.FC<PulsingProgressBarProps> = ({ progress, raisedAmount, className = "", hasMoney = false, status }) => {
    return (
        <div className={className + " overflow-clip"}>
            <div className={"w-full bg-primary/20 rounded-full h-4 overflow-hidden "}>
                <div
                    className={`h-full pl-4 transition-all duration-300 rounded-full ${status !== "Completed" ? ' pulse-bar ' : '  bg-Gradient2'
                        }`}
                    style={{ width: status === 'Completed' ? '100%' : `${progress}%` }}
                >
                </div>
            </div>
            <div className='flex flex-row items-center justify-between gap-2 mt-2 text-lg font-semibold text-primary w-max'>
                {hasMoney ? `₱${raisedAmount.toLocaleString()} raised` : `${progress}% gathered`}
                {hasMoney && (
                    <span className="text-sm font-normal text-Label line-clamp-1 max-w-full h-5">
                        {`${progress}% ` } complete
                    </span>
                )}

            </div>
        </div>
    );
};

export default PulsingProgressBar;