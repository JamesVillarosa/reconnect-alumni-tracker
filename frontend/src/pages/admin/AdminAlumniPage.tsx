import { useEffect, useState } from "react";
import AdminTable from "../../components/admin_components/AdminTable";
import { AlumniProps } from "../../types/adminView";
import { useNavigate } from "react-router-dom";
import { StatisticsBox } from "../../components/admin_components/AdminDashboardComponents";
import { Download, Funnel, Search, Triangle } from "lucide-react";
import AdminNavbar from "../../components/admin_components/AdminNavbar";
import axios from "axios";
import ChangeStatusModal, { StringToFunctionMap } from "../../components/admin_components/ChangeStatusModal";
import { toastPromise } from "../utils/ToastFxn";

const AdminAlumniPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [totalAlumniCount, setTotalAlumniCount] = useState<number>(0);
    const [alumni, setAlumni] = useState<AlumniProps[]>([]);
    const [selectedAlumni, setSelectedAlumni] = useState<string[]>([]);
    const navigate = useNavigate();

    // filtering
    const [searchQuery, setSearchQuery] = useState("");

    // data fetching
    const fetchAlumni = async() => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/alumni`, {
                params: {
                    // skip: (currentPage - 1) * 10,
                    limit: 150,
                    // keyword: filters.keyword || undefined,
                    // job_type: filters.job_type || undefined,
                    // min_salary: filters.salary_range[0] > 0 ? filters.salary_range[0] : undefined,
                    // max_salary: filters.salary_range[1] < 250000 ? filters.salary_range[1] : undefined,
                    // status: filters.status ? filters.status : undefined,
                    // location: filters.location || undefined,
                },
                withCredentials: true,
            });

            const fetchedAlumniData = response.data;
            setAlumni(fetchedAlumniData.alumni);
            setTotalAlumniCount(fetchedAlumniData.total);

        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                // If no jobs are found, reset the job list and pagination
                setAlumni([]);
            } else {
                console.error("Failed to fetch alumni", error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAlumni();
    }, []);

    // table columns name
    const tableHead = [
        { key: 'name', label: 'Alumni Name', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'company_name', label: 'Company', sortable: true },
        { key: 'location', label: 'Location', sortable: true },
    ];

    const handleEditAlumni = (alumni: AlumniProps) => {
        setAlumnusInModal(alumni);
        (document.getElementById('change-alumnus-status-modal') as HTMLDialogElement)?.showModal();
        // console.log("edit")
        // console.log(alumni);
    };

    const handleDeleteAlumni = (alumni: AlumniProps) => {
        console.log("delete")
    };

    const handleViewAlumni = (alumni: AlumniProps) => {
        navigate(`/admin/alumni/view`, { state: { alumni } }); // uncommented just to test alumni details page
    };

    const handleChangeAlumnusVerification = async(alumni: AlumniProps, status: string) => {
        try {
            await toastPromise(
                axios.patch(`${import.meta.env.VITE_API_URL}/admin/alumni/${alumni._id}/change_verification_status`, {
                    new_verification_status: status
                }, {
                    method: "PATCH",
                    withCredentials: true
                }),
                {
                loading: {
                    title: `${status==="Verified" ? 'Approving' : 'Disapproving'} alumnus...`,
                    description: "Alumnus is being approved.",
                    type: "info",
                },
                success: {
                    title: "Success!",
                    description: `Alumnus status has been successfully set to ${status==="Verified" ? 'Verified' : 'Unverified'}.`,
                    type: "success",
                },
                error: {
                    title: "Failed!",
                    description: "There was an error changing the verification status of this alumnus.",
                    type: "error",
                },
                }
            ).then(async() => {
                setAlumni(prev =>
                    prev.map(alum =>
                        alum._id === alumni._id
                        ? { ...alum, verification_status: 'Verified' } // update specific field
                        : alum
                    )
                );
                // setSelectedAlumni(prev => prev.filter(donationId => donationId !== id));
            
                // Refresh the donation list and statistics after deletion
            });
        } catch (error) {
            // console.error("Failed to verify alumni", error);
        } finally {
            setAlumnusInModal(null);
        }
    }

    const handleChangeAlumnusFlagged = async(alumni: AlumniProps, flagged: boolean) => {
        try {
            await toastPromise(
                axios.patch(`${import.meta.env.VITE_API_URL}/admin/alumni/${alumni._id}/flag_status`, {
                    is_flagged: flagged
                }, {
                    method: "PATCH",
                    withCredentials: true
                }),
                {
                loading: {
                    title: `${flagged ? 'Flagging alumnus...' : 'Removing flag from alumnus...'}`,
                    description: `Alumnus is being ${flagged ? 'flagged' : 'unflagged'}.`,
                    type: "info",
                },
                success: {
                    title: "Success!",
                    description: `Alumnus status has been successfully ${flagged ? 'flagged' : 'unflagged'}.`,
                    type: "success",
                },
                error: {
                    title: "Failed!",
                    description: "There was an error changing the flag status of this alumnus.",
                    type: "error",
                },
                }
            ).then(async() => {
                setAlumni(prev =>
                    prev.map(alum =>
                        alum._id === alumni._id
                        ? { ...alum, is_flagged: true } // update specific field
                        : alum
                    )
                );
                // setSelectedAlumni(prev => prev.filter(donationId => donationId !== id));
            
                // Refresh the donation list and statistics after deletion
            });
        } catch (error) {
            // console.error("Failed to verify alumni", error);
        } finally {
            setAlumnusInModal(null);
        }
    }

    const [alumnusInModal, setAlumnusInModal] = useState<AlumniProps | null>(null);
    
    return(
        <div className="flex w-[100vw]">
            <AdminNavbar />
            <div className="flex w-full justify-center items-center">
                {/* limit width to 1280px */}
                <div className="w-[80vw] max-w-[1280px] h-full bg-white p-10">
                    <div className="flex flex-col gap-5">
                        {/* job page statistics */}
                        <div className="flex flex gap-5">
                            <StatisticsBox label="Alumni by Batch" className="flex-3/8 flex flex-col gap-5">
                                <></>
                            </StatisticsBox>
                            <StatisticsBox label="Alumni Network Growth" className="flex-5/8">
                                <></>
                            </StatisticsBox>
                        </div>

                        {/* job listings section */}
                        <div className="h-full w-full flex flex-col justify-center items-start">
                            <div className='flex flex-col align-center py-5 justify-center items-center w-full mx-auto'>

                                {/* list header section */}
                                <div className='flex flex-col sm:flex-row items-center sm:justify-between w-full sm:h-10 gap-2 sm:gap-0'>
                                    <div className="flex gap-5 items-center">
                                        <h1 className="text-Primary text-3xl font-bold">Alumni</h1>
                                        <h1 className="text-[#78A9E4] text-sm font-medium">{totalAlumniCount}</h1>
                                    </div>
                                    {/* list filters section */}
                                    <div className="flex flex-row justify-center sm:justify-end gap-2 sm:gap-4 w-1/2 items-center">
                                    
                                    
                                        <label className="input rounded-xl border border-[#82A9D0] text-[#82A9D0]">
                                            <Search />
                                            <input 
                                                type="search" 
                                                className="min-w-[100px] placeholder-[#82A9D0]" 
                                                placeholder="Search Keyword" 
                                                value={searchQuery} 
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </label>
                                        <button className="btn btn-ghost text-Primary bg-MidBlue hover:bg-primary hover:text-Tertiary p-1 rounded-lg min-h-[35px] aspect-square">
                                            <Funnel 
                                                size={18}
                                                // onClick={() => (document.getElementById('filter-modal') as HTMLDialogElement)?.showModal()}
                                            />
                                        </button>
                                        {/* filter modal */}
                                        {/* <DonationFilterModal
                                            id="filter-modal"
                                            donationList={donations}
                                            onApplyFilters={handleApplyFilters}
                                        /> */}
                                        {/* export section */}
                                        <div className='relative text-center text-Primary'>
                                            <button className="btn btn-ghost text-Primary bg-MidBlue hover:bg-primary hover:text-Tertiary p-1 rounded-lg min-h-[35px] aspect-square">
                                                <Download 
                                                    // onClick= {() => setIsDropdownVisible((prev) => !prev)}
                                                    size={18}
                                                />
                                            </button>

                                            {/* {isDropdownVisible && (
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 flex bg-white shadow-lg rounded-lg border m-1">
                                                    <button
                                                        onClick={() => handleExportClick('csv')}
                                                        className="px-4 py-1 text-sm hover:bg-primary hover:text-Tertiary hover:rounded-sm"
                                                    >
                                                        CSV
                                                    </button>
                                                    <button
                                                        onClick={() => handleExportClick('json')}
                                                        className="px-4 py-1 text-sm hover:bg-primary hover:text-Tertiary hover:rounded-sm"
                                                    >
                                                        JSON
                                                    </button>
                                                    <button
                                                        onClick={() => handleExportClick('txt')}
                                                        className="px-4 py-1 text-sm hover:bg-primary hover:text-Tertiary hover:rounded-sm"
                                                    >
                                                        TXT
                                                    </button>
                                                </div>
                                            )} */}
                                        </div>
                                        <button
                                            // onClick={handleCreateDonationClick}
                                            className="btn btn-ghost bg-Primary text-white min-w-[120px] p-1 rounded-xl hover:bg-Tertiary hover:text-Primary min-h-[35px]"
                                        >
                                            + New Alumnus
                                        </button>
                                    </div>
                                </div>

                                {/* admin table */}
                                {isLoading ? (
                                    <div className='flex justify-center items-center h-64'>
                                        <span className='loading loading-spinner loading-lg'></span>
                                    </div>
                                ) : (
                                    <>
                                        <AdminTable
                                            tableHead={tableHead}
                                            data={alumni}
                                            type="alumni"
                                            onEdit={handleEditAlumni}
                                            onDelete={handleDeleteAlumni}
                                            onView={handleViewAlumni}
                                            selectedItems={selectedAlumni}
                                            setSelectedItems={setSelectedAlumni}
                                            renderRow={(alumni) => (
                                                <>
                                                    <td className="font-medium">{alumni.first_name} {alumni.last_name}</td>
                                                    <td>
                                                        <span className={`inline-flex items-center px-4 py-1 rounded-4xl text-xs ${
                                                            alumni.verification_status! === 'Verified'
                                                                ? "bg-green-200 text-accent" 
                                                                : "bg-red-200 text-Error"
                                                        }`}>
                                                            <span className={`status rounded-2xl mr-2 ${alumni.verification_status! === 'Verified' ? "status-accent" : "status-error"}`}></span>
                                                            {alumni.verification_status!}
                                                        </span>
                                                    </td>
                                                    <td>{alumni.current_career?.company == "" ? '--' : alumni.current_career?.company}</td>
                                                    <td>{alumni.location ?? '--'}</td>
                                                </>
                                            )}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                        <AlumniChangeStatusModal 
                            modalID="change-alumnus-status-modal" 
                            modalHeader="Change Alumnus Status" 
                            alumnus={alumnusInModal} 
                            changeVerificationStatus={handleChangeAlumnusVerification}
                            changeIsFlagged={handleChangeAlumnusFlagged}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminAlumniPage;



interface AlumniChangeStatusModalProps {
    modalID: string;
    modalHeader: string;
    alumnus: AlumniProps | null;
    changeVerificationStatus: (alumni: AlumniProps, status: string) => void;
    changeIsFlagged: (alumni: AlumniProps, flagged: boolean) => void;
}

const AlumniChangeStatusModal: React.FC<AlumniChangeStatusModalProps> = ({
    modalID,
    modalHeader,
    alumnus,
    changeVerificationStatus,
    changeIsFlagged
}) => {
    const [currentAlumnus, setCurrentAlumnus] = useState<AlumniProps | null>(alumnus);
    const [prevStatus, setPrevStatus] = useState<string>(alumnus?.verification_status ?? "");
    const [prevFlagged, setPrevFlagged] = useState<boolean>(alumnus?.is_flagged ?? false);
    const [status, setStatus] = useState<string>(prevStatus ?? "");
    const [isFlagged, setIsFlagged] = useState<boolean>(prevFlagged ?? false);

    useEffect(() => {
        setCurrentAlumnus(alumnus);
        setPrevStatus(alumnus?.verification_status ?? "");
        setPrevFlagged(alumnus?.is_flagged ?? false);
        setStatus(alumnus?.verification_status ?? 'Unverified');
        setIsFlagged(alumnus?.is_flagged ?? false);
    }, [alumnus]);

    const handleConfirm = () => {
        if (status !== prevStatus){
            changeVerificationStatus(alumnus!, status);
        }
        if (isFlagged !== prevFlagged){
            changeIsFlagged(alumnus!, isFlagged);
        }
    };

    return (
        <dialog id={modalID} className="modal">
            <div className="flex flex-col gap-4 modal-box bg-LightBlue rounded-2xl">
                <form method="dialog" className="relative flex flex-row items-center justify-center text-Primary font-bold text-2xl border-b-2 border-DarkBlue pb-4">
                    <div className="flex flex-col items-center">
                        <h3 className="">{modalHeader}</h3>
                    </div>
                    <button className="absolute right-0 ml-auto btn btn-outline btn-circle hover:bg-Primary hover:text-Tertiary">✕</button>
                </form>

                <div className="flex flex-col text-Primary text-lg font-semibold px-3 pb-4 border-b-2 border-DarkBlue">                   
                    <div className="relative">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className={`
                                w-full text-Primary text-left
                                px-4 py-2 lg:py-3 pr-10
                                border-2 border-Primary
                                rounded-3xl
                                placeholder-[#97A9BE]
                                focus:outline-none focus:ring-1 focus:ring-Secondary focus:border-Secondary
                                transition-colors
                                appearance-none
                            `}
                        >   
                            <option>Verified</option>
                            <option>Unverified</option>
                        </select>
                        <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-[#97A9BE]">
                            <Triangle size={16} className="rotate-180 text-primary fill-current" />
                        </div>
                    </div>
                    <div className="w-full flex justify-between items-center mt-5">
                        <h1>Flagged</h1>
                        <input
                            type="checkbox"
                            checked={isFlagged}
                            onChange={(e) => setIsFlagged(e.target.checked)}
                            className="w-10 h-5 rounded-full bg-gray-300 checked:bg-red-500 transition duration-300 relative appearance-none cursor-pointer before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:bg-white before:rounded-full before:h-4 before:w-4 before:transition before:duration-300 checked:before:translate-x-5"
                        />
                    </div>
                </div>

                <div className="flex flex-row justify-end items-center gap-2">
                    <form method="dialog" className="flex gap-2">
                        <button 
                            className={`btn text-Primary hover:bg-Primary hover:text-white border-2 border-Primary rounded-2xl px-5`} 
                            onClick={()=>{}}
                        >
                            CANCEL
                        </button>
                        <button 
                            className={`btn text-white bg-Primary hover:brightness-120 border-2 border-Primary rounded-2xl px-5 disabled:!bg-LightGray disabled:!border-LightGray disabled:!text-white disabled:!cursor-not-allowed`} 
                            onClick={handleConfirm}
                            disabled={(prevStatus === status) && (prevFlagged === isFlagged)}
                        >
                            CONFIRM
                        </button>
                    </form>
                </div>
            </div>
        </dialog>
    )
}