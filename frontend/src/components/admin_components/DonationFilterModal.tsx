import React, { useState } from "react";
import DonationProps from "../../types/donation";
import CalendarComponent from "../admin_components/AdminCalendarButton";
import { CalendarMinus2 } from "lucide-react";

type DonationFilterModalProps = {
    id: string;
    data: DonationProps[];
    onApplyFilters: (filters: {
        status: string;
        location: string;
        created_by: string;
        date_from: string;
        date_to: string;
    }) => void;
};

const DonationFilterModal: React.FC<DonationFilterModalProps> = ({ id, data, onApplyFilters }) => {  
    const uniqueStatuses = ["Active", "Completed", "Cancelled", "Ongoing", "Archived", "Flagged"];
    const uniqueCreators = Array.from(new Set(data.map(donation => donation.created_by)));
    
    const [localFilters, setLocalFilters] = useState({
        status: "",
        location: "",
        created_by: "",
        date_from: null as Date | null,
        date_to: null as Date | null,
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDateChange = (name: string, date: Date | null) => {
        setLocalFilters((prev) => ({
            ...prev,
            [name]: date,
        }));
    };

    const clearFilters = () => {
        setLocalFilters({
            status: "",
            location: "",
            created_by: "",
            date_from: null,
            date_to: null,
        });
    };

    const applyFilters = () => {
        onApplyFilters({
            status: localFilters.status,
            location: localFilters.location,
            created_by: localFilters.created_by,
            date_from: localFilters.date_from?.toISOString().split('T')[0] || "",
            date_to: localFilters.date_to?.toISOString().split('T')[0] || "",
        });
        (document.getElementById(id) as HTMLDialogElement)?.close();
    };

    return (
        <dialog id={id} className="modal">
            <div className="flex flex-col gap-4 modal-box bg-LightBlue rounded-2xl">
                <form method="dialog" className="relative flex flex-row items-center text-Primary font-bold text-2xl border-b-2 border-DarkBlue pb-4">
                    <h3 className="absolute left-1/2 transform -translate-x-1/2">Filter Donations</h3>
                    <button className="ml-auto btn btn-outline btn-circle hover:bg-Primary hover:text-Tertiary">✕</button>
                </form>
                <div className="flex flex-col gap-4 text-Primary text-lg font-semibold px-3 pb-4 border-b-2 border-DarkBlue">
                    {/* status filter */}
                    <div>
                        <label className="block mb-2">Status</label>
                        <select 
                            className="select select-bordered text-DarkBlue font-normal border-1 border-DarkBlue rounded-2xl w-full bg-LightBlue" 
                            name="status"
                            value={localFilters.status}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Statuses</option>
                            {uniqueStatuses.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* created by filter */}
                    <div>
                        <label className="block mb-2">Created By</label>
                        <select 
                            className="select select-bordered text-DarkBlue font-normal border-1 border-DarkBlue rounded-2xl w-full bg-LightBlue"
                            name="created_by"
                            value={localFilters.created_by}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Creators</option>
                            {uniqueCreators.map((creator) => (
                                <option key={creator} value={creator}>{creator}</option>
                            ))}
                        </select>
                    </div>

                    {/* location filter */}
                    <div>
                        <label className="block mb-2">Location</label>
                        <input
                            type="text"
                            className="input input-bordered text-DarkBlue font-normal border-1 border-DarkBlue rounded-2xl w-full bg-LightBlue"
                            name="location"
                            value={localFilters.location}
                            onChange={handleFilterChange}
                            placeholder="Search location..."
                        />
                    </div>

                    {/* date range filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CalendarComponent 
                            label="Date Range"
                            placeholder="From"
                            onDateChange={(date) => handleDateChange('date_from', date)}
                            value={localFilters.date_from}
                            Icon={<CalendarMinus2 size={18} />}
                        />
                        <CalendarComponent 
                            label=""
                            placeholder="To"
                            onDateChange={(date) => handleDateChange('date_to', date)}
                            value={localFilters.date_to}
                            startDate={localFilters.date_from}
                            Icon={<CalendarMinus2 size={18} />}
                        />
                    </div>
                </div>
                <div className="flex flex-row justify-end items-center gap-2">
                    <button 
                        className="btn btn-outline border-2 border-Primary text-Primary hover:border-red-700 hover:text-red-700 rounded-2xl"
                        onClick={clearFilters}
                        type="button"
                    >
                        CLEAR
                    </button>
                    <button 
                        className="btn bg-Primary text-Tertiary hover:bg-green-700 rounded-2xl" 
                        onClick={applyFilters}
                        type="button"
                    >
                        APPLY
                    </button>
                </div>
            </div>
        </dialog>
    );
}

export default DonationFilterModal;