import React, { useEffect, useState } from "react";
import { reportJobDetails } from "../../types/reportJob";
import axios from "axios";
import ProfilePlaceHolder from "../../assets/placeholders/pfp_placeholder.avif";
import { AlumniProps } from "../../types/adminView";
import { ArrowLeft } from "lucide-react";

type modalContent = "List" | "Detail";

interface ReportContent {
    reportCategories: string[];
    reportDate: Date;
    reportDescription: string;
    reporterProfilePicture: string;
    reporterName: string;
}

const JobReportModal: React.FC<{
    id: string,
    jobReports?: reportJobDetails[];
}> = ({
    id,
    jobReports
}) => {  
    const [content, setContent] = useState<modalContent>("List");
    const [reportDetails, setReportDetails] = useState<ReportContent | undefined>(undefined);

    const handleBack = () => {
        setContent("List");
        setReportDetails(undefined);
    }

    return (
        <dialog id={id} className="modal">
            <div className="flex flex-col gap-4 modal-box bg-ReportTertiary rounded-2xl">
                <form method="dialog" className="relative flex flex-row items-center text-ReportPrimary font-bold text-2xl border-b-2 border-ReportSecondary pb-4">
                    <h3 className="absolute left-1/2 transform -translate-x-1/2">Reports</h3>
                    <button onClick={handleBack} className="ml-auto btn btn-outline btn-circle hover:bg-ReportPrimary hover:text-white">✕</button>
                </form>

                <div className="flex flex-col gap-4 px-3 pb-4 border-b-2 border-ReportSecondary">
                    { content === "List" ?
                        <div>
                            {
                                (jobReports ?? []).map((report, index) => {
                                    return <JobReportCard key={index} report={report}
                                                setReportDetails={setReportDetails}
                                                setContentToDetail={() => setContent("Detail")}
                                    />
                                })
                            }
                        </div>
                        :
                        <div className="flex items-start gap-3">
                            { reportDetails &&
                                <>
                                    <button>
                                        <ArrowLeft className="text-ReportPrimary" onClick={handleBack}/>
                                    </button>
                                    <div className="flex flex-col text-ReportPrimary">
                                        { (reportDetails?.reportCategories).map((category) => {
                                            return <h3 className="font-semibold">{category}</h3>
                                            })
                                        }
                                        <h4 className="text-sm">
                                            {new Date(reportDetails.reportDate)
                                                .toLocaleString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "numeric",
                                                minute: "2-digit",
                                                hour12: true,
                                                })}
                                        </h4>
                                        <h4 className="text-base my-3">{reportDetails.reportDescription}</h4>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 rounded-full aspect-square overflow-hidden">
                                                    <img src={reportDetails.reporterProfilePicture} className="object-cover w-full h-full rounded-full"/>
                                            </div>
                                            <div className="flex flex-col items-start gap-1">
                                                <h2 className="text-sm font-semibold">{reportDetails.reporterName}</h2>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            }
                        </div>
                    }
                </div>

                <div className="flex flex-row justify-end items-center gap-2">
                    <button 
                        className={`btn bg-ReportPrimary text-white hover:brightness-110 rounded-2xl px-5 ${content === "List"? 'hidden' : ''}`} 
                        onClick={handleBack}
                        type="button"
                    >
                        BACK
                    </button>
                    <form method="dialog" className={content === "Detail"? 'hidden' : ''}>
                        <button 
                            className={`btn bg-ReportPrimary text-white hover:brightness-110 rounded-2xl px-5`} 
                            onClick={() => {}}
                        >
                            CLOSE
                    </button>
                    </form>
                </div>
            </div>
        </dialog>
    );
}

const JobReportCard: React.FC<{
    report: reportJobDetails,
    setReportDetails: (details: ReportContent) => void;
    setContentToDetail: () => void;
}> = ({
    report,
    setReportDetails,
    setContentToDetail
}) => {
    const [reporter, setReporter] = useState<AlumniProps>();

    // console.log(report);
    
    // fetch reporter details
    const fetchAlumniDetails = async() => {
        try {
            // Expect the API to return data matching the 'User' type
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/alumni/${report.user_id}`, {
                method: "GET",
                withCredentials: true,
            });
            const fetchedData = response.data;
            setReporter(fetchedData);
            // console.log("Data received:", fetchedData);

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

    useEffect(() => {
        fetchAlumniDetails();
    }, []);

    const handleReportClick = () => {
        const reportContent: ReportContent = {
            reportCategories: report.category,
            reportDate: report.updated_at,
            reportDescription: !report.description ? "" : report.description,
            reporterProfilePicture: !reporter?.profile_picture ? ProfilePlaceHolder : reporter.profile_picture,
            reporterName: `${reporter?.first_name} ${reporter?.last_name}`
        }
        setReportDetails(reportContent);
        setContentToDetail();
    }

    return (
        <button className="flex gap-3 text-ReportPrimary py-3 px-2 border-b-1 border-ReportSecondary w-full hover:bg-ReportSecondary hover:rounded-lg"
            onClick={handleReportClick}
        >
            <div className="h-10 rounded-full aspect-square overflow-hidden">
                <img src={!reporter?.profile_picture ? ProfilePlaceHolder : reporter.profile_picture} className="object-cover w-full h-full rounded-full"/>
            </div>
            <div className="flex flex-col items-start gap-1">
                <h2 className="text-xs font-semibold">{reporter?.first_name} {reporter?.last_name}</h2>
                <h3 className="text-sm leading-none">{!report.description ? report.category[0] : report.description}</h3>
            </div>
        </button>
    )
}

export default JobReportModal;