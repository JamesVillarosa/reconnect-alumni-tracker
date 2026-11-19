import { BriefcaseBusiness, Heart, Newspaper, UsersRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatToRelativeTime } from "../pages/utils/TimeFormat";

export interface NotificationProps {
    id?: string;
    type: 'story' | 'jobs' | 'event' | 'cause';
    title?: string;
    newJobsQuantity?: number;
    image?: string;
    isVisited: boolean;
    date: string;
}

/**
 * A card for the mobile view of the Notifications page. Redirects to respective item or page upon clicking the card.
 * Backend operations are needed inside the component to permanently change the status (isNew) of the notification.
 * @param {string} id - optional, the ID of the item so the navigation can be redirected to the item's details upon clicking the card
 * @param {string} type - 'story' | 'jobs' | 'event' | 'cause', determines the type of notification card and its appearance
 * @param {string} title - optional, for story, event, and cause notification cards only
 * @param {string} newJobsQuantity - optional, for job notification card only. The number of recently posted jobs
 * @param {string} image - optional, for event and cause notification cards only. The display image of an event or donation cause.
 * @param {boolean} isVisited - true if the user has not yet clicked or visited the respective item of the notification
 * @param {string} date - date in ISO format
 * 
 * @example
 * // if type == story
 * <MobileNotificationCard id={notif.id} type='story' title={notif.title} isNew={notif.isNew}/>
 * 
 * @example
 * // if type == event
 * <MobileNotificationCard id={notif.id} type='event' title={notif.title} image={notif.image} isNew={notif.isNew}/>
 * 
 * @example
 * // if type == jobs
 * <MobileNotificationCard id={notif.id} type='jobs' newJobsQuantity={notif.newJobsQuantity} isNew={notif.isNew}/>
 */
export const MobileNotificationCard: React.FC<NotificationProps> = ({
    id,
    type,
    title,
    newJobsQuantity,
    image,
    isVisited,
    date
}) => {
    const [isHighlighted, setIsHighlighted] = useState<boolean>(isVisited);
    const label = String(type).charAt(0).toUpperCase() + String(type).slice(1);
    const timeFromNow = formatToRelativeTime(date);
    const navigate = useNavigate();

    const handleClickNotif = () => {
        // set to false only if previously true
        if (isHighlighted){
            setIsHighlighted(false);
        }

        // handle backend equivalent here

        // navigate to where item is
        handleNavigationToItem();
    }

    const handleNavigationToItem = () => {
        if (type=='jobs'){
            navigate('/user/jobs');
        } else if (type=='story'){
            // navigate to story
        } else if (type=='event'){
            navigate(`/user/events/${id}`);
        } else if (type=='cause'){
            // navigate to donation
        }
    }

    return (
        <button 
            className={`p-5 flex justify-start items-center gap-5 w-full lg:hidden ${isHighlighted? 'bg-NotifHighlight' : 'bg-white'}`}
            onClick={handleClickNotif}
        >
            {/* blue dot indicator */}
            <div className={`h-3 w-3 rounded-full bg-Primary ${isHighlighted? '' : 'hidden'}`}/>
            {/* image for event and cause types */}
            {image &&
                <div className={`${(type=='event' || type=='cause')? '' : 'hidden'} h-15 w-15`}>
                    <img src={image} className="w-full h-full object-cover rounded-lg" />
                </div>
            }
            {/* label and text */}
            <div className="grow flex flex-col gap-1 items-start">
                <h3 className="text-Primary">
                    <span className="font-bold">{(type != 'jobs')? 'New ' : ''}{label}: </span>
                    {(type == 'jobs')? newJobsQuantity + ' recently posted jobs' : title}
                </h3>
                <button className={`${(type != 'jobs')? 'hidden ' : ''} text-Primary text-sm border border-Primary rounded-full py-[2px] px-2 hover:brightness-50`}
                    onClick={()=>{navigate('/user/jobs')}}>
                    View Jobs
                </button>
            </div>
            {/* time from now */}
            <h3 className="text-Primary text-sm font-light">
                {timeFromNow}
            </h3>
        </button>
    );
}

