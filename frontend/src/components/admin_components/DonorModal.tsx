import React, { useEffect, useState } from "react";
import { AlumniProps } from "../../types/adminView";
import DonorProps from "../../types/donor";
import { formatDateWithDash, formatTimeAMPM } from "../../pages/utils/TimeFormat";
import { Triangle } from "lucide-react";

export interface DonorModalDetails {
    donorName: string;
    donorDetails?: any;
}

const DonorModal: React.FC<{
    id: string,
    modalContent: DonorModalDetails | undefined;
    resetModalDetails: () => void;
}> = ({
    id,
    modalContent,
    resetModalDetails
}) => {  
    const [details, setDetails] = useState<DonorModalDetails | undefined>(undefined);
    const [status, setStatus] = useState<string>(modalContent?.donorDetails.status);

    return (
        <dialog id={id} className="modal">
            <div className="flex flex-col gap-4 modal-box bg-LightBlue rounded-2xl">
                <form method="dialog" className="relative flex flex-row items-center justify-center text-Primary font-bold text-2xl border-b-2 border-DarkBlue pb-4">
                    <div className="flex flex-col items-center">
                        <h3 className="">{modalContent?.donorName}</h3>
                        <h4 className="text-sm font-normal">{formatDateWithDash(modalContent?.donorDetails.updated_at)} | {formatTimeAMPM(modalContent?.donorDetails.updated_at)}</h4>
                    </div>
                    <button className="absolute right-0 ml-auto btn btn-outline btn-circle hover:bg-Primary hover:text-Tertiary">✕</button>
                </form>

                <div className="flex flex-col gap-4 text-Primary text-lg font-semibold px-3 pb-4 border-b-2 border-DarkBlue">                   
                    <div className="flex justify-between">
                        <h3>Amount</h3>
                        <h3 className="font-normal">Php {modalContent?.donorDetails.amount}</h3>
                    </div>

                    <div className="flex flex-col gap-1">
                        <h3>Proof of Donation</h3>
                        { modalContent?.donorDetails.receiptImageURL==="" ?
                            <h3 className="font-normal text-sm leading-none">No available proof of donation.</h3>
                            :
                            <div className="w-full h-20">
                                <img src={modalContent?.donorDetails.receiptImageURL} className="w-full h-full object-cover" />
                            </div>
                        }
                    </div>

                    <div className="flex flex-col gap-1">
                        <h3>Status</h3>
                        <div className="relative">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className={`
                                    w-full text-Primary text-left
                                    px-4 py-2 lg:py-3 pr-10
                                    border-2 border-Primary
                                    rounded-3xl
                                    placeholder-[#97A9BE]
                                    focus:outline-none focus:ring-1 focus:ring-Secondary focus:border-Secondary
                                    transition-colors
                                    appearance-none
                                `}
                            >
                                <button className="text-left"><option>Pending</option></button>
                                <button className="text-left"><option>Approved</option></button>
                                <button className="text-left"><option>Rejected</option></button>
                            </select>
                            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-[#97A9BE]">
                                <Triangle size={16} className="rotate-180 text-primary fill-current" />
                            </div>
                        </div>
                        {/* <h3 className="font-normal">Php {modalContent?.donorDetails.amount}</h3> */}
                    </div>
                    
                </div>

                <div className="flex flex-row justify-end items-center gap-2">
                    <form method="dialog">
                        <button 
                            className={`btn bg-Primary text-white hover:brightness-110 rounded-2xl px-5`} 
                            onClick={resetModalDetails}
                        >
                            CLOSE
                        </button>
                    </form>
                </div>
            </div>
        </dialog>
    );
}

export default DonorModal;