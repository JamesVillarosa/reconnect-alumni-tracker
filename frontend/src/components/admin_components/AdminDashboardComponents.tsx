import { useEffect, useRef, useState } from "react";
import { Banknote, Ellipsis, Heart } from "lucide-react";
import { AlumniProps, RecentDonationInfo } from "../../types/adminView";
import ProfilePic from '../../assets/placeholders/pfp_placeholder.avif';

export const DashboardLabelAndValue: React.FC<{
    icon?: React.ReactNode,
    label: string,
    value: number | string,
    unit?: string,
    className?: string
}> = ({
    icon, label, value, unit, className
}) => {
    return (
        <div className={`flex flex-col items-center text-center text-Primary ${className}`}>
            {icon}
            <h2 className="text-3xl font-bold">{unit ? unit + " " + value : value}</h2>
            <h2 className="text-base">{label}</h2>
        </div>
    );
}
interface StatisticsProps {
    label: string,
    children: React.ReactNode,
    className?: string,
    headerHidden?: boolean
}

export const StatisticsBox: React.FC<StatisticsProps> = ({ label, children, className = "", headerHidden = false }) => {
    const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLButtonElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
        ) {
            setIsOptionsOpen(false);
        }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`w-full p-5 border-[2px] border-AdminLightBlue rounded-2xl ${className}`}>
            {/* statistics header and button */}
            <div className={`flex justify-between text-DarkerPrimary mb-2 ${headerHidden? 'hidden' : ''}`}>
                <h3 className="text-lg font-semibold">{label}</h3>
                <button className="relative" ref={dropdownRef} onClick={() => setIsOptionsOpen(prev => !prev)}>
                    <Ellipsis />
                    {isOptionsOpen && (
                        <ul className="absolute right-0 mt-2 w-50 bg-Tertiary rounded-lg overflow-hidden shadow-lg z-10">
                            <li><button className="w-full px-4 py-2 hover:bg-AdminLightBlue cursor-pointer">Download CSV</button></li>

                        </ul>
                    )}
                </button>
            </div>
            {children}
        </div>
    );
}

/**
 * Temporary card design for donation drive card in admin dashboard.
 */
export const DashboardDonationDriveCard: React.FC<{ drive: RecentDonationInfo }> = ({
    drive
}) => {
    return (
        <div id={drive.id} className="bg-Tertiary flex items-center gap-2 py-3 px-5 rounded-xl">
            <div className="flex-col flex-grow gap-3 text-Primary">
                <h1 className="text-sm font-bold">{drive.title}</h1>
                <div className="flex w-full text-sm gap-2">
                    <h2 className="flex items-center flex-1/2 gap-2"><Banknote size={20} />{drive.raised_funds}</h2>
                    <h2 className="flex items-center flex-1/2 gap-2"><Heart size={20} className="fill-Primary"/>{drive.items_collected}</h2>
                </div>
            </div>
            <div>
                <button className="bg-Primary text-white text-sm px-3 py-1 rounded-full">
                    View
                </button>
            </div>
        </div>
    );
}

/**
 * Card design for pending alumnus in Admin Dashboard.
 */
export const DashboardPendingAlumniCard: React.FC<{ user: AlumniProps }> = ({
    user
}) => {
    return (
        <div id={user._id} className="bg-Tertiary w-full flex items-center gap-2 p-3 rounded-xl">
            <div className="h-8 aspect-square border border-Primary rounded-full overflow-hidden">
                <img src={user.profile_picture ? user.profile_picture : ProfilePic} className="h-full aspect-square object-cover" />
            </div>
            <h1 className="text-sm text-Primary flex-grow">{user.first_name + " " + user.last_name}</h1>
            <div>
                <button className="bg-Primary text-white text-xs px-3 py-1 rounded-full">
                    Review
                </button>
            </div>
        </div>
    );
}