/**
 * A card for the desktop view of the Notifications page. Redirects to respective item or page upon clicking the card.
 * Backend operations are needed inside the component to permanently change the status (isNew) of the notification.
 * @param {string} id - optional, the ID of the item so the navigation can be redirected to the item's details upon clicking the card
 * @param {string} type - 'story' | 'jobs' | 'event' | 'cause', determines the type of notification card and its appearance
 * @param {string} title - optional, for story, event, and cause notification cards only
 * @param {string} newJobsQuantity - optional, for job notification card only. The number of recently posted jobs
 * @param {boolean} isVisited - true if the user has not yet clicked or visited the respective item of the notification
 * @param {string} date - date in ISO format
 * 
 * @example
 * // if type == story
 * <DesktopNotificationCard id={notif.id} type='story' title={notif.title} isNew={notif.isNew} date={notif.date}/>
 * 
 * @example
 * // if type == event
 * <DesktopNotificationCard id={notif.id} type='event' title={notif.title} isNew={notif.isNew} date={notif.date}/>
 * 
 * @example
 * // if type == jobs
 * <DesktopNotificationCard id={notif.id} type='jobs' newJobsQuantity={notif.newJobsQuantity} isNew={notif.isNew} date={notif.date}/>
 */
export const DesktopNotificationCard: React.FC<NotificationProps> = ({
    id,
    type,
    title,
    newJobsQuantity,
    isVisited,
    date
}) => {
    const [isHighlighted, setIsHighlighted] = useState<boolean>(isVisited);
    const label = String(type).charAt(0).toUpperCase() + String(type).slice(1);
    const timeFromNow = formatToRelativeTime(date);
    const navigate = useNavigate();

    const handleClickNotif = () => {
        // set to false only if previously true
        if (isHighlighted){
            setIsHighlighted(false);
        }

        // handle backend equivalent here

        // navigate to where item is
        handleNavigationToItem();
    }

    const handleNavigationToItem = () => {
        if (type=='jobs'){
            navigate('/user/jobs');
        } else if (type=='story'){
            // navigate to story
        } else if (type=='event'){
            navigate(`/user/events/${id}`);
        } else if (type=='cause'){
            // navigate to donation
        }
    }

    return (
        <button 
            className={`hidden lg:flex items-center w-full pl-2 ${isHighlighted? 'bg-NotifHighlight' : 'bg-white'}`}
            onClick={handleClickNotif}
        >
            {/* blue dot indicator */}
            <div className={`h-2 w-2 rounded-full bg-Primary ${isHighlighted? '' : 'hidden'}`}/>
            <div className="flex w-full gap-5 py-5 ml-3 mr-5 items-center border-b-2 border-b-[#B6D1E9]">
                {/* icon */}
                <div className="bg-Primary rounded-full p-2">
                    <UsersRound style={{ color: 'white' }} className={(type=='event')? '' : 'hidden'}/>
                    <Heart style={{ color: 'white' }} className={(type=='cause')? '' : 'hidden'}/>
                    <Newspaper style={{ color: 'white' }} className={(type=='story')? '' : 'hidden'}/>
                    <BriefcaseBusiness style={{ color: 'white' }} className={(type=='jobs')? '' : 'hidden'}/>
                </div>
                {/* label and text */}
                <div className="grow flex flex-col items-start">
                    <h2 className="text-Primary text-sm">
                        <span className="font-semibold">{label}</span>
                    </h2>
                    <h3 className="text-Primary">
                        {(type == 'jobs')? newJobsQuantity + ' recently posted jobs' : title}
                    </h3>
                </div>
                {/* time from now */}
                <h3 className="text-Primary text-sm font-light">
                    {timeFromNow}
                </h3>
            </div>
            
        </button>
    );
}