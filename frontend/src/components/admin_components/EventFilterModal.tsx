import React, { useState } from "react";
import EventProps, { Organizer } from "../../types/event";
import CalendarComponent from "../admin_components/AdminCalendarButton";
import { CalendarMinus2 } from "lucide-react";

type EventFilterModalProps = {
    id: string;
    data: EventProps[];
    onApplyFilters: (filters: {
        approval_status: string;
        location: string;
        organizers: string;
        date_from: string;
        date_to: string;
    }) => void;
};

const EventFilterModal: React.FC<EventFilterModalProps> = ({ id, data, onApplyFilters }) => {  
    const uniqueApprovalStatuses = Array.from(new Set(data.map(event => event.approval_status)));
    // get all unique organizer names
    const uniqueOrganizers = Array.from(
        new Set(
            data.flatMap(event => 
                event.organizers.map((org: Organizer) => org.name)
            )
        )
    ).sort();
    
    const [localFilters, setLocalFilters] = useState({
        approval_status: "",
        location: "",
        organizers: "",
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
            approval_status: "",
            location: "",
            organizers: "",
            date_from: null,
            date_to: null,
        });
    };

    const applyFilters = () => {
        onApplyFilters({
            approval_status: localFilters.approval_status,
            location: localFilters.location,
            organizers: localFilters.organizers,
            date_from: localFilters.date_from?.toISOString().split('T')[0] || "",
            date_to: localFilters.date_to?.toISOString().split('T')[0] || "",
        });
        (document.getElementById(id) as HTMLDialogElement)?.close();
    };

    return (
        <dialog id={id} className="modal">
            <div className="flex flex-col gap-4 modal-box bg-LightBlue rounded-2xl">
                <form method="dialog" className="relative flex flex-row items-center text-Primary font-bold text-2xl border-b-2 border-DarkBlue pb-4">
                    <h3 className="absolute left-1/2 transform -translate-x-1/2">Filter Events</h3>
                    <button className="ml-auto btn btn-outline btn-circle hover:bg-Primary hover:text-Tertiary">✕</button>
                </form>
                <div className="flex flex-col gap-4 text-Primary text-lg font-semibold px-3 pb-4 border-b-2 border-DarkBlue">
                    {/* Approval Status Filter */}
                    <div>
                        <label className="block mb-2">Approval Status</label>
                        <select 
                            className="select select-bordered text-DarkBlue font-normal border-1 border-DarkBlue rounded-2xl w-full bg-LightBlue" 
                            name="approval_status"
                            value={localFilters.approval_status}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Statuses</option>
                            {uniqueApprovalStatuses.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Organizers Filter */}
                    <div>
                        <label className="block mb-2">Organizers</label>
                        <select 
                            className="select select-bordered text-DarkBlue font-normal border-1 border-DarkBlue rounded-2xl w-full bg-LightBlue"
                            name="organizers"
                            value={localFilters.organizers}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Organizers</option>
                            {uniqueOrganizers.map((organizer) => (
                                <option key={organizer} value={organizer}>{organizer}</option>
                            ))}
                        </select>
                    </div>

                    {/* Location Filter */}
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

                    {/* Date Range Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CalendarComponent 
                            label="From Date"
                            onDateChange={(date) => handleDateChange('date_from', date)}
                            value={localFilters.date_from}
                            Icon={<CalendarMinus2 size={18} />}
                        />
                        <CalendarComponent 
                            label="To Date"
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

export default EventFilterModal;