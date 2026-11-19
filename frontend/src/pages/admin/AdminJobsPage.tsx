import React, { useEffect, useState } from 'react';
import AdminTable from '../../components/admin_components/AdminTable';
import { BlankJob, JobProps } from '../../types/job';
import JobFilterModal from '../../components/admin_components/JobFilterModal';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/admin_components/AdminNavbar';
import { handleExport } from '../../components/admin_components/Exports';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { StatisticsBox } from '../../components/admin_components/AdminDashboardComponents';
import { AlumniJobStatisticsPieChart } from '../../components/admin_components/AdminDashboardCharts';
import { JobTrendLineChart } from '../../components/admin_components/AdminOtherCharts';
import { formatDateWithDash } from '../utils/TimeFormat';
import ListHeader from '../../components/admin_components/AdminHeaderSection';
import { showToast } from '../../components/utils/ToastFxn';
import DeleteModal from '../../components/admin_components/DeleteModal';
import { toastPromise } from '../utils/ToastFxn';

export interface FormNavigationState {
    jobId: string;
    jobDetails: JobProps;
    existingJobs?: JobProps[];
    newJob?: JobProps;
    isEdit?: boolean;
}

const AdminJobsPage: React.FC = () => {
    const [totalJobs, setTotalJobs] = useState<number>(0);
    const [totalOpenJobs, setTotalOpenJobs] = useState<number>(0);
    const [jobsByField, setJobsByField] = useState({});
    const [jobCountByMonth, setJobCountByMonth] = useState([]);
    const [jobs, setJobs] = useState<JobProps[]>([]);
    const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
    const [jobList, setJobList] = useState<JobProps[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        job_type: "",
        salary_range:[0, 250000] as [number, number],
        location: "",
        status: "",
        keyword: ""
    });
    const location = useLocation();
    const navigate = useNavigate();

    const [itemIDToDelete, setItemIDToDelete] = useState<string>("");
    const [itemNameToDelete, setItemNameToDelete] = useState<string>("");

    // fetch jobs statistics
    const fetchJobsStatistics = async() => {
        try {
            // Expect the API to return data matching the 'User' type
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/total-jobs`, {
                method: "GET",
                withCredentials: true,
            });
            const fetchedJobsData = response.data;
            setTotalJobs(fetchedJobsData.total_jobs);
            setTotalOpenJobs(fetchedJobsData.total_open_jobs);
            setJobsByField(fetchedJobsData.jobs_by_field);
            // console.log("Jobs data received:", fetchedJobsData);

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403) {
                    console.log("User is not an admin or token is invalid/missing.");
                } else if (error.response?.status === 500) {
                    console.log("Database error or other server-side issue during processing.");
                }
            }
        }
    }

    // fetch number of jobs created by month
    const fetchJobCountByMonth = async() => {
        try {
            // Expect the API to return data matching the 'User' type
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/jobs/months`, {
                method: "GET",
                withCredentials: true,
            });
            const fetchedJobCountData = response.data;
            setJobCountByMonth(fetchedJobCountData);
            // console.log("Job count data received:", fetchedJobCountData);

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403) {
                    console.log("User is not an admin or token is invalid/missing.");
                } else if (error.response?.status === 500) {
                    console.log("Database error or other server-side issue during processing.");
                }
            }
        }
    }

    // fetch on page mount
    useEffect(() => {
        fetchJobsStatistics();
        fetchJobCountByMonth();
    }, []);

    // Fetches job postings based on filters, pagination, and tab selection
	const fetchJobs = async () => {
        setIsLoading(true);
        console.log('job_type: ', filters.job_type);
        console.log('status: ', filters.status);

		try {
			const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/jobs`, {
				params: {
					skip: (currentPage - 1) * 10,
					limit: 100,
					keyword: filters.keyword || undefined,
					job_type: filters.job_type || undefined,
					min_salary: filters.salary_range[0] > 0 ? filters.salary_range[0] : undefined,
					max_salary: filters.salary_range[1] < 250000 ? filters.salary_range[1] : undefined,
                    status: filters.status ? filters.status : undefined,
                    location: filters.location || undefined,
                },
				withCredentials: true,
			});
			setJobs(response.data.jobs);
            setJobList(response.data.jobs);
            console.log('jobs: ', response.data.jobs);
		} catch (error: any) {
			if (error.response && error.response.status === 404) {
				// If no jobs are found, reset the job list and pagination
				setJobs([]);
				setJobList([]);
			} else {
				console.error("Failed to fetch jobs", error);
			}
		} finally {
            setIsLoading(false);
        }
	};

    useEffect(() => {
        fetchJobs();
    }, [filters, currentPage]);

    useEffect(() => {
        if (location.state?.newJob) {
            const { newJob, isEdit } = location.state;
            setJobs(prevJobs => {
                if (isEdit) {
                    return prevJobs.map(job =>
                        job._id === newJob._id ? newJob : job
                    );
                } else {
                    const exists = prevJobs.some(job => job._id === newJob._id);
                    return exists ? prevJobs : [newJob, ...prevJobs];
                }
            });
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // job delete button handler
    const handleDeleteJobClick = async(job: JobProps) => {
        setItemIDToDelete(job._id);
        setItemNameToDelete(job.title);
        (document.getElementById('delete-job-modal') as HTMLDialogElement)?.showModal();
    };

    // job deletion handler
    const handleDeleteJob = async(id: string) => {
        try {
            setIsLoading(true);
            await toastPromise(
                axios.delete(`${import.meta.env.VITE_API_URL}/admin/jobs/${id}`, {
                    method: "DELETE",
                    withCredentials: true
                }),
                {
                loading: {
                    title: "Deleting job...",
                    description: "Job is being deleted.",
                    type: "info",
                },
                success: {
                    title: "Success!",
                    description: "Job was successfully deleted.",
                    type: "success",
                },
                error: {
                    title: "Failed!",
                    description: "There was an error deleting this job.",
                    type: "error",
                },
                }
            ).then(async() => {
                setJobs(prev => prev.filter(job => job._id !== id));
                setSelectedJobs(prev => prev.filter(jobId => jobId !== id));
                
                // Refresh the job list and statistics after deletion
                await fetchJobs();
                await fetchJobsStatistics();
                await fetchJobCountByMonth();
            });
        } catch (error) {
            // console.error("Failed to delete job", error);
        } finally {
            setIsLoading(false);
        }
    }

    // apply filters from modal
    const handleApplyFilters = (newFilters: {
        job_type: string;
        salary_range: [number, number];
        location: string;
        status: string;
    }) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters
        }));
        setCurrentPage(1);
    };

    const handleSearch = () => {
        setFilters(prev => ({
            ...prev,
            keyword: searchQuery
        }));
        setCurrentPage(1);
    };

    // exports 
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    const handleExportClick = (type: 'csv' | 'json' | 'txt') => {
        handleExport(jobs, type);
        setIsDropdownVisible(false);
    };

    // table columns head
    const tableHead = [
        { key: 'title', label: 'Job Title', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'company_name', label: 'Company', sortable: true },
        { key: 'location', label: 'Location', sortable: true },
        { key: 'date_posted', label: 'Posted On', sortable: true },
        { key: 'author_name', label: 'Author', sortable: true }
    ];

    /* job create */
    const handleCreateJobClick = () => {
        navigate('form', {state: { jobId: "", jobDetails: BlankJob, existingJobs: jobList } as FormNavigationState});
    };
    // job edit
    const handleEditJob = (job: JobProps) => {
        navigate('form', {state: { jobId: job._id, jobDetails: job, existingJobs: jobList, isEdit: true } as FormNavigationState});
    };

    // job view
    const handleViewJob = (job: JobProps) => {
        navigate(`/admin/jobs/view`, {state: { jobId: job._id, jobDetails: job, existingJobs: jobList } as FormNavigationState});
    };



    return (
        <div className="flex w-[100vw]">
            <AdminNavbar />
            <div className="flex w-full justify-center items-center">
                {/* limit width to 1280px */}
                <div className="w-[80vw] max-w-[1280px] h-full bg-white p-10">
                    <div className="flex flex-col gap-5">
                        {/* job page statistics */}
                        <div className="flex flex-col gap-5">
                            <StatisticsBox label="Job Tally" headerHidden={true} className="w-full">
                                <OpenAndTotalJobCounts totalJobs={totalJobs} totalOpenJobs={totalOpenJobs} jobsByMonth={jobCountByMonth}/>
                            </StatisticsBox>
                            <div className="flex gap-5 w-full">
                                <StatisticsBox label="Jobs Distribution" className="flex-3/8">
                                    <AlumniJobStatisticsPieChart jobsData={jobsByField}/>
                                </StatisticsBox>
                                <StatisticsBox label="Job Posts Trend" className="flex-5/8">
                                    <JobTrendLineChart jobTrendData={jobCountByMonth} />
                                </StatisticsBox>
                            </div>
                        </div>

                        {/* job listings section */}
                        <div className="h-full w-full flex flex-col justify-center items-start">
                            <div className='flex flex-col align-center py-5 justify-center items-center w-full mx-auto'>

                                {/* list header section */}
                                <ListHeader
                                    title="Job Listings"
                                    totalCount={totalJobs}
                                    data={jobs}
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    onApplyFilters={handleApplyFilters}
                                    onCreate={handleCreateJobClick}
                                    FilterModalComponent={JobFilterModal}
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
                                                data={jobs}
                                                type='jobs'
                                                onEdit={handleEditJob}
                                                onDelete={handleDeleteJobClick}
                                                onView={handleViewJob}
                                                selectedItems={selectedJobs}
                                                setSelectedItems={setSelectedJobs}
                                                defaultSortColumn='date_posted'
                                                renderRow={(job) => (
                                                    <>
                                                        <td className="font-medium">{job.title}</td>
                                                        <td>
                                                            <span className={`inline-flex items-center px-4 py-1 rounded-4xl text-xs ${
                                                                job.status === 'Still Hiring'
                                                                    ? "bg-green-200 text-accent" 
                                                                    : job.status === 'Closed' 
                                                                        ? "bg-red-200 text-Error"
                                                                        : 'bg-LightGray text-gray-500'
                                                            }`}>
                                                                <span className={`status rounded-2xl mr-2 ${job.status === "Still Hiring" ? "status-accent" : job.status === "Closed" ? "status-error" : "status-neutral"}`}></span>
                                                                {job.status}
                                                            </span>
                                                        </td>
                                                        <td>{job.company_name}</td>
                                                        <td>{job.location}</td>                       
                                                        <td>
                                                            {job.date_posted && formatDateWithDash(job.date_posted)}
                                                        </td>
                                                        <td>{job.author_name}</td>
                                                    </>
                                                )}
                                            />
                                        </>
                                    )}
                                <DeleteModal modalID='delete-job-modal' modalHeader="Delete Job" itemType="job" id={itemIDToDelete} itemName={itemNameToDelete} deleteFunction={handleDeleteJob} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default AdminJobsPage;

const OpenAndTotalJobCounts: React.FC<{
    totalJobs: number,
    totalOpenJobs: number,
    jobsByMonth: any[]
}> = ({
    totalJobs,
    totalOpenJobs,
    jobsByMonth
}) => {

    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-based
    const currentYear = now.getFullYear();

    // Find matching entries
    const current = jobsByMonth.find(d => d.year === currentYear && d.month === currentMonth);
    const jobPostsThisMonth = current?.total_posts ?? 0;

    const openJobsThisMonth = 0;

    return (
        <div className="flex w-full text-Primary p-5">
            <div className="flex justify-evenly items-center w-1/2">
                <h2 className="text-lg">Open</h2>
                <div className="flex flex-col items-center">
                    <h2 className="text-3xl font-bold">{totalOpenJobs}</h2>
                    <h2 className={`leading-none text-sm ${openJobsThisMonth <= 0 ? 'hidden' : 'text-[#44A820]'}`}>123</h2>
                </div>
            </div>
            <div className="flex justify-evenly items-center w-1/2">
                <h2 className="text-lg">Total Job Posts</h2>
                <div className="flex flex-col items-center">
                    <h2 className="text-3xl font-bold">{totalJobs}</h2>
                    <h2 className={`leading-none text-sm ${jobPostsThisMonth <= 0 ? 'hidden' : 'text-[#44A820]'}`}>
                        {`+ ${jobPostsThisMonth} this month`}
                    </h2>
                </div>
            </div>
        </div>
    )
}