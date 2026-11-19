import React, { useState, useRef } from "react";
import Textfield from "../../components/Textfield";
import Button from "../../components/Button";
import UserNavbar from "../../components/UserNavbar";
import CalendarComponent from "../../components/admin_components/AdminCalendarButton";
import { useLocation, useNavigate } from "react-router-dom";
import { EventProps } from "../../types/event";
import { Compass, BookOpen, Users, Image as Minus, Mail, Upload, CalendarMinus2 } from "lucide-react";

interface AdminEventFormPageProps {
    event?: EventProps;
};

const AdminEventFormPage: React.FC<AdminEventFormPageProps> = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { eventId, eventDetails, existingEvents } = state || {};
    const fileInputRef = useRef<HTMLInputElement>(null);

    // to store form data
    const [title, setTitle] = useState<string>(eventDetails?.title || "");
    const [description, setDescription] = useState<string>(eventDetails?.description || "");
    const [location, setLocation] = useState<string>(eventDetails?.location || "");
    const [eventDate, setEventDate] = useState<Date | null>(eventDetails?.event_date ? new Date(eventDetails.event_date) : null);
    const [organizers, setOrganizers] = useState<{name: string, email: string}[]>(
        eventDetails?.organizers || [{name: "", email: ""}]
    );
    const [previewImage, setPreviewImage] = useState<string>(eventDetails?.eventImageURL || "");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // image upload handler
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // generate new ID when creating event based on latest event
    const generateEventId = (): string => {
        if (eventId) return eventId;
        if (!existingEvents || existingEvents.length === 0) return "1";
        const maxId = Math.max(...existingEvents.map((event: EventProps) => {
            const idNum = parseInt(event._id.replace('event', ''), 10);
            return isNaN(idNum) ? 0 : idNum;
        }));
        return `event${maxId + 1}`;
    };

    // organizer functions
    const addOrganizer = () => {
        setOrganizers([...organizers, {name: "", email: ""}]);
    };
    
    const removeOrganizer = (index: number) => {
        const updatedOrganizers = organizers.filter((_, i) => i !== index);
        setOrganizers(updatedOrganizers);
    };
    
    const updateOrganizerName = (index: number, value: string) => {
        const updatedOrganizers = [...organizers];
        updatedOrganizers[index].name = value;
        setOrganizers(updatedOrganizers);
    };

    const updateOrganizerEmail = (index: number, value: string) => {
        const updatedOrganizers = [...organizers];
        updatedOrganizers[index].email = value;
        setOrganizers(updatedOrganizers);
    };

    const handleDateChange = (date: Date | null) => {
        setEventDate(date);
    };

    // form submission handler
    const handleForm = async () => {
        const imageUrl = selectedFile ? URL.createObjectURL(selectedFile) : 
                         previewImage || eventDetails?.eventImageURL || "";

        const newEvent: EventProps = {
            _id: generateEventId(),
            created_at: eventDetails?.created_at || new Date(),
            updated_at: new Date(),
            created_by: eventDetails?.created_by || "admin",
            title: title,
            description: description,
            event_date: eventDate?.toISOString() || new Date().toISOString(),
            location: location,
            approval_status: eventDetails?.approval_status || "Approved",
            eventImageURL: imageUrl,
            organizers: organizers.filter(org => org.name && org.email),
            rsvp_count: eventDetails?.rsvp_count || 0
        };

        navigate('/admin/events', {
            state: {
                newEvent: newEvent,
                isEdit: !!eventId
            } 
        });
    };

    return (
        <div className="flex flex-col items-center justify-between min-h-screen bg-white">
            <div className="w-full text-Primary bg-base-100 px-5 py-2 mb-16 rounded-2xl max-w-2xl md:max-w-3xl lg:max-w-4xl">
                <div className="flex flex-col py-8 gap-2">
                    <h1 className="font-bold text-3xl">{eventDetails._id ? "Edit Event" : "Create New Event"}</h1>
                    <p className="text-sm">Fill out the form below to create a new event for alumni and students.</p>
                </div>
                
                <div className="flex flex-col pb-8">
                    <h4 className="text-lg font-bold">Event Details</h4>
                    
                    {/* event image upload */}
                    <div className="mb-4">
                        <label className="font-medium text-sm text-Label">Event Image</label>
                        <div className="flex items-center gap-4 mt-2">
                            {(previewImage || eventDetails?.eventImageURL) && (
                                <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                                    <img 
                                        src={previewImage || eventDetails?.eventImageURL} 
                                        alt="Event preview" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            <Button 
                                onClick={triggerFileInput}
                                variant="minor"
                                className="flex items-center gap-2 text-Primary bg-black"
                            >
                                <Upload size={16} />
                                {(previewImage || eventDetails?.eventImageURL) ? "Change Image" : "Upload Image"}
                            </Button>
                        </div>
                    </div>
                    
                    <div className="w-full mt-4">
                        <label className="font-medium text-sm text-Label">Event Title*</label>
                        <Textfield
                            label=""
                            type="text"
                            placeholder="Event Title"
                            value={title}
                            icon={<BookOpen size={20} className="text-Label" />}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    
                    <div className="w-full mt-4">
                        <label className="font-medium text-sm text-Label">Location*</label>
                        <Textfield
                            label=""
                            type="text"
                            placeholder="Event Location"
                            value={location}
                            icon={<Compass size={20} className="text-Label" />}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                    
                    {/* Date Range Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CalendarComponent 
                            label="Event Date"
                            onDateChange={handleDateChange}
                            value={eventDate}
                            Icon={<CalendarMinus2 size={18} />}
                        />
                    </div>
                    
                    <div className="pb-4 mt-4">
                        <label htmlFor="description" className="font-medium text-sm text-Label">Event Description*</label>
                        <textarea 
                            id="description" 
                            className="w-full min-h-32 p-3 border border-[#A9C1DE] rounded-3xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                            placeholder="Describe the event in detail" 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>
                    
                    <div className="mt-4">
                        <label className="font-medium text-sm text-Label">Organizers</label>
                        {organizers.map((organizer, index) => (
                            <div key={index} className="relative w-full mt-2">
                                <div className="flex gap-2">
                                    <Textfield 
                                        label="" 
                                        type="text" 
                                        placeholder="Organizer name" 
                                        value={organizer.name} 
                                        icon={<Users size={20} className="text-Label" />} 
                                        onChange={(e) => updateOrganizerName(index, e.target.value)} 
                                    />
                                    <Textfield 
                                        label="" 
                                        type="email" 
                                        placeholder="Organizer email" 
                                        value={organizer.email} 
                                        icon={<Mail size={20} className="text-Label" />} 
                                        onChange={(e) => updateOrganizerEmail(index, e.target.value)} 
                                    />
                                </div>
                                {index > 0 && (
                                    <Minus 
                                        size={20} 
                                        className="absolute right-3 inset-y-0 my-auto text-Label cursor-pointer" 
                                        onClick={() => removeOrganizer(index)} 
                                    />
                                )}
                            </div>
                        ))}
                        <div className="mt-2">
                            <Button onClick={addOrganizer} variant="minor" className="text-Primary bg-black">
                                + ADD ORGANIZER
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button 
                        onClick={() => window.history.back()}
                        variant="minor"
                        className="border border-Primary text-Primary"
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleForm} variant="major">
                        {eventDetails ? "Save Changes" : "Create Event"}
                    </Button>
                </div>
            </div>
            
            <div className="mt-8">
                <UserNavbar activePage='AdminEventForm'/>
            </div>
        </div>
    );
};

export default AdminEventFormPage;