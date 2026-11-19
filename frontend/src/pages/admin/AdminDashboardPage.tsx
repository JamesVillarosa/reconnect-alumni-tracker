import axios from "axios";
import { AlumniDistributionDoughnutChart, AlumniJobStatisticsPieChart } from "../../components/admin_components/AdminDashboardCharts";
import AdminNavbar from "../../components/admin_components/AdminNavbar";
import { useEffect, useState } from "react";
import { DashboardDonationDriveCard, DashboardLabelAndValue, DashboardPendingAlumniCard, StatisticsBox } from "../../components/admin_components/AdminDashboardComponents";
import { Banknote, Heart } from "lucide-react";
import { AlumniProps, RecentDonationInfo } from "../../types/adminView";

const AdminDashboardPage: React.FC = () => {
    const [totalAlumniCount, setTotalAlumniCount] = useState<number>(0);
    const [totalPendingAlumniCount, setTotalPendingAlumniCount] = useState<number>(0);
    const [oldestPendingAlumni, setOldestPendingAlumni] = useState<AlumniProps[]>([]);
    const [alumniDistribution, setAlumniDistribution] = useState({});
    const [totalJobs, setTotalJobs] = useState<number>(0);
    const [totalOpenJobs, setTotalOpenJobs] = useState<number>(0);
    const [jobsByField, setJobsByField] = useState({});
    const [totalMonetaryDonations, setTotalMonetaryDonations] = useState<number>(0);
    const [totalInKindDonations, setTotalInKindDonations] = useState<number>(0);
    const [recentDonationDrives, setRecentDonationDrives] = useState<RecentDonationInfo[]>([]);

    const fetchAlumniStatistics = async() => {
        try {
            // Expect the API to return data matching the 'User' type
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/total-sign-ups`, {
                method: "GET",
                withCredentials: true,
            });
            const fetchedAlumniData = response.data;
            setTotalAlumniCount(fetchedAlumniData.total_alumni);
            setTotalPendingAlumniCount(fetchedAlumniData.total_pending);
            setOldestPendingAlumni(fetchedAlumniData.first_three_pending);
            console.log("Alumni data received:", fetchedAlumniData);

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

    const fetchAlumniDistribution = async() => {
        try {
            // Expect the API to return data matching the 'User' type
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/alumni/country`, {
                method: "GET",
                withCredentials: true,
            });
            const fetchedDistributionData = response.data;
            console.log("Alumni distribution data received:", fetchedDistributionData);
            setAlumniDistribution(fetchedDistributionData);

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
            console.log("Jobs data received:", fetchedJobsData);

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

    const fetchCummulativeDonationStatistics = async() => {
        try {
            // Expect the API to return data matching the 'User' type
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/total-donations`, {
                method: "GET",
                withCredentials: true,
            });
            const fetchedDonationsData = response.data;
            setTotalMonetaryDonations(fetchedDonationsData.total_raised_funds);
            setTotalInKindDonations(fetchedDonationsData.total_items_collected);
            setRecentDonationDrives(fetchedDonationsData.recent_active_drives);
            console.log("Donation data received:", fetchedDonationsData);

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

    // fetch needed data on mount
    useEffect(() => {
        fetchAlumniStatistics();
        fetchAlumniDistribution();
        fetchJobsStatistics();
        fetchCummulativeDonationStatistics();
    }, []);







    return (
        <div className="flex w-[100vw]">
            <AdminNavbar />
            <div className="flex w-full justify-center items-center">
                {/* limit width to 1280px */}
                <div className="w-[80vw] max-w-[1280px] h-full bg-white p-10">
                    <div className="flex flex-col gap-5">
                        {/* admin statistics */}
                        <div className="flex gap-5">
                            <StatisticsBox label="Alumni Sign Ups" className="flex-4/7">
                                <div className="flex gap-2 items-center">
                                    <div className="flex flex-col flex-1/4 gap-5">
                                        <DashboardLabelAndValue label="Pending" value={totalPendingAlumniCount} />
                                        <DashboardLabelAndValue label="Total Alumni" value={totalAlumniCount} />
                                    </div>
                                    <div className="flex flex-col flex-grow gap-2">
                                        <h2 className="text-Primary font-semibold">Oldest Pending Alumni</h2>
                                        <div className="flex flex-col gap-2">
                                            { oldestPendingAlumni.map((alumni) => {
                                                return <DashboardPendingAlumniCard key={alumni._id} user={alumni} />
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </StatisticsBox>

                            <StatisticsBox label="Alumni Distribution" className="flex-3/7">
                                <AlumniDistributionDoughnutChart distributionData={alumniDistribution} />
                            </StatisticsBox>
                        </div>

                        {/* job, events, and donation statistics */}
                        <div className="flex gap-5">
                            <div className="flex flex-4/7 flex-col gap-5" >
                                <StatisticsBox label="Jobs by Field">
                                    <div className="flex gap-2 items-center">
                                        <div className="flex flex-col flex-1/4 gap-5">
                                            <DashboardLabelAndValue label="Open" value={totalOpenJobs} />
                                            <DashboardLabelAndValue label="Total Job Posts" value={totalJobs} />
                                        </div>
                                        <AlumniJobStatisticsPieChart jobsData={jobsByField}/>
                                    </div>
                                </StatisticsBox>

                                <StatisticsBox label="Event RSVPs">
                                    No data found.
                                </StatisticsBox>
                            </div>

                            <StatisticsBox label="Cummulative Donations" className="flex-3/7">
                                <div className="flex flex-col gap-5">
                                    <div className="flex flex-row gap-5">
                                        <DashboardLabelAndValue label="Monetary" unit="₱" 
                                            icon={<Banknote size={36} className="text-Primary mb-2"/>}
                                            value={totalMonetaryDonations.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                            className="w-1/2"
                                        />
                                        <DashboardLabelAndValue label="In-Kind" 
                                            icon={<Heart size={36} className="text-Primary fill-Primary mb-2"/>}
                                            value={totalInKindDonations.toLocaleString('en-US', {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0
                                            })}
                                            className="w-1/2"
                                        />
                                    </div>
                                    <h2 className="text-Primary font-semibold">Recently Active Drives</h2>
                                    <div className="flex flex-col gap-2 -mt-3">
                                        { recentDonationDrives.map((drive) => {
                                            return <DashboardDonationDriveCard key={drive.id} drive={drive}/>
                                        })}
                                    </div>
                                </div>
                            </StatisticsBox>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboardPage;