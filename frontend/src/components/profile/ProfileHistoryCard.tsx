import React, { useRef } from "react";
import { ManageCareerEntryModal, ManageEducationEntryModal, EducationEntryData } from "./ProfilePageModals";
import axios, { AxiosError } from "axios";

function convertNumericalMonthToWords(monthAndYear: string): string {
    if (!monthAndYear) return ""; 

    const [year, month] = monthAndYear.split("-"); // Split "YYYY-MM"
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return `${monthNames[parseInt(month) - 1]} ${year}`;
};

interface CareerEntryData {
    id?: string;
    company?: string;
    position?: string;
    logo_url?: string; // Assuming modal can accept this
    start_date?: string;
    end_date?: string;
    is_current?: boolean;
}

interface ProfileHistoryCardProps {
  id: string;
  imageLogo: string;
  name: string;
  title: string;
  type: "education" | "career";
  dateGraduated?: string;
  current?: boolean;
  dateStarted?: string;
  dateEnded?: string;
  notifySuccess: (message: string, source: 'education' | 'career') => void;
}

/**
 * This component is a card concerning either education or career entries in the Profile Page (UserProfilePage.tsx)
 * @param {string} type - "education" | "career"
 * @param {string} imageLogo - contains the URL for the image accompanying the entry
 * @param {string} name - name of school or company
 * @param {string} title - title of degree or position
 * @param {string} dateGraduated - optional; date of graduation (for education entries only)
 * @param {boolean} current - optional; indicator if current work (for career entries only)
 * @param {string} dateStarted - optional; starting date at work (for career entries only)
 * @param {string} dateStarted - optional; end date at work (empty string if current==true, for career entries only)
 * 
 * @example
 * // type == "education"
 * <ProfileHistoryCard
        type="education"
        imageLogo={educationEntry.imageSrc}
        name={educationEntry.name}
        title={educationEntry.title}
        dateGraduated={educationEntry.dateGraduated}
    />
 * 
 * @example
 * // type == "career"
 * <ProfileHistoryCard
        type="career"
        imageLogo={careerEntry.imageSrc}
        name={careerEntry.name}
        title={careerEntry.title}
        current={careerEntry.current}
        dateStarted={careerEntry.dateStarted}
        dateEnded={careerEntry.dateEnded}
    />
 * 
 */
const ProfileHistoryCard: React.FC<ProfileHistoryCardProps> = ({
    id,
    imageLogo,
    name,
    title,
    type,
    dateGraduated = '',
    current,
    dateStarted = '',
    dateEnded = '',
    notifySuccess
}) => {
    const educationModalRef = useRef<HTMLDialogElement>(null);
    const careerModalRef = useRef<HTMLDialogElement>(null);

    // edit functions are inside Modal components (saveChanges)
    const educationInitialData: EducationEntryData | null = type === "education" ? {
        id: id,
        name: name,
        title: title,
        dateGraduated: dateGraduated || undefined // Use undefined instead of null
    } : null;

    const careerInitialData: CareerEntryData | null = type === "career" ? {
        id: id,
        company: name,
        position: title,
        logo_url: imageLogo || undefined, // Pass logo if modal uses it
        start_date: dateStarted || undefined, // Use undefined
        end_date: dateEnded || undefined,     // Use undefined
        is_current: current ?? false,
    } : null;

    const handleDelete = async () => {
        const itemType = type === 'education' ? 'Education' : 'Career';
        if (!window.confirm(`Are you sure you want to remove this ${itemType.toLowerCase()} entry?`)) {
            return;
        }
        const endpoint = type === 'education'
            ? `${import.meta.env.VITE_API_URL}/profile/education/${id}`
            : `${import.meta.env.VITE_API_URL}/profile/career/${id}`;
        try {
            const response = await axios.delete(endpoint, { withCredentials: true });

            if (response.status === 204 || response.status === 200) { 
                notifySuccess(`${itemType} entry removed successfully!`, type); 
            } else {
                 alert(`Error: Unexpected status code ${response.status}`);
            }
        } catch (err: unknown) {
            const error = err as AxiosError;
            console.error(`Error removing ${itemType.toLowerCase()} entry:`, error);
            const message = (error.response?.data as { detail?: string })?.detail || `Failed to remove ${itemType.toLowerCase()} entry.`;
            alert(`Error: ${message}`); 
        }
    };

    return (
        <div className="relative mb-2">
            {/* modals */}
            {
            (type === "education")? 
                <ManageEducationEntryModal modalRef={educationModalRef} label="Edit" initialData={educationInitialData} notifySuccess={notifySuccess}/>
                :
                <ManageCareerEntryModal modalRef={careerModalRef} label="Edit" initialData={careerInitialData} notifySuccess={notifySuccess}/>
            }
            <div className="flex flex-col pl-15 gap-3">
                <div className="flex gap-2 items-center">
                    <img src={imageLogo} className="h-12 object-fit"/>
                    <h2 className="text-base font-medium text-Primary leading-none">{name}</h2>
                </div>
                <h2 className="text-base font-medium text-Primary leading-none">{title}</h2>
                
                {/* education card */}
                { (type == "education") && 
                    <h2 className="text-sm text-Primary opacity-75 leading-none">{`Graduated ${convertNumericalMonthToWords(dateGraduated)}`}</h2> }
                {/* current career card */}
                { (type == "career") && current &&
                    <h2 className="text-sm text-Primary opacity-75 leading-none">{`Current, Started ${convertNumericalMonthToWords(dateStarted)}`}</h2> }
                {/* past career card */}
                { (type == "career") && !current &&
                    <h2 className="text-sm text-Primary opacity-75 leading-none">{`${convertNumericalMonthToWords(dateStarted)} - ${convertNumericalMonthToWords(dateEnded)}`}</h2> }

                <div className="flex gap-2 text-sm font-bold text-Primary">
                    <CardButton label="Edit" 
                        onClick={()=>{
                            if (type === "education"){
                                educationModalRef.current?.showModal();
                            } else {
                                careerModalRef.current?.showModal()
                            }
                        }}
                    />
                    <CardButton label="Remove" 
                        onClick={handleDelete}
                    />
                </div>
            </div>

            {/* nodes */}
            <div className="absolute top-4 left-4 w-5 h-5 bg-[#82A5CF] rounded-full flex justify-center" />
        </div>
    );
}

/**
 * A small button found inside ProfileHistoryCards
 * @param {string} label - a label for the button 
 * @param {function} onClick - function to execute when button is clicked
 */
const CardButton: React.FC<{
    label: string,
    onClick: () => void,
}> = ({
    label,
    onClick
}) => {
    return (
        <button className="bg-white ring-2 ring-Primary py-1 px-[10px] rounded-lg" onClick={onClick}>
            {label}
        </button>
    );
}

export default ProfileHistoryCard;
