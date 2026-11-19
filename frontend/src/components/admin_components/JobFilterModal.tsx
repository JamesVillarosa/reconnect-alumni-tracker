import React, { useState } from "react";
import JobProps from "../../types/job";
import Slider from "@mui/material/Slider";
import { JobTypeEnum } from "../../types/job";

type JobFilterModalProps = {
    id: string;
    data: JobProps[];
    onApplyFilters: (filters: {
        job_type: string;
        salary_range: [number, number];
        location: string;
        status: string;
    }) => void;
};

const JobFilterModal: React.FC<JobFilterModalProps> = ({ id, data, onApplyFilters }) => {  
    const uniqueEmploymentTypes = JobTypeEnum
    const uniqueStatuses = ["Still Hiring", "Closed"]
    const [showSalaryModal, setShowSalaryModal] = useState(false);

    const [localFilters, setLocalFilters] = useState({
        job_type: "",
        salary_range: [0, 250000] as [number, number],
        location: "",
        status: "",
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSalaryChange = (_event: Event, newValue: number | number[]) => {
        setLocalFilters(prev => ({
          ...prev,
          salary_range: newValue as [number, number],
        }));
    };

    const clearFilters = () => {
        setLocalFilters({
            job_type: "",
            salary_range: [0, 250000],
            location: "",
            status: "",
        });
    };

    const applyFilters = () => {
        onApplyFilters({
            job_type: localFilters.job_type,
            salary_range: localFilters.salary_range,
            location: localFilters.location,
            status: localFilters.status
        });
        (document.getElementById(id) as HTMLDialogElement)?.close();
    };

    return (
        <dialog id={id} className="modal">
            <div className="flex flex-col gap-4 modal-box bg-LightBlue rounded-2xl">
                <form method="dialog" className="relative flex flex-row items-center text-Primary font-bold text-2xl border-b-2 border-DarkBlue pb-4">
                    <h3 className="absolute left-1/2 transform -translate-x-1/2">Filter Jobs</h3>
                    <button className="ml-auto btn btn-outline btn-circle hover:bg-Primary hover:text-Tertiary">✕</button>
                </form>
                <div className="flex flex-col gap-2 text-Primary text-lg font-semibold px-3 pb-4 border-b-2 border-DarkBlue">                   
                    <div>
                        <label className="block">Employment Type</label>
                        <select 
                            className="select select-bordered text-DarkBlue font-normal border-1 border-DarkBlue rounded-2xl w-full bg-LightBlue" 
                            name="job_type"
                            value={localFilters.job_type}
                            onChange={handleFilterChange}
                        >
                            <option value="">Select employment type</option>
                            {uniqueEmploymentTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="relative">
                        <label className="block">Salary Range (₱)</label>
                        <button 
                            type="button"
                            className="select select-bordered text-DarkBlue font-normal border-1 border-DarkBlue rounded-2xl w-full bg-LightBlue text-left"
                            onClick={() => setShowSalaryModal(!showSalaryModal)}
                        >
                            {`${localFilters.salary_range[0]} - ${localFilters.salary_range[1]}`}
                        </button>
                        {showSalaryModal && (
                            <div className="px-2">
                                <Slider
                                    value={localFilters.salary_range}
                                    onChange={handleSalaryChange}
                                    valueLabelDisplay="auto"
                                    min={0}
                                    max={250000}
                                    step={5000}
                                />
                                <div className="flex justify-between text-sm mt-1">
                                    <span>₱{localFilters.salary_range[0].toLocaleString()}</span>
                                    <span>₱{localFilters.salary_range[1].toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block">Location</label>
                        <input 
                            type="text" 
                            className="input border-1 border-DarkBlue rounded-2xl w-full bg-LightBlue" 
                            name="location"
                            value={localFilters.location}
                            onChange={handleFilterChange}
                        />
                    </div>
                    
                    <div>
                        <label className="block">Status</label>
                        <select 
                            className="select select-bordered text-DarkBlue font-normal border-1 border-DarkBlue rounded-2xl w-full bg-LightBlue" 
                            name="status"
                            value={localFilters.status}
                            onChange={handleFilterChange}
                        >
                            <option value="">Select status</option>
                            {uniqueStatuses.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
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
}

export default JobFilterModal;