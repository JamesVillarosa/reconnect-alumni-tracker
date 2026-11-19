import React, { useState } from "react";
import Dropdown from "../Dropdown";
import { RSVPStatus } from '../../types/rsvpEntry';

type RSVPFilterModalProps = {
    id: string;
    onApplyFilters: (filters: { status: RSVPStatus | '' }) => void;
};

const RSVPFilterModal: React.FC<RSVPFilterModalProps> = ({ id, onApplyFilters }) => {
    const [statusFilter, setStatusFilter] = useState<RSVPStatus | ''>('');

    const applyFilters = () => {
        onApplyFilters({ status: statusFilter });
        (document.getElementById(id) as HTMLDialogElement)?.close();
    };

    const clearFilters = () => {
        setStatusFilter('');
        onApplyFilters({ status: '' });
    };

    return (
        <dialog id={id} className="modal">
            <div className="flex flex-col gap-4 modal-box bg-LightBlue rounded-2xl">
                <form method="dialog" className="relative flex flex-row items-center text-Primary font-bold text-2xl border-b-2 border-DarkBlue pb-4">
                    <h3 className="absolute left-1/2 transform -translate-x-1/2">Filter RSVPs</h3>
                    <button className="ml-auto btn btn-outline btn-circle hover:bg-Primary hover:text-Tertiary">✕</button>
                </form>
                <div className="flex flex-col gap-2 text-Primary text-lg font-semibold px-3 pb-4 border-b-2 border-DarkBlue">
                    <Dropdown
                        label="Status"
                        value={statusFilter}
                        options={['Going', 'Cancelled', 'Done']}
                        onChange={(status) => setStatusFilter(status as RSVPStatus | '')}
                        placeholder="All Statuses"
                    />
                </div>
                <div className="flex flex-row justify-end items-center gap-2">
                    <button
                        className="btn btn-outline border-2 border-Primary text-Primary hover:border-red-700 hover:text-red-700 rounded-2xl"
                        onClick={clearFilters}
                    >
                        CLEAR
                    </button>
                    <button
                        className="btn bg-Primary text-Tertiary hover:bg-green-700 rounded-2xl"
                        onClick={applyFilters}
                    >
                        APPLY
                    </button>
                </div>
            </div>
        </dialog>
    );
};

export default RSVPFilterModal;
