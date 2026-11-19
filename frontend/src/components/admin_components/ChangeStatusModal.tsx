import { Triangle } from "lucide-react";
import { useEffect, useState } from "react";

export type StringToFunctionMap = {
  [key: string]: (() => void) | ((arg: any) => void); // or another function signature like (arg: string) => number
};

interface ChangeStatusModalProps {
    modalID: string;
    modalHeader: string;
    options: StringToFunctionMap,
    currentStatus: string;
    id: string
}

const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({
    modalID,
    modalHeader,
    options,
    currentStatus,
    id
}) => {
    const [status, setStatus] = useState<string>(currentStatus);

    useEffect(() => {
        setStatus(currentStatus);
    }, [currentStatus]);

    const handleConfirm = () => {
        const fn = options[status];

        if (!fn) return;

        // Determine arity (function.length = number of parameters)
        if (fn.length === 0) {
            (fn as () => void)();
        } else {
            console.log(id);
            (fn as (arg: string) => void)(id);
        }
    };

    return (
        <dialog id={modalID} className="modal">
            <div className="flex flex-col gap-4 modal-box bg-LightBlue rounded-2xl">
                <form method="dialog" className="relative flex flex-row items-center justify-center text-Primary font-bold text-2xl border-b-2 border-DarkBlue pb-4">
                    <div className="flex flex-col items-center">
                        <h3 className="">{modalHeader}</h3>
                    </div>
                    <button className="absolute right-0 ml-auto btn btn-outline btn-circle hover:bg-Primary hover:text-Tertiary">✕</button>
                </form>

                <div className="flex flex-col text-Primary text-lg font-semibold px-3 pb-4 border-b-2 border-DarkBlue">                   
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
                            {Object.keys(options).map((key) => (
                                <option key={key} value={key}>
                                    {key}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-[#97A9BE]">
                            <Triangle size={16} className="rotate-180 text-primary fill-current" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-row justify-end items-center gap-2">
                    <form method="dialog" className="flex gap-2">
                        <button 
                            className={`btn text-Primary hover:bg-Primary hover:text-white border-2 border-Primary rounded-2xl px-5`} 
                            onClick={()=>{}}
                        >
                            CANCEL
                        </button>
                        <button 
                            className={`btn bg-Primary text-white hover:brightness-120 border-2 border-Primary rounded-2xl px-5`} 
                            onClick={handleConfirm}
                        >
                            CONFIRM
                    </button>
                    </form>
                </div>
            </div>
        </dialog>
    )
}

export default ChangeStatusModal;