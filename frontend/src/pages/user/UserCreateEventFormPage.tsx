import { FormEvent, useState } from "react";
import { BackAndFontAndProfileHeader } from "../../components/MobileHeaders";
import UserNavbar from "../../components/UserNavbar";
import DesktopNavbar from "../../components/DesktopNavbar";
import { DateInput, EventFormTextAreaField, EventFormTextField, UploadImageButton } from "../../components/EventFormInput";
import { useNavigate } from "react-router-dom";

const UserCreateEventFormPage: React.FC = () => {
    const [title, setTitle] = useState<string>('');
    const [coverImageString, setCoverImageString] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [noOfAttendees, setNoOfAttendees] = useState<number>(0);
    
    const navigate = useNavigate();

    const navigateTo = (path: string) => {
        navigate(path);
    }

    const handleCreateEvent = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        const payload = {
            created_by: "65f4e1a07d98f3a8a4e8b2c3", // TODO: Replace with actual logged-in user's ID (Can't get user ID)
            title,
            description,
            event_date: new Date(date).toISOString(),
            location,
            approval_status: "Pending",
            eventImageURL: coverImageString,
            rsvp_list: [],
            rsvp_count: 0,
        };
    
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/events/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
    
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || "Failed to create event");
            }
    
            const data = await response.json();
            console.log("Event created:", data);
    
            alert("Event successfully created!");
            navigateTo("/user/events");
        } catch (error) {
            console.error("Error creating event:", error);
            alert("There was an error creating the event. Please try again.");
        }
    };

    return (
        <>  
            <UserNavbar activePage='Events'/>
            <DesktopNavbar activePage='Events'/>
            <BackAndFontAndProfileHeader />

            <div className="flex justify-center items-center overflow-hidden">
                {/* limit the page to 1280px */}
                <div className="max-w-[1280px] w-full px-5 bg-white flex flex-col justify-center items-center mb-10 lg:mb-15">
                    <div className="p-5 text-Primary flex flex-col gap-5 justify-center items-start rounded-3xl bg-WhiteFormGradient mb-10">
                        <h1 className="text-3xl font-bold self-center mb-3">EVENTS FORM</h1>
                        <h2 className="text-2xl font-extrabold -mb-4">Events Information</h2>
                        <h4 className="text-xs font-medium">By submitting this application, you consent to the use of your email and contact number for future updates and communications regarding this job posting.</h4>
                    
                        <form id="event_form" onSubmit={handleCreateEvent} className="w-full flex flex-col gap-5 mb-10">
                            <EventFormTextField
                                label="Title"
                                value={title}
                                placeholder="Title"
                                onChange={(e) => {setTitle(e.target.value)}}
                                required={true}
                            />
                            <UploadImageButton
                                label="Cover"
                                value={coverImageString}
                                changeImage={(file) => setCoverImageString(file ? URL.createObjectURL(file) : '')}
                            />
                            <EventFormTextAreaField
                                label="Description"
                                value={description}
                                placeholder="Add description"
                                onChange={(e) => {setDescription(e.target.value)}}
                                required={true}
                            />
                            <EventFormTextField
                                label="Location"
                                value={location}
                                placeholder="Location"
                                onChange={(e) => {setLocation(e.target.value)}}
                                required={true}
                            />
                            <DateInput 
                                label="Date"
                                value={date}
                                changeDate={setDate}
                                required={true}
                            />
                            <EventFormTextField
                                label="Number of Attendees"
                                value={noOfAttendees}
                                placeholder="Number of Attendees"
                                onChange={(e) => {setNoOfAttendees(Number(e.target.value))}}
                                required={true}
                            />
                        </form>
                    </div>

                    <button type="submit" form="event_form" className="text-lg text-white bg-DarkerPrimary px-15 py-2 rounded-2xl hover:brightness-110 m-1">
                        Submit
                    </button>
                    <button className="text-lg font-bold text-DarkerPrimary bg-white px-15 py-2 rounded-2xl hover:bg-gray-100 m-1"
                        onClick={() => navigateTo("/user/events")}
                    >
                        Cancel
                    </button>

                    {/* space for aesthetic */}
                    <div className="h-10 md:h-20 lg:h-30 w-full" />
                </div>
            </div> 
        </>
    )
};

export default UserCreateEventFormPage