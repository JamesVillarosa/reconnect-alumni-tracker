import React, { useState, useEffect, SetStateAction } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminTable from "../../components/admin_components/AdminTable";
import SwitchTabs from "../../components/admin_components/AdminSwitchTabs";
import { AlumniProps } from "../../types/adminView";
import { EventProps, SampleEvents } from "../../types/event";
import { JobProps, JobsSample } from "../../types/job";
import DonationProps, { SampleDonations } from "../../types/donation";
import { ArrowLeft, Ellipsis } from "lucide-react";
import AdminNavbar from "../../components/admin_components/AdminNavbar";
import AlumniDetails from "../../components/admin_components/AlumniDetails";
import axios from "axios";
import { formatDateWithDash } from "../utils/TimeFormat";
import { StatisticsBox } from "../../components/admin_components/AdminDashboardComponents";

export type TabType = 'posted_jobs' | 'donated' | 'rsvped_events' | 'created_events' | 'created_donations';

const AdminAlumniDetailsPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<TabType>('posted_jobs');
    const [alumni, setAlumni] = useState<AlumniProps | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [relatedData, setRelatedData] = useState<(EventProps | JobProps | DonationProps | any)[]>([]);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const [highlightLabel1, setHighlightLabel1] = useState<string | null>("Open");
    const [highlightLabel2, setHighlightLabel2] = useState<string | null>("Total Jobs Created");
    const [highlightedValue1, setHighlightedValue1] = useState<number | null>(0);
    const [highlightedValue2, setHighlightedValue2] = useState<number | null>(0);

    // ellipsis handling
    const [isEllipsisOpen, setIsEllipsisOpen] = React.useState(false);
    const ellipsisRef = React.useRef<HTMLDivElement>(null);
    const handleEllipsis = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEllipsisOpen(!isEllipsisOpen);
    };

    useEffect(() => {
        if (location.state?.alumni) {
            setAlumni(location.state.alumni);
            if (location.state.initialTab) {
                setActiveTab(location.state.initialTab);
            }
            setIsLoading(false);
        } else {
            const alumniId = window.location.pathname.split('/').pop();
            if (alumniId) {
                fetchAlumniById(alumniId);
            }
        }
        // } else {
        //     const sampleAlumni = SampleAlumni[0];
        //     setAlumni(sampleAlumni);
        //     setIsLoading(false);
        // }
    }, [location]);

    const fetchAlumniById = async (id: string) => {
        setIsLoading(true);
        try {
            const response = await axios.get<AlumniProps>(
                `${import.meta.env.VITE_API_URL}/admin/alumni/${id}`,
                { withCredentials: true }
            );
            setAlumni(response.data);
        } catch (error) {
            console.error("Failed to fetch alumni:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAlumniJobs = async() => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/jobs/alumni/${alumni?._id}`, {
                withCredentials: true,
            });

            const fetchedAlumniJobs = response.data;
            setHighlightedValue1(fetchedAlumniJobs.total_open_jobs);
            setHighlightedValue2(fetchedAlumniJobs.total_jobs_created);
            setHighlightLabel1("Open");
            setHighlightLabel2("Total Jobs Created");
            return fetchedAlumniJobs.created_jobs;
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                // If no jobs are found, reset the job list and pagination
                return [];
            } else {
                console.error("Failed to fetch alumni", error);
            }
        }
    }

    const fetchAlumniEvents = async() => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/events/alumni/${alumni?._id}`, {
                withCredentials: true,
            });

            const fetchedAlumniEvents = response.data;
            setHighlightedValue1(fetchedAlumniEvents.total_approved_events);
            setHighlightedValue2(fetchedAlumniEvents.total_events_created);
            setHighlightLabel1("Approved");
            setHighlightLabel2("Total Events Created");
            return fetchedAlumniEvents.events;
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                // If no jobs are found, reset the job list and pagination
                return [];
            } else {
                console.error("Failed to fetch alumni", error);
            }
        }
    }

    const fetchAlumniRSVP = async() => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/events/rsvp/alumni/${alumni?._id}`, {
                withCredentials: true,
            });

            const fetchedAlumniRSVP = response.data;
            setHighlightedValue1(fetchedAlumniRSVP.total_to_attend);
            setHighlightedValue2(fetchedAlumniRSVP.total_rsvps);
            setHighlightLabel1("Total to Attend");
            setHighlightLabel2("Total RSVPs");
            return fetchedAlumniRSVP.rsvp_records;
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                // If no jobs are found, reset the job list and pagination
                return [];
            } else {
                console.error("Failed to fetch alumni", error);
            }
        }
    }

    const fetchAlumniInitiatives = async() => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/donation/alumni/${alumni?._id}`, {
                withCredentials: true,
            });

            const fetchedAlumniInitiatives = response.data;
            setHighlightedValue1(fetchedAlumniInitiatives.total_open_initiatives);
            setHighlightedValue2(fetchedAlumniInitiatives.total_initiatives_created);
            setHighlightLabel1("Open");
            setHighlightLabel2("Total Initiatives Created");
            return fetchedAlumniInitiatives.initiatives_created;
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                // If no jobs are found, reset the job list and pagination
                return [];
            } else {
                console.error("Failed to fetch alumni", error);
            }
        }
    }

    const fetchAlumniDonations = async() => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/donation/donors/alumni/${alumni?._id}`, {
                withCredentials: true,
            });

            const fetchedAlumniDonations = response.data;
            console.log(fetchedAlumniDonations);
            setHighlightedValue1(fetchedAlumniDonations.total_monetary_donated_amount);
            setHighlightedValue2(fetchedAlumniDonations.total_in_kind_donations_count);
            setHighlightLabel1("Monetary");
            setHighlightLabel2("In-Kind");
            return fetchedAlumniDonations.contributions;
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                // If no jobs are found, reset the job list and pagination
                return [];
            } else {
                console.error("Failed to fetch alumni", error);
            }
        }
    }

    useEffect(() => {
        if (!alumni) return;

        const fetchRelatedData = async() => {
            setIsLoading(true);
            
            //setTimeout(() => {
                let data: any[] = [];
                
                switch (activeTab) {
                    case 'posted_jobs':
                        // data = JobsSample.filter(job => 
                        //     alumni.posted_jobs?.includes(job._id)
                        // );
                        data = await fetchAlumniJobs();
                        break;
                    case 'created_events':
                        // data = SampleEvents.filter(event => 
                        //     alumni.created_events?.includes(event._id)
                        // );
                        data = await fetchAlumniEvents();
                        console.log(data);
                        break;
                    case 'rsvped_events':
                        // data = SampleEvents.filter(event => 
                        //     alumni.rsvpd_events?.includes(event._id)
                        // );
                        data = await fetchAlumniRSVP();
                        break;
                    case 'created_donations':
                        // data = SampleDonations.filter(donation => 
                        //     alumni.created_donations?.includes(donation._id)
                        // );
                        data = await fetchAlumniInitiatives();
                        break;
                    case 'donated':
                        // data = SampleDonations.filter(donation => 
                        //     alumni.recent_donations?.some(d => d.id === donation._id)
                        // );
                        data = await fetchAlumniDonations();
                        break;
                }
                
                setRelatedData(data);
                setIsLoading(false);
            //}, 500);
        };

        fetchRelatedData();
    }, [activeTab, alumni]);

    const getTableColumns = () => {
        switch (activeTab) {
            case 'posted_jobs':
                return [
                    { key: 'title', label: 'Job Title', sortable: true },
                    { key: 'status', label: 'Status', sortable: true },
                    { key: 'company_name', label: 'Company', sortable: true },
                    { key: 'location', label: 'Location', sortable: true },
                    { key: 'date_posted', label: 'Date Posted', sortable: true },
                ];
            case 'created_events':
                return [
                    { key: 'title', label: 'Event Title', sortable: true },
                    { key: 'event_date', label: 'Date', sortable: true },
                    { key: 'location', label: 'Location', sortable: true },
                    { key: 'rsvp_count', label: 'RSVPs', sortable: true }
                ];
            case 'rsvped_events':
                return [
                    { key: 'title', label: 'Event Title', sortable: true },
                    { key: 'status', label: 'Status', sortable: true },
                    { key: 'event_date', label: 'Date of event', sortable: true },
                    { key: 'rsvped_date', label: 'Date of RSVP', sortable: true },
                ];
            case 'created_donations':
                return [
                    { key: 'title', label: 'Campaign', sortable: true },
                    { key: 'status', label: 'Status', sortable: true },
                    { key: 'organized_by', label: 'Organizer', sortable: true },
                    { key: 'location', label: 'Location', sortable: true },
                    { key: 'created_at', label: 'Date Posted', sortable: true }
                ];
            case 'donated':
                return [
                    { key: 'title', label: 'Initiative Title', sortable: true },
                    { key: 'status', label: 'Status', sortable: true },
                    { key: 'donation', label: 'Donation', sortable: true },
                    { key: 'donation_date', label: 'Date of Donation', sortable: true },
                ];
            default:
                return [];
        }
    };

    const renderRow = (item: any) => {
        switch (activeTab) {
            case 'posted_jobs':
                return (
                    <>
                        <td className="font-medium">{item.title}</td>
                        <td>
                            <span className={`badge ${item.status === 'Still Hiring' ? 'badge-success' : 'badge-error'}`}>
                                {item.status}
                            </span>
                        </td>
                        <td>{item.company_name}</td>
                        <td>{item.location}</td>
                        <td>{item.date_posted && formatDateWithDash(item.date_posted)}</td>

                    </>
                );
            case 'created_events':
                return (
                    <>
                        <td className="font-medium">{item.title}</td>
                        <td>{item.event_date && formatDateWithDash(item.event_date)}</td>
                        <td>{item.location}</td>
                        <td>{item.rsvp_count}</td>
                    </>
                );
            case 'rsvped_events':
                return (
                    <>
                        <td className="font-medium">{item.event_title}</td>
                        <td>
                            <span className={`badge ${item.approval_status === 'Approved' ? 'badge-success' : 
                                item.approval_status === 'Pending' ? 'badge-warning' : 'badge-error'}`}>
                                {item.status}
                            </span>
                        </td>
                        <td>{item.event_date && formatDateWithDash(item.event_date)}</td>
                        <td>{item.date && formatDateWithDash(item.date)}</td>
                    </>
                );
            case 'created_donations':
                return (
                    <>
                        <td className="font-medium">{item.title}</td>
                        <td>{item.status}</td>
                        <td>
                            {/* <p className="line-clamp-2">{(item.organizers).map((o:any) => o.name).join(', ')}</p> */}
                            {item.organizers}
                        </td>
                        <td>{item.location}</td>
                        <td>{item.created_at && formatDateWithDash(item.created_at)}</td>
</>
                );
            case 'donated':
                return (
                    <>
                        <td className="font-medium">{item.driveId}</td>
                        <td>
                            <span className={`badge ${item.approval_status === 'Approved' ? 'badge-success' : 
                                item.approval_status === 'Pending' ? 'badge-warning' : 'badge-error'}`}>
                                {item.status}
                            </span>
                        </td>
                        <td>{item.donation_type}</td>
                        <td>{item.created_at && formatDateWithDash(item.created_at)}</td>
                    </>
                );
            default:
                return null;
        }
    };

    // if (isLoading || !alumni) {
    //     return (
    //         <div className="flex justify-center items-center h-64">
    //             <span className="loading loading-spinner loading-lg"></span>
    //         </div>
    //     );
    // }
    if (!alumni) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="flex w-[100vw]">
            <AdminNavbar />
            <div className="flex w-full justify-center items-center">
                {/* limit width to 1280px */}
                <div className="w-[80vw] max-w-[1280px] h-full bg-white p-10">
                    {/* job title and header buttons */}
                    <div className="flex w-full justify-start gap-2 items-center mb-8 text-center">
                        <button 
                            onClick={() => navigate(-1)}
                            className="text-gray-500 hover:text-gray-700 p-2 text-Primary"
                        >
                            <ArrowLeft size={24} className="text-Primary"/>
                        </button>
                        <h1 className="text-4xl font-bold text-Primary">{`${alumni.first_name} ${alumni.last_name}`}</h1>
                        <div className="relative flex grow justify-end" ref={ellipsisRef}>
                            <button 
                                onClick={handleEllipsis}
                                className="text-gray-500 hover:text-gray-700 p-2 text-Primary"
                            >
                                <Ellipsis size={32} className="text-Primary"/>
                            </button>
                            {isEllipsisOpen && (
                                <div className="absolute right-0 top-5 mt-4 w-48 bg-LightBlue rounded-2xl shadow-lg z-10 border border-gray-200">
                                    <div className="text-Primary">
                                        <button
                                            onClick={() => {
                                                setIsEllipsisOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm rounded-2xl hover:bg-Primary hover:text-white"
                                        >
                                            Edit Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEllipsisOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm rounded-2xl hover:bg-Primary hover:text-white"
                                        >
                                            Reset Password
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEllipsisOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm rounded-2xl hover:bg-Primary hover:text-white"
                                        >
                                            Archive Account
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEllipsisOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm rounded-2xl hover:bg-Primary hover:text-white"
                                        >
                                            Mark Tenured
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full flex justify-center mb-10">
                        <AlumniDetails alumni={alumni} />
                    </div>

                    {/* Tabs Component */}
                    <div className="mb-6">
                        <SwitchTabs
                            tabs={[
                                { id: 'posted_jobs', label: 'Posted Jobs' },
                                { id: 'created_events', label: 'Created Events' },
                                { id: 'rsvped_events', label: 'RSVPed Events' },
                                { id: 'created_donations', label: 'Created Donations' },
                                { id: 'donated', label: 'Donations' }
                            ]}
                            activeTab={activeTab}
                            onTabChange={(tab) => setActiveTab(tab as TabType)}
                        />
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <span className="loading loading-spinner loading-lg"></span>
                        </div>
                    ) : (
                        <>
                            <StatisticsBox label="Highlighted Values" headerHidden={true} className="w-full">
                                <HighlightSection label1={highlightLabel1} value1={highlightedValue1} label2={highlightLabel2} value2={highlightedValue2}/>
                            </StatisticsBox>
                            <div className="bg-white rounded-lg shadow">
                                {/* Admin Table */}
                                <AdminTable
                                    tableHead={getTableColumns()}
                                    data={relatedData}
                                    onEdit={
                                        function (item: any): void {
                                            console.log("func not implemented");
                                        } 
                                    } 
                                    onDelete={
                                        function (id: string): void {
                                            console.log("func not implemented");
                                        }
                                    } 
                                    onView={
                                        function (item: any): void {
                                            console.log("func not implemented");
                                        }
                                    } 
                                    selectedItems={[]}
                                    setSelectedItems={setSelectedItems}
                                    renderRow={renderRow} 
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAlumniDetailsPage;

const HighlightSection: React.FC<{
    value1: number | null,
    label1: string | null,
    value2: number | null,
    label2: string | null
}> = ({
    value1,
    label1,
    value2,
    label2
}) => {
    return (
        <div className="flex w-full text-Primary p-5">
            { label1 !== null &&
                <div className="flex justify-evenly items-center w-1/2">
                    <h2 className="text-lg">{label1}</h2>
                    <div className="flex flex-col items-center">
                        <h2 className="text-3xl font-bold">{value1}</h2>
                    </div>
                </div>
            }
            { label2 !== null &&
                <div className="flex justify-evenly items-center w-1/2">
                    <h2 className="text-lg">{label2}</h2>
                    <div className="flex flex-col items-center">
                        <h2 className="text-3xl font-bold">{value2}</h2>
                    </div>
                </div>
            }
        </div>
    )
}