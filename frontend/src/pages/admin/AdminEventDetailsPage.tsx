import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, BoxIcon, ArrowLeft, Ellipsis } from 'lucide-react';
import Button from '../../components/Button';
import { EventProps } from '../../types/event';
import AdminTable from '../../components/admin_components/AdminTable';
import AdminNavbar from '../../components/admin_components/AdminNavbar';
import axios from 'axios';
import ListHeader from '../../components/admin_components/AdminHeaderSection';
import { RSVP, RSVPStatus, mockRSVPs } from '../../types/rsvpEntry';
import ModalCard from '../../components/ModalCard';
import Dropdown from '../../components/Dropdown';
import RSVPFilterModal from '../../components/admin_components/RSVPFilterModal';
import { AlumniProps } from '../../types/adminView';
import { TabType } from './AdminAlumniDetailsPage';
import { showToast } from '../../components/utils/ToastFxn';

const AdminEventDetailsPage: React.FC = () => {
    const { state } = useLocation();
    const { event } = state as { event: EventProps };
    const navigate = useNavigate();
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [rsvpList, setRsvpList] = useState<RSVP[]>(mockRSVPs);
    const [isLoadingRsvp, setIsLoadingRsvp] = useState(false);
    const [eventData, setEventData] = useState<EventProps | null>(null);
    const [totalRSVP, setTotalRSVP] = useState<number>(mockRSVPs.length);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentRsvp, setCurrentRsvp] = useState<RSVP | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<RSVPStatus>('Going');
    const [filteredRsvps, setFilteredRsvps] = useState<RSVP[]>(mockRSVPs);
    const [statusFilter, setStatusFilter] = useState<RSVPStatus | ''>('');
    const [isEllipsisOpen, setIsEllipsisOpen] = useState(false);
    const ellipsisRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let results = rsvpList;
        
        // apply status filter
        if (statusFilter) {
            results = results.filter(rsvp => rsvp.status === statusFilter);
        }
        
        // apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            results = results.filter(rsvp => 
                rsvp.name.toLowerCase().includes(query) ||
                (rsvp.email && rsvp.email.toLowerCase().includes(query)) ||
                rsvp.status.toLowerCase().includes(query) ||
                new Date(rsvp.date).toLocaleString().toLowerCase().includes(query)
            );
        }
        
        setFilteredRsvps(results);
        setTotalRSVP(results.length);
    }, [rsvpList, statusFilter, searchQuery]);

    useEffect(() => {
        if (state?.event) {
            setEventData(state.event);
            // // uncomment for real data
            // fetchRsvpList(state.event._id);
        } else {
            const eventId = window.location.pathname.split('/').pop();
            if (eventId) {
                fetchEventData(eventId);
                fetchRsvpList(eventId);
            }
        }
    }, [state, statusFilter, searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ellipsisRef.current && !ellipsisRef.current.contains(event.target as Node)) {
                setIsEllipsisOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchEventData = async(eventId: string) => {
        try {
            const response = await axios.get<EventProps>(
                `${import.meta.env.VITE_API_URL}/events/${eventId}`,
                { withCredentials: true }
            );
            setEventData(response.data);
        } catch (error) {
            console.error("Error fetching event data:", error);
        }
    }

    // // uncomment for real data
    // const fetchRsvpList = async (eventId: string) => {
    //     setIsLoadingRsvp(true);
    //     console.log(eventId);
    //     try {
    //         const response = await axios.get<RSVP[]>(
    //             `${import.meta.env.VITE_API_URL}/rsvps/event/${eventId}`,
    //             { withCredentials: true }
    //         );
    //         setRsvpList(Array.isArray(response.data) ? response.data : []);
    //         setTotalRSVP(response.data.length);
    //     } catch (error) {
    //         console.error("Error fetching RSVP list:", error);
    //         setRsvpList([]);
    //         setTotalRSVP(0);
    //     } finally {
    //         setIsLoadingRsvp(false);
    //     }
    // };

    const fetchRsvpList = async (eventId: string) => {
        setIsLoadingRsvp(true);
        
        try {
            // remove when backend is ready
            setRsvpList(mockRSVPs);
            setTotalRSVP(mockRSVPs.length);
            
            /* uncomment for real data
            const response = await axios.get<RSVP[]>(
                `${import.meta.env.VITE_API_URL}/rsvps/event/${eventId}`,
                { 
                    withCredentials: true,
                    params: {
                        status: statusFilter || undefined,
                        keyword: searchQuery || undefined
                    }
                }
            );
            setRsvpList(Array.isArray(response.data) ? response.data : []);
            setTotalRSVP(response.data.length);
            */
        } catch (error) {
            console.error("Error fetching RSVP list:", error);
            setRsvpList([]);
            setTotalRSVP(0);
        } finally {
            setIsLoadingRsvp(false);
        }
    };

    const handleEditRSVP = async (rsvp: RSVP) => {
        setCurrentRsvp(rsvp);
        setSelectedStatus(rsvp.status);
        (document.getElementById('rsvp_status_modal') as HTMLDialogElement)?.showModal();
    };
    
    const handleViewRSVP = async (rsvp: RSVP, initialTab: TabType = 'rsvped_events') => {
        try {
            const response = await axios.get<AlumniProps>(
                `${import.meta.env.VITE_API_URL}/admin/alumni/${rsvp.user_id}`,
                { withCredentials: true }
            );
            
            navigate(`/admin/alumni/view`, { state: { alumni: response.data, initialTab } });
        } catch (error) {
            console.error("Failed to fetch alumni data:", error);
        }
    };

    const updateRsvpStatus = async () => {
        if (!currentRsvp) return;

        setRsvpList(prev => prev.map(rsvp => 
            rsvp._id === currentRsvp._id ? {...rsvp, status: selectedStatus} : rsvp
        ));
        
        (document.getElementById('rsvp_status_modal') as HTMLDialogElement)?.close();
        // // uncomment for real data
        // try {
        //     await axios.put(
        //         `${import.meta.env.VITE_API_URL}/rsvps/${currentRsvp._id}`,
        //         { status: selectedStatus },
        //         { withCredentials: true }
        //     );
        //     fetchRsvpList(eventData?._id || '');
        //     (document.getElementById('rsvp_status_modal') as HTMLDialogElement)?.close();
        // } catch (error) {
        //     console.error("Error updating RSVP status:", error);
        // }
    };

    const handleApplyFilters = (filters: { status?: RSVPStatus }) => {
        setStatusFilter(filters.status || '');
    };



    const rsvpTableHead = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'date', label: 'RSVP Date', sortable: true }
    ];

    const renderRSVPRow = (rsvp: RSVP) => (
        <>
            <td className="px-4 py-2">{rsvp.name || 'Unknown User'}</td>
            <td className="px-4 py-2">
                <span className={`px-2 py-1 rounded-full text-sm ${
                    rsvp.status === 'Going' ? 'bg-green-100 text-green-800' :
                    rsvp.status === 'Done' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                }`}>
                    {rsvp.status}
                </span>
            </td>
            <td className="px-4 py-2">
                {new Date(rsvp.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </td>
        </>
    );

    if (!eventData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-Primary mb-4">Event Not Found</h2>
                    <Button 
                        onClick={() => navigate('/admin/events')}
                        variant="major"
                    >
                        Back to Events
                    </Button>
                </div>
            </div>
        );
    }

    

    const handleEllipsis = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEllipsisOpen(!isEllipsisOpen);
    };

    const handleEditEvent = () => {
            navigate('/admin/events/form', {state: { eventId: eventData._id, eventDetails: eventData, isEdit: true }});
        };
        
    const handleCloseEvent = async () => {
        try {
            console.log("close: ", eventData._id);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventData._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ approval_status: 'Closed' }),
                credentials: 'include'
            });
            
            if (response.ok) {
                fetchEventData(eventData._id);
                showToast("success", "Event Successfully Closed", "Successfully closed the event.");
            } else {
                console.error('Failed to close event');
                showToast("error", "Error Closing Event", "An error occurred while closing the event.");
            }
        } catch (error) {
            console.error('Error closing event:', error);
            showToast("error", "Error Closing Event", "An error occurred while closing the event.");
        } finally {
            setIsEllipsisOpen(false);
        }
    };
        
    const handleArchiveEvent = async () => {
        try {
            // const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/events/${eventData._id}/archive`, {
            //     method: 'PATCH',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     credentials: 'include'
            // });
            const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventData._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ approval_status: 'Archived' }),
                credentials: 'include'
            });
            
            if (response.ok) {
                fetchEventData(eventData._id);
                showToast("success", "Event Successfully Archived", "Successfully archived the event.");
            } else {
                console.error('Failed to archive initiative');
                showToast("error", "Error Archiving Event", "An error occurred while archiving the event.");
            }
        } catch (error) {
            console.error('Error archiving initiative:', error);
            showToast("error", "Error Archiving Event", "An error occurred while archiving the event.");
        } finally {
            setIsEllipsisOpen(false);
        }
    };

    const handleApproveEvent = async () => {
        try {
            console.log("close: ", eventData._id);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventData._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ approval_status: 'Approved' }),
                credentials: 'include'
            });
            
            if (response.ok) {
                fetchEventData(eventData._id);
                showToast("success", "Event Successfully Approved", "Successfully approved the event.");
            } else {
                console.error('Failed to approve event');
                showToast("error", "Error Approving Event", "An error occurred while approving the event.");
            }
        } catch (error) {
            console.error('Error approving event:', error);
            showToast("error", "Error Approving Event", "An error occurred while approving the event.");
        } finally {
            setIsEllipsisOpen(false);
        }
    };

    const handleRejectEvent = async () => {
        try {
            console.log("close: ", eventData._id);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventData._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ approval_status: 'Rejected' }),
                credentials: 'include'
            });
            
            if (response.ok) {
                fetchEventData(eventData._id);
                showToast("success", "Event Successfully Rejected", "Successfully rejected the event.");
            } else {
                console.error('Failed to reject event');
                showToast("error", "Error Rejecting Event", "An error occurred while rejecting the event.");
            }
        } catch (error) {
            console.error('Error rejecting event:', error);
            showToast("error", "Error Rejecting Event", "An error occurred while rejecting the event.");
        } finally {
            setIsEllipsisOpen(false);
        }
    };

        const handleFlagEvent = async () => {
        try {
            console.log("close: ", eventData._id);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${eventData._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ approval_status: 'Flagged' }),
                credentials: 'include'
            });
            
            if (response.ok) {
                fetchEventData(eventData._id);
                showToast("success", "Event Successfully Flagged", "Successfully flagged the event.");
            } else {
                console.error('Failed to flag event');
                showToast("error", "Error Flagging Event", "An error occurred while flagging the event.");
            }
        } catch (error) {
            console.error('Error flagging event:', error);
            showToast("error", "Error Flagging Event", "An error occurred while flagging the event.");
        } finally {
            setIsEllipsisOpen(false);
        }
    };

    return (
        <div className="flex">
            <AdminNavbar />
            <div className="bg-white w-full min-h-screen p-6">
                {/* Event title and header buttons */}
                <div className="flex w-full justify-start gap-2 items-center mb-8 text-center">
                    <button 
                        onClick={() => navigate(-1)}
                        className="text-gray-500 hover:text-gray-700 p-2 text-Primary"
                    >
                        <ArrowLeft size={24} className="text-Primary"/>
                    </button>
                    <h1 className="text-4xl font-bold text-Primary">{eventData.title}</h1>
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
                                            handleEditEvent();
                                            setIsEllipsisOpen(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm rounded-2xl hover:bg-Primary hover:text-white"
                                    >
                                        Edit Event
                                    </button>
                                    <button
                                        disabled={eventData.approval_status=='Approved'}
                                        onClick={() => {
                                            handleApproveEvent();
                                            setIsEllipsisOpen(false);
                                        }}
                                        className={`block w-full text-left px-4 py-2 text-sm rounded-2xl ${eventData.approval_status=='Approved' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-Primary hover:text-white'}`}
                                    >
                                        Approve Event
                                    </button>
                                    <button
                                        disabled={eventData.approval_status=='Rejected'}
                                        onClick={() => {
                                            handleRejectEvent();
                                            setIsEllipsisOpen(false);
                                        }}
                                        className={`block w-full text-left px-4 py-2 text-sm rounded-2xl ${eventData.approval_status=='Rejected' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-Primary hover:text-white'}`}
                                    >
                                        Reject Event
                                    </button>
                                    <button
                                        disabled={eventData.approval_status=='Flagged'}
                                        onClick={() => {
                                            handleFlagEvent();
                                            setIsEllipsisOpen(false);
                                        }}
                                        className={`block w-full text-left px-4 py-2 text-sm rounded-2xl ${eventData.approval_status=='Flagged' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-Primary hover:text-white'}`}
                                    >
                                        Flag Event
                                    </button>
                                    <button
                                        disabled={eventData.approval_status=='Closed'}
                                        onClick={() => {
                                            handleCloseEvent();
                                            setIsEllipsisOpen(false);
                                        }}
                                        className={`block w-full text-left px-4 py-2 text-sm rounded-2xl ${eventData.approval_status=='Closed' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-Primary hover:text-white'}`}
                                    >
                                        Close Job
                                    </button>
                                    <button
                                        disabled={eventData.approval_status=='Archived'}
                                        onClick={() => {
                                            handleArchiveEvent();
                                            setIsEllipsisOpen(false);
                                        }}
                                        className={`block w-full text-left px-4 py-2 text-sm rounded-2xl ${eventData.approval_status=='Archived' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-Primary hover:text-white'}`}
                                    >
                                        Archive Job
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className='flex flex-col'>
                    {/* Event content */}
                    <div className="flex flex-row max-w-full mx-auto gap-4">
                        {/* Event image */}
                        {eventData.eventImageURL && (
                            <div className="w-fit mb-8 rounded-xl overflow-hidden">
                                <img 
                                    src={eventData.eventImageURL} 
                                    alt={eventData.title} 
                                    className="w-full max-h-96 object-cover"
                                />
                            </div>
                        )}

                        <div className='flex flex-col w-full'>
                            <div className="mb-8">
                                <p className="text-Primary whitespace-pre-line">{eventData.description}</p>
                            </div>

                            {/* Event details */}
                            <div className="flex flex-col space-y-4 mb-8 text-Primary">
                                <div className='flex flex-row gap-10'>
                                    {/* Organizers */}
                                    <div className="flex items-start">
                                        <BoxIcon className="text-Primary mr-1 mt-1 flex-shrink-0" size={20} />
                                        <div>
                                            <h3 className="font-semibold text-lg">Organized by</h3>
                                            <p className='font-medium'>{eventData.organizers.map(org => org.name).join(', ')}</p>
                                        </div>
                                    </div>
                                    {/* Date */}
                                    <div className="flex items-start">
                                        <Calendar className="text-Primary mr-1 mt-1 flex-shrink-0" size={20} />
                                        <div>
                                            <h3 className="font-semibold text-lg">Date & Time</h3>
                                            <p className='font-medium'>
                                                {new Date(eventData.event_date).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-start">
                                        <MapPin className="text-Primary mr-1 mt-1 flex-shrink-0" size={20} />
                                        <div>
                                            <h3 className="font-semibold text-lg">Location</h3>
                                            <p className='font-medium'>{eventData.location}</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Status */}
                                <div className="flex items-start">
                                    <BoxIcon className="text-Primary mr-1 mt-1 flex-shrink-0" size={20} />
                                    <div>
                                        <h3 className="font-semibold text-lg">Status</h3>
                                        <p className={`${
                                            eventData.approval_status === 'Pending' ? "text-Warning" :
                                            eventData.approval_status === 'Approved' ? "text-Accent" :
                                            eventData.approval_status === 'Rejected' ? "text-Error" :
                                            eventData.approval_status === 'Flagged' ? "text-Warning" :
                                            eventData.approval_status === 'Archived' ? "text-gray-400" :
                                            eventData.approval_status === 'Closed' ? "text-Error" :
                                            "text-gray-700"
                                        }`}>
                                            {eventData.approval_status}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Charts
                    <div className='flex flex-row mx-auto'>
                        <ChartsOverview chartData={chartData} />
                        <ChartsOverview chartData={chartData} />
                    </div> */}
                    
                    {/* RSVP Table */}
                    <div>
                        <ListHeader
                            title="RSVPs"
                            totalCount={totalRSVP}
                            data={rsvpList}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            onApplyFilters={handleApplyFilters}
                            FilterModalComponent={RSVPFilterModal}
                        />
                        
                        {isLoadingRsvp ? (
                            <div className="flex justify-center items-center h-32">
                                <span className="loading loading-spinner loading-lg"></span>
                            </div>
                        ) : (
                            <AdminTable 
                                tableHead={rsvpTableHead}
                                data={rsvpList}
                                type="RSVPs"
                                onEdit={handleEditRSVP}
                                canDelete={false}
                                onDelete={() => {}}
                                onView={handleViewRSVP}
                                renderRow={renderRSVPRow}
                                selectedItems={selectedItems}
                                setSelectedItems={setSelectedItems}
                                defaultSortColumn='date'
                            />
                        )}
                    </div>
                    {/* RSVP Status Modal */}
                    <ModalCard
                        id="rsvp_status_modal"
                        className='text-base'
                        title="Update RSVP Status"
                        primaryButton={{
                            label: "Update Status",
                            onClick: updateRsvpStatus
                        }}
                        secondaryButton={{
                            label: "Cancel",
                            onClick: () => (document.getElementById('rsvp_status_modal') as HTMLDialogElement)?.close()
                        }}
                    >
                        <Dropdown
                            label="Select RSVP Status"
                            value={selectedStatus}
                            options={['Going', 'Cancelled', 'Done']}
                            onChange={(status) => setSelectedStatus(status as RSVPStatus)}
                        />
                    </ModalCard>
                </div>

                
            </div>
        </div>
    );
};

export default AdminEventDetailsPage;