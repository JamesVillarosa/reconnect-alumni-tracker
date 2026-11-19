import React, { useEffect, useState } from 'react';
import AdminTable from '../../components/admin_components/AdminTable';
import { BlankEvent, EventProps } from '../../types/event';
import EventFilterModal from '../../components/admin_components/EventFilterModal';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import AdminNavbar from '../../components/admin_components/AdminNavbar';
import { DashboardLabelAndValue, StatisticsBox } from '../../components/admin_components/AdminDashboardComponents';
import axios from 'axios';
import { EventsTrendLineChart } from '../../components/admin_components/AdminOtherCharts';
import ListHeader from '../../components/admin_components/AdminHeaderSection';
import { toastPromise } from '../utils/ToastFxn';
import DeleteModal from '../../components/admin_components/DeleteModal';

interface FormNavigationState {
    eventId: string;
    eventDetails: EventProps;
    existingEvents: EventProps[];
    newEvent?: EventProps;
    isEdit?: boolean;
}

const AdminEventsPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [events, setEvents] = useState<EventProps[]>([]);
    const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        approval_status: "",
        location: "",
        organizers: "",
        date_from: "",
        date_to: "",
    });
    const location = useLocation();
    const navigate = useNavigate();
    const [eventsTrendData, setEventsTrendData] = useState([]);
    const [openEvents, setOpenEvents] = useState<number>(0);
    const [totalEventsCreated, setTotalEventsCreated] = useState<number>(0);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/events/`, {
                withCredentials: true
            });
            setEvents(response.data);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // fetch on mount
    useEffect(() => {
        fetchEvents();
        fetchEventsTrendData();
        fetchEventsStatistics();
    }, []);

    const [itemIDToDelete, setItemIDToDelete] = useState<string>("");
    const [itemNameToDelete, setItemNameToDelete] = useState<string>("");

    // event delete button handler
    const handleDeleteEventClick = async(event: EventProps) => {
        setItemIDToDelete(event._id);
        setItemNameToDelete(event.title);
        (document.getElementById('delete-event-modal') as HTMLDialogElement)?.showModal();
    };

    // event deletion handler
    const handleDeleteEvent = async (id: string) => {
        try {
            setIsLoading(true);
            await toastPromise(
                axios.delete(`${import.meta.env.VITE_API_URL}/events/${id}`, {
                    method: "DELETE",
                    withCredentials: true
                }),
                {
                loading: {
                    title: "Deleting event...",
                    description: "Event is being deleted.",
                    type: "info",
                },
                success: {
                    title: "Success!",
                    description: "Event was successfully deleted.",
                    type: "success",
                },
                error: {
                    title: "Failed!",
                    description: "There was an error deleting this event.",
                    type: "error",
                },
                }
            ).then(async() => {
                setEvents(prev => prev.filter(e => e._id !== id));
                setSelectedEvents(prev => prev.filter(eventId => eventId !== id));
                
                // Refresh the events list and statistics after deletion
                await fetchEvents();
                await fetchEventsTrendData();
                await fetchEventsStatistics();
            });
        } catch (error) {
            // console.error("Failed to delete job", error);
        } finally {
            setIsLoading(false);
            setItemIDToDelete("");
            setItemNameToDelete("");
        }
    };

    // apply filters from modal
    const handleApplyFilters = (newFilters: {
        approval_status: string;
        location: string;
        organizers: string;
        date_from: string;
        date_to: string;
    }) => {
        setFilters(newFilters);
    };
    

    // table columns head
    const tableHead = [
        { key: 'title', label: 'Event Title', sortable: true },
        { key: 'approval_status', label: 'Status', sortable: true },
        { key: 'organizers', label: 'Organizers', sortable: true },
        { key: 'location', label: 'Location', sortable: true },
        { key: 'event_date', label: 'Date', sortable: true },
    ];

    // event create handler
    const handleCreateEventClick = () => {
        navigate('form', {state: { eventId: "", eventDetails: BlankEvent, existingEvents: events } as FormNavigationState});
    };
    
    // event edit handler
    const editEvent = (event: EventProps) => {
        navigate('form', {state: { eventId: event._id, eventDetails: event, existingEvents: events } as FormNavigationState});
    };

    useEffect(() => {
        if (location.state?.newEvent) {
            const { newEvent, isEdit } = location.state;
            if (isEdit) {
                setEvents(prev => prev.map(event => 
                    event._id === newEvent._id ? newEvent : event
                ));
                
                axios.put(`${import.meta.env.VITE_API_URL}/events/${newEvent._id}`, newEvent, {
                    withCredentials: true
                }).catch(error => {
                    console.error("Failed to update event", error);
                    fetchEvents();
                });
            } else {
                axios.post(`${import.meta.env.VITE_API_URL}/events/`, newEvent, {
                    withCredentials: true
                }).then(response => {
                    setEvents(prev => [response.data, ...prev]);
                }).catch(error => {
                    console.error("Failed to create event", error);
                });
            }
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const viewEventDetails = (event: EventProps) => {
        navigate(`/admin/events/view`, { state: { event } });
    };

    // fetch trend data for statistics
    const fetchEventsTrendData = async() => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/events/months`, {
                method: "GET",
                withCredentials: true,
            });
            const fetchedEventsTrendData = response.data;
            setEventsTrendData(fetchedEventsTrendData);
            // console.log("Events trend data received:", fetchedEventsTrendData);

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

    // fetch statistics data
    const fetchEventsStatistics = async() => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/events/counts`, {
                method: "GET",
                withCredentials: true,
            });
            const fetchedEventsStatisticsData = response.data;
            setOpenEvents(fetchedEventsStatisticsData.approved_count);
            setTotalEventsCreated(fetchedEventsStatisticsData.total_count);
            // console.log("Events statistics data received:", fetchedEventsStatisticsData);

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



    return (
        <div className="flex w-[100vw]">
            <AdminNavbar />
            <div className="flex w-full justify-center items-center">
                {/* limit width to 1280px */}
                <div className="w-[80vw] max-w-[1280px] h-full bg-white p-10">
                    <div className="flex flex-col gap-5">
                        {/* stats overview section */}
                        <div className='flex flex-row w-full gap-2'>
                            <StatisticsBox label="Event Tally" className="flex flex-col gap-5">
                                <DashboardLabelAndValue label="Open" value={openEvents}/>
                                <DashboardLabelAndValue label="Total Events Created" value={totalEventsCreated}/>
                            </StatisticsBox>
                            <StatisticsBox label="Events Creation Trend">
                                <EventsTrendLineChart eventsTrendData={eventsTrendData} />
                            </StatisticsBox>
                            {/* <StatsOverview groups={eventStats} />
                            <ChartsOverview chartData={chartData} /> */}
                        </div>
                        {/* event listings section */}
                        <div className="h-full w-full flex flex-col justify-center items-start">
                            <div className='flex flex-col align-center py-5 justify-center items-center w-full mx-auto'>

                                {/* list header section */}
                                <ListHeader
                                    title="Events"
                                    totalCount={totalEventsCreated}
                                    data={events}
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    onApplyFilters={handleApplyFilters}
                                    onCreate={handleCreateEventClick}
                                    FilterModalComponent={EventFilterModal}
                                />

                                {/* admin table */}
                                <AdminTable
                                    tableHead={tableHead}
                                    data={events}
                                    type="events"
                                    onEdit={editEvent}
                                    onDelete={handleDeleteEventClick}
                                    onView={viewEventDetails}
                                    selectedItems={selectedEvents}
                                    setSelectedItems={setSelectedEvents}
                                    defaultSortColumn='event_date'
                                    renderRow={(event) => (
                                        <>
                                            <td className="font-medium">{event.title}</td>
                                            <td>
                                                <span className={`inline-flex items-center px-4 py-1 rounded-4xl text-sm ${
                                                    event.approval_status === 'Pending' ? "bg-yellow-200 text-Warning" : 
                                                    event.approval_status === 'Approved' ? "bg-green-200 text-Accent" : 
                                                    event.approval_status === 'Rejected' ? "bg-red-200 text-Error" : 
                                                    event.approval_status === 'Flagged' ? "bg-yellow-200 text-yellow-700" : 
                                                    event.approval_status === 'Archived' ? "bg-LightGray text-Gray" : 
                                                    event.approval_status === 'Closed' ? "bg-LightGray text-Error" : 
                                                    "bg-gray-200 text-gray-700"
                                                }`}>
                                                    <span className={`status rounded-2xl mr-2 ${
                                                        event.approval_status === 'Pending' ? "status-warning" : 
                                                        event.approval_status === 'Approved' ? "status-accent" : 
                                                        event.approval_status === 'Rejected' ? "status-error" : 
                                                        event.approval_status === 'Flagged' ? "status-error" : 
                                                        event.approval_status === 'Archived' ? "status-neutral" : 
                                                        event.approval_status === 'Closed' ? "status-neutral" : 
                                                    "bg-gray-200 text-gray-700"
                                                    }`}></span>
                                                    {event.approval_status}
                                                </span>
                                            </td>
                                            <td>{event.organizers.map(org => org.name).join(', ')}</td>
                                            <td>{event.location}</td>
                                            <td>
                                                {new Date(event.event_date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                        </>
                                    )}
                                />
                            </div>
                        </div>
                        <DeleteModal modalID='delete-event-modal' modalHeader="Delete Event" itemType="event" id={itemIDToDelete} itemName={itemNameToDelete} deleteFunction={handleDeleteEvent} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEventsPage;