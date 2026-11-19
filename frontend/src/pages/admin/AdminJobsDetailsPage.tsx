import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Ellipsis, Box, CalendarDays, CircleAlert, ScrollText, TriangleAlert } from 'lucide-react';
import Button from '../../components/Button';
// import ChartsOverview from '../../components/admin_components/AdminChart';
// import AdminTable from '../../components/admin_components/AdminTable';
import AdminNavbar from '../../components/admin_components/AdminNavbar';
import { JobStatusEnum } from '../../types/job';
import { FormNavigationState } from './AdminJobsPage';
import { ApplicantView } from '../../types/adminView';
import axios from 'axios';
import AdminTable from '../../components/admin_components/AdminTable';
import { formatDateWithDash } from '../utils/TimeFormat';
import ListHeader from '../../components/admin_components/AdminHeaderSection';
import { showToast } from '../../components/utils/ToastFxn';
import JobReportModal from '../../components/admin_components/JobReportModal';
import { reportJobDetails } from '../../types/reportJob';
//import { showToast } from "../components/utils/ToastFxn";

const AdminJobsDetailsPage: React.FC = () => {
    const location = useLocation();
    const state = location.state as FormNavigationState | undefined;
    const jobId = state?.jobId ?? "";
    const [job, setJob] = useState(state?.jobDetails ?? null);
    // const existingJobs = state?.existingJobs ?? [];

    const navigate = useNavigate();
    // const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
    const [isEllipsisOpen, setIsEllipsisOpen] = useState(false);
    const ellipsisRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [applicants, setApplicants] = useState<ApplicantView[]>([]);
    const [totalApplicants, setTotalApplicants] = useState<number>(0);
    const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);

    const [jobReports, setJobReports] = useState<reportJobDetails[]>([]);

    // table columns head
    const tableHead = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'date', label: 'Date', sortable: true }
    ];

    if (!job) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-Primary mb-4">Job Not Found</h2>
                    <Button 
                        onClick={() => navigate('/admin/jobs')}
                        variant="major"
                    >
                        Back to Jobs
                    </Button>
                </div>
            </div>
        );
    }

    // fetch job details
    const fetchJobDetails = async() => {
        try {
            // Expect the API to return data matching the 'User' type
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/jobs/${jobId}`, {
                method: "GET",
                withCredentials: true,
            });
            const fetchedJobData = response.data;
            setJob(fetchedJobData);
            // console.log("Job data received:", fetchedJobData);

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    // console.log("Invalid job_id format.");
                } else if (error.response?.status === 404) {
                    // console.log("Job not found");
                }
            }
        }
    }

    // fetch job reports
    const fetchJobReports = async() => {
        try {
            // Expect the API to return data matching the 'User' type
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/jobs/reports/${jobId}`, {
                method: "GET",
                withCredentials: true,
            });
            const fetchedReportData = response.data;
            setJobReports(fetchedReportData.reports ?? []);
            // console.log("Report data received:", fetchedReportData);

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    // console.log("Invalid job_id format.");
                } else if (error.response?.status === 404) {
                    // console.log("Job not found");
                }
            }
        }
    }

    // fetch applicants
    const fetchApplicants = async() => {
        setIsLoading(true);
        try {
            // Expect the API to return data matching the 'User' type
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/jobs/${jobId}/applicants`, {
                method: "GET",
                withCredentials: true,
            });
            const fetchedApplicantsData = response.data;
            setApplicants(fetchedApplicantsData.applicants);
            setTotalApplicants(fetchedApplicantsData.total_applicants);
            // console.log("Applicant data received:", fetchedApplicantsData);

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403) {
                    // console.log("User is not an admin or token is invalid/missing.");
                } else if (error.response?.status === 500) {
                    // console.log("Database error or other server-side issue during processing.");
                }
            }
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchJobDetails();
        fetchApplicants();
        fetchJobReports();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ellipsisRef.current && !ellipsisRef.current.contains(event.target as Node)) {
                setIsEllipsisOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleEllipsis = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEllipsisOpen(!isEllipsisOpen);
    };

    const handleEditJob = () => {
        navigate('/admin/jobs/form', {state: { jobId: job._id, jobDetails: job, isEdit: true } as FormNavigationState});
    };
    
    const handleCloseJob = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/jobs/${job._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'Closed' }),
                credentials: 'include'
            });
            
            if (response.ok) {
                fetchJobDetails();
                showToast("success", "Job Successfully Closed", "Successfully closed the job.");
            } else {
                console.error('Failed to close job');
                showToast("error", "Error Closing Job", "An error occurred while closing the job.");
            }
        } catch (error) {
            console.error('Error closing job:', error);
            showToast("error", "Error Closing Job", "An error occurred while closing the job.");
        } finally {
            setIsEllipsisOpen(false);
        }
    };
    
    const handleArchiveJob = async () => {
        try {
            // const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/jobs/${job._id}/archive`, {
            //     method: 'PATCH',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     credentials: 'include'
            // });
            const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/jobs/${job._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'Archived' }),
                credentials: 'include'
            });
            
            if (response.ok) {
                fetchJobDetails();
                showToast("success", "Job Successfully Archived", "Successfully archived the job.");
            } else {
                console.error('Failed to archive initiative');
                showToast("error", "Error Archiving Job", "An error occurred while archiving the job.");
            }
        } catch (error) {
            console.error('Error archiving initiative:', error);
            showToast("error", "Error Archiving Job", "An error occurred while archiving the job.");
        } finally {
            setIsEllipsisOpen(false);
        }
    };

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
                        <h1 className="text-4xl font-bold text-Primary">{job.title}</h1>
                        <button 
                            onClick={() => (document.getElementById('job-report-modal') as HTMLDialogElement)?.showModal()}
                            className={`mx-2 p-3 rounded-full bg-ReportSecondary ${jobReports.length == 0 ? 'hidden' : ''}`}>
                                <TriangleAlert size={22} className='text-ReportPrimary'/>
                        </button>
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
                                                handleEditJob();
                                                setIsEllipsisOpen(false);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm rounded-2xl hover:bg-Primary hover:text-white"
                                        >
                                            Edit Job
                                        </button>
                                        <button
                                            disabled={job.status=='Closed'}
                                            onClick={() => {
                                                handleCloseJob();
                                                setIsEllipsisOpen(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 text-sm rounded-2xl ${job.status=='Closed' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-Primary hover:text-white'}`}
                                        >
                                            Close Job
                                        </button>
                                        <button
                                            disabled={job.status=='Archived'}
                                            onClick={() => {
                                                handleArchiveJob();
                                                setIsEllipsisOpen(false);
                                            }}
                                            className={`block w-full text-left px-4 py-2 text-sm rounded-2xl ${job.status=='Archived' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-Primary hover:text-white'}`}
                                        >
                                            Archive Job
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full flex gap-5 mb-5">
                        {/* donation image */}
                        {/* <div className="w-100 h-60 rounded-xl overflow-hidden bg-AdminLightBlue">
                            <img src={job.ImageURL} className="h-full w-full object-cover" />
                        </div> */}
                        <div className="flex flex-col gap-5 text-Primary">
                            {/* donation description */}
                            <h4>{job.description}</h4>
                            {/* donation information */}
                            <div className="flex flex-wrap gap-x-20 gap-y-5">
                                <JobDetailLabel icon={<Box />} label="Created by" value={job.author_name} />
                                <JobDetailLabel icon={<ScrollText />} label="Job Type" value={job.job_type} />
                                {job.date_posted && 
                                    <JobDetailLabel icon={<CalendarDays />} label="Date Posted" 
                                        value={new Date(job.date_posted).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    />
                                }
                                <JobDetailLabel icon={<MapPin />} label="Location" value={job.location} />
                                <JobDetailLabel icon={<CircleAlert />} label="Status" value={job.status} />
                            </div>
                        </div>
                    </div>

                    {/* UNINPLEMENTED STATISTICS HERE */}
                    {/* APPLICANTS BY BATCH */}
                    {/* APPLICATION TREND */}
                    {/* list header section */}
                    <ListHeader
                        title="Applicants"
                        totalCount={totalApplicants}
                        data={(applicants ?? []).map((a) => ({ _id: a.user_id }))}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                    />
                    {/* admin table */}
                    {isLoading ? (
                        <div className='flex justify-center items-center h-64'>
                            <span className='loading loading-spinner loading-lg'></span>
                        </div>
                    ) : (
                        <>
                            <AdminTable
                                tableHead={tableHead}
                                data={
                                    (applicants ?? []).map(applicant => ({
                                        ...applicant,
                                        _id: applicant.user_id, // map user_id to _id
                                        status: '', // or provide actual status if available
                                    }))
                                }
                                
                                type='applicants'
                                canEdit={false}
                                onEdit={()=>{}}
                                canDelete={false}
                                onDelete={()=>{}}
                                onView={()=>{}}
                                selectedItems={selectedApplicants}
                                setSelectedItems={setSelectedApplicants}
                                defaultSortColumn='date'
                                renderRow={(applicant) => (
                                    <>
                                        <td className="font-medium">{applicant.first_name + " " + applicant.last_name}</td>
                                        <td>
                                            {formatDateWithDash(applicant.applied_at)}
                                        </td>
                                    </>
                                )}
                            />
                        </>
                    )}

                    <JobReportModal id='job-report-modal' jobReports={jobReports}/>
                </div>
            </div>
        </div>
    );
};

export default AdminJobsDetailsPage;


interface JobDetailLabelProps {
    icon: React.ReactNode;
    label: string;
    value: string | JobStatusEnum;
}
/**
 * A label component for the details of a donation initiative.
 * @param {React.ReactNode} icon - an icon for the label
 * @param {string} label - label text
 * @param {string} value - value of the label
 * 
 * @example
 * <DonationDetailLabel icon={<Box />} label="Organized by" value={donation.organized_by} />
 */
const JobDetailLabel: React.FC<JobDetailLabelProps> = ({
    icon,
    label,
    value
}) => {
    const statusColor = (value == 'Still Hiring')? 'text-[#308D0E]' : (value == 'Closed')? 'text-Error' : (value == 'Archived') ? 'text-Gray' : '';
    return (
        <div className="flex gap-2">
            <div>{icon}</div>
            <div className="flex flex-col">
                <h3 className="font-semibold">{label}</h3>
                <h3 className={`text-sm font-medium ${statusColor}`}>{value}</h3>
            </div>
        </div>
    );
}