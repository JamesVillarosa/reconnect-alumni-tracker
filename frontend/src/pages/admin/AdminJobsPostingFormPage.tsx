import React, { useState } from "react";
import Textfield from "../../components/Textfield";
import Button from "../../components/Button";
import Selector from "../../components/Selector"
import UserNavbar from "../../components/UserNavbar";
import CalendarComponent from "../../components/admin_components/AdminCalendarButton";
import JobProps, {JobFieldEnum, JobLevelEnum, JobTypeEnum} from "../../types/job";
import {CircleUser, Link, Banknote, Compass, Layers, Minus, ArrowLeft} from "lucide-react";
import Slider from "@mui/material/Slider";
import { useLocation, useNavigate } from "react-router-dom";
import { FormNavigationState } from "./AdminJobsPage";
import { useAuthContext } from "../../hooks/useAuthContext";
import axios from "axios";

interface AdminJobPostingFormPageProps {
    job?: JobProps;
};

const AdminJobPostingFormPage: React.FC = () => {
    const {user} = useAuthContext();
    const navigate = useNavigate();
    const reactLocation = useLocation();
    const state = reactLocation.state as FormNavigationState;
    const jobId = state.jobId ?? "";
    const jobDetails = state.jobDetails ?? null;
    const isEdit = state.isEdit ?? false;
    // const existingJobs = state?.existingJobs ?? [];
    
	// State variables to store form data
    // const [title, setTitle] = useState<string>(isEdit ? jobDetails.title : "");
	const [name, setName] = useState<string>(isEdit? jobDetails.company_name : "");
    const [url, setURL] = useState<string>(isEdit? jobDetails.company_url : "");
	const [location, setLocation] = useState(isEdit? jobDetails.location : "");
	const [jobField, setJobField] = useState<string>(isEdit? jobDetails.job_field : "Web Developer");
    const [employmentType, setEmploymentType] = useState<string>(isEdit? jobDetails.job_type : "Full-time");
    const [level, setLevel] = useState<string>(isEdit? jobDetails?.job_level : "Intern");
    // const [minSalary, setMinSalary] = useState<number>(jobDetails.min_salary ?? 0);
    // const [maxSalary, setMaxSalary] = useState<number>(jobDetails.max_salary ?? 0);
    const [description, setDescription] = useState(isEdit? jobDetails.description : "");
	const [applicationLink, setApplicationLink] = useState<string>(isEdit? jobDetails.application_link : "");
	const [qualifications, setQualifications] = useState<string[]>(isEdit? jobDetails.qualifications : []);
    const [startDate, setStartDate] = useState<Date | null>(isEdit? new Date(jobDetails.start_date) : null);
    const [endDate, setEndDate] = useState<Date | null>(isEdit ? new Date(jobDetails.end_date) : null);
	const [salaryRange, setSalaryRange] = useState<[number, number]>([jobDetails.min_salary ?? 0, jobDetails.max_salary ?? 250000]);


	const handleSalaryChange = (_event: Event, newValue: number | number[]) => {
		if (Array.isArray(newValue)) {
			setSalaryRange(newValue as [number, number]); 
		}

	};
	
	// Adds a new empty qualification field
	const addQualification = () => {
		setQualifications([...qualifications, ""]);
	};
	
	// Removes a qualification by index
	const removeQualification = (index: number) => {
		const updatedQualifications = qualifications.filter((_, i) => i !== index);
		setQualifications(updatedQualifications);
	};
	
	// Updates a specific qualification's value
	const updateQualification = (index: number, value: string) => {
		const updatedQualifications = [...qualifications];
		updatedQualifications[index] = value;
		setQualifications(updatedQualifications);
	};

	const JOB_FIELD_OPTIONS: JobFieldEnum[] = [
		'Web Developer',
		'Mobile Developer',
		'Backend Developer',
		'Frontend Developer',
		'Full Stack Developer',
		'UI/UX Developer',
		'QA Tester',
		'DevOps Engineer',
		'Data Analyst',
		'Project Manager'
	];
	
	const JOB_LEVEL_OPTIONS: JobLevelEnum[] = [
		'Intern',
		'Entry Level',
		'Junior',
		'Mid Level',
		'Senior',
		'Lead',
		'Principal'
	];
	
	const JOB_TYPE_OPTIONS: JobTypeEnum[] = [
		'Full-Time',
		'Part-Time'
	];
	
	
	// Updates 
	const handleSave = async () => {
        const payload = isEdit? {
            title: `Job at ${name}`,
            company_name: name,
            company_url: url,
            location: location,
            job_field: jobField,
            job_type: employmentType,
            job_level: level,
            min_salary: salaryRange[0],
            max_salary: salaryRange[1],
            description: description,
            application_link: applicationLink,
            qualifications: qualifications,
            start_date: startDate ? new Date(startDate).toISOString() : null,
            end_date: endDate ? new Date(endDate).toISOString() : null
        } : {
            authorId: user?._id,
            title: `Job at ${name}`,
            company_name: name,
            company_url: url,
            location: location,
            job_field: jobField,
            job_type: employmentType,
            job_level: level,
            min_salary: salaryRange[0],
            max_salary: salaryRange[1],
            description: description,
            application_link: applicationLink,
            flagged: false,
            qualifications: qualifications,
            start_date: startDate ? new Date(startDate).toISOString() : null,
            end_date: endDate ? new Date(endDate).toISOString() : null,
            status: "Still Hiring",
            date_posted: new Date().toISOString(),
            author_name: "ICS Re:Connect Admin"
        };

        try {

            const response = isEdit ? 
                await axios.patch(`${import.meta.env.VITE_API_URL}/admin/jobs/${jobId}`, payload, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                })
                :
                await axios.post(`${import.meta.env.VITE_API_URL}/jobs`, payload, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                });
        
            if (response) {
                console.log(response);
                // if success go back
                navigate(-1);
            } else {
                console.error("Survey submission failed");
                // Show error message
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 500) {
                    console.log("Database error or other server-side issue during processing.");
                }
            }
        }

        // const newJob: JobProps = {
        //     _id: generateJobId(),
        //     authorId: "admin",
        //     title: jobField,
        //     company_name: name,
        //     company_url: url,
        //     location: location,
        //     job_field: jobField as JobFieldEnum,
        //     job_type: employmentType as JobTypeEnum,
        //     job_level: level as JobLevelEnum,
        //     min_salary: salaryRange[0],
        //     max_salary: salaryRange[1],
        //     description: description,
        //     application_link: application,
        //     qualifications: qualifications,
        //     start_date: startDate || new Date(),
        //     end_date: endDate || new Date(new Date().setMonth(new Date().getMonth()+1)),
        //     status: "Still Hiring",
        //     date_posted: new Date(),
        //     author_name: "Admin User",
        // };
        // navigate('/admin/jobs', {
        //    state: {
        //     newJob: newJob,
        //     isEdit: !!jobId
        //    } 
        // });
	};


    return (
        <div className="flex flex-col items-center justify-between min-h-screen bg-white ">
            {/* Add Header/Back/Search Component */}
            <div className="flex flex-col w-full items-center justify-center">       
            {/* Form card */}
                <div className="w-full text-Primary bg-base-100 px-5 py-2 mb-16 rounded-2xl max-w-2xl md:max-w-3xl lg:max-w-4xl">
                    <div className="flex py-8 gap-3 items-center">
                        <ArrowLeft className="text-Primary" onClick={() => navigate(-1)}/>
                        <h1 className="font-bold text-3xl">{isEdit ? "Edit Job Opportunity" : "New Job Opportunity"}</h1>
                        {/* <p className="text-sm">By submitting this application, you consent to the use of your email and contact number for future updates and communications regarding this job posting.</p> */}
                    </div>
                    <div className="">
                        <div className="flex flex-col pb-8">
                            <h4 className="text-lg font-bold">What company is this job at?<span className="text-Required">*</span></h4>
                            <div className="flex flex-col md:flex-row md:gap-4">
                                <div className="w-full md:w-3/5">
                                <label className="font-medium text-sm text-Label">Company Name<span className="text-Required">*</span></label>
                                <Textfield
                                    label=""
                                    type="text"
                                    placeholder="Company Name"
                                    value={name}
                                    icon={<CircleUser size={20} className="text-Label" />}
                                    onChange={(e) => setName(e.target.value)}
                                    required={true}
                                />
                                </div>
                                <div className="w-full md:w-2/5">
                                <label className="font-medium text-sm text-Label">Location<span className="text-Required">*</span></label>
                                <Textfield
                                    label=""
                                    type="text"
                                    placeholder="Specify job location"
                                    value={location}
                                    icon={<Compass size={20} className="text-Label" />}
                                    onChange={(e) => setLocation(e.target.value)}
                                    required={true}
                                />
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:gap-4 mt-4">
                                <div className="w-full md:w-1/2">
                                <label className="font-medium text-sm text-Label">Company URL<span className="text-Required">*</span></label>
                                <Textfield
                                    label=""
                                    type="text"
                                    placeholder="Company URL"
                                    value={url}
                                    icon={<Link size={20} className="text-[#467EBA]" />}
                                    onChange={(e) => setURL(e.target.value)}
                                    required={true}
                                />
                                </div>
                                <div className="w-full md:w-1/2">
                                <label className="font-medium text-sm text-Label">Link to Application Form<span className="text-Required">*</span></label>
                                <Textfield
                                    label=""
                                    type="text"
                                    placeholder="Job Link"
                                    value={applicationLink}
                                    icon={<Link size={20} className="text-Label" />}
                                    onChange={(e) => setApplicationLink(e.target.value)}
                                    required={true}
                                />
                                </div>
                            </div>
                        
                        </div>

                        <div className="flex flex-col pb-4">
                            <h4 className="text-lg font-bold">Tell us about this job!</h4>
                            <div className="pb-4 m-2">
                                <Selector label={<p>Field Option<span className="text-Required">*</span></p>} options={JOB_FIELD_OPTIONS} onSelect={(jobField) => setJobField(jobField)} value={jobField} />
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 pb-4 m-2">
                            <div className="md:w-3/5">
                                <Selector label={<p>Level Option<span className="text-Required">*</span></p>} options={JOB_LEVEL_OPTIONS} onSelect={(level) => setLevel(level)} value={level} />
                            </div>
                            <div className="md:w-2/5">
                                <Selector label={<p>Employee Type<span className="text-Required">*</span></p>} options={JOB_TYPE_OPTIONS} onSelect={(employmentType) => setEmploymentType(employmentType)} value={employmentType} />
                            </div>
                        </div>

                        <div className="pb-4 m-2">
                            <label className="font-medium text-sm text-Label">Monthly Salary<span className="text-Required">*</span></label>
                            <Slider 
                                value={salaryRange} 
                                onChange={handleSalaryChange} 
                                valueLabelDisplay="auto" 
                                min={0} 
                                max={250000} 
                                step={100} 
                            />
                            <div className="flex gap-4 mt-2 justify-center items-center">
                                <Textfield 
                                label="" 
                                type="text" 
                                placeholder="Min Salary" 
                                value={`Php ${salaryRange[0].toString()}`} 
                                icon={<Banknote size={20} className="text-Label" />} 
                                onChange={(e) => setSalaryRange([Number(e.target.value.replace("Php ", "")), salaryRange[1]])} 
                                />
                                <Textfield 
                                label="" 
                                type="text" 
                                placeholder="Max Salary" 
                                value={`Php ${salaryRange[1].toString()}`} 
                                icon={<Banknote size={20} className="text-Label" />} 
                                onChange={(e) => setSalaryRange([salaryRange[0], Number(e.target.value.replace("Php ", ""))])} 
                                />
                            </div>
                        </div>


                            <div className="pb-4 m-2">
                                <label className="font-medium text-sm text-Label">Application Period<span className="text-Required">*</span></label>
                                <div className="flex flex-row justify-start content-start ml-2 mt-1">
                                <div className="pb-4">
                                    <CalendarComponent label={<p>Start Date<span className="text-Required">*</span></p>} placeholder="Pick a start date" onDateChange={(date) => setStartDate(date)} isStartDate={true} value={startDate} />
                                </div>
                                <div className="content-center text-2x1 pl-4 pr-4">To</div>
                                    <CalendarComponent label={<p>End Date<span className="text-Required">*</span></p>} placeholder="Pick an end date" onDateChange={(date) => setEndDate(date)} startDate={startDate} value={endDate} />
                                </div>
                            </div>

                            <div className="pb-4 m-2">
                                <label htmlFor="paragraph" className="text-font-medium text-sm text-Label">Job Description<span className="text-Required">*</span></label>
                                <textarea id="paragraph" className="w-full min-h-20 p-3 border border-[#A9C1DE] rounded-3xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" placeholder="Provide a job description" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                            </div>

                            <div className="m-2">
                                <label className="font-medium text-sm text-Label">Qualifications<span className="text-Required">*</span></label>
                                {qualifications.map((qualification, index) => (
                                <div key={index} className="relative w-full">
                                    <Textfield label="" type="text" placeholder="Specify job qualification" value={qualification} icon={<Layers size={20} className="text-Label" />} onChange={(e) => updateQualification(index, e.target.value)} />
                                    {index > 0 && (
                                    <Minus size={20} className="absolute right-3 inset-y-0 my-auto text-Label cursor-pointer" onClick={() => removeQualification(index)} />
                                    )}
                                </div>
                                ))}
                                <div>
                                <Button onClick={addQualification} variant="minor" className="text-Primary bg-black">+ ADD JOB QUALIFICATIONS</Button>
                                </div>
                            </div>
                            </div>


                        <Button onClick={handleSave} variant="major">
                            {isEdit ? "Save" : "Post"}
                        </Button>
                        <div 
                        className="text-center font-normal text-lg py-4 cursor-pointer"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </div>
                    </div>	

                </div>
        </div>
    </div>
    );
};

export default AdminJobPostingFormPage;
