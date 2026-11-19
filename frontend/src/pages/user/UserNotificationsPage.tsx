import React, { useState } from 'react';
import UserNavbar from '../../components/UserNavbar';
import DesktopNavbar from '../../components/DesktopNavbar';
import { BackAndFontAndProfileHeader } from '../../components/MobileHeaders';
import { DesktopNotificationCard, MobileNotificationCard, NotificationProps } from '../../components/NotificationCard';
import Placeholder from '../../assets/placeholders/ICS_Placeholder.jpg';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserNotificationsPage: React.FC = () => {
    const sampleNotifications: NotificationProps[] = [
        { type: "story", title: "ICS Team Attends FICC 2024 in Berlin", isVisited: true , date: '2025-03-26T19:55:36.137+00:00'},
        { type: "jobs", newJobsQuantity: 20, isVisited: true , date: '2025-03-26T19:55:36.137+00:00'},
        { type: "cause", id: "67f7f6f9a303f2aee836fde1", title: "Updated Scholarship Fund", image: Placeholder, isVisited: true, date: '2025-03-26T19:55:36.137+00:00'},
        { type: "cause", id: "67f7f6f9a303f2aee836fde1", title: "Updated Scholarship Fund", image: Placeholder, isVisited: true, date: '2025-03-26T19:55:36.137+00:00'},
        { type: "cause", id: "67f7f6f9a303f2aee836fde1", title: "Updated Scholarship Fund", image: Placeholder, isVisited: true, date: '2025-03-26T19:55:36.137+00:00'}
    ];
    // separate arrays for recent and older notifications
    const navigate = useNavigate();

    // @TODO use the useState variable instead upon integration, and delete the line with sampleNotifications
    const recentNotifications:NotificationProps[] = sampleNotifications;
    // const [recentNotifications, setRecentNotifications] = useState<NotificationProps[]>([]);

    // @TODO use the useState variable instead upon integration, and delete the line with sampleNotifications
    const olderNotifications:NotificationProps[] = sampleNotifications;
    // const [olderNotifications, setOlderNotifications] = useState<NotificationProps[]>(sampleNotifications);
    
    const [activeCategory, setActiveCategory] = useState<string>('All');

    // @TODO use the useState variable instead upon integration, and delete the line with sampleNotifications
    const newNotifCount:number = 5;
    // const [newNotifCount, setNewNotifCount] = useState<number>(5);

    // filtering
    // useEffect(()=>{
    //     // fetch filtered recent notifications here
    //     // fetch filtered older notifications here
    //     // set recent notifications here
    //     // set older notifications here
    // }, [activeCategory]);

    // counting number of new notifications
    // useEffect(()=>{
    //     // fetch notifications with isVisited==false here
    //     // set notifications with isVisited==false here
    // }, [recentNotifications, olderNotifications]);

    return (
        <>
            <UserNavbar activePage='Notifs'/>
            <DesktopNavbar activePage='Notifs'/>
            <BackAndFontAndProfileHeader className='px-6'/>

            <div className='flex justify-center items-center'>
                {/* limit the page to 1280px */}
                <div className="max-w-[1280px] w-full mb-20 lg:m-20">
                    <div className="hidden lg:flex gap-3 text-Primary items-center pb-10">
                        <button onClick={() => {navigate(-1)}}><ArrowLeft /></button>
                        <h1 className="text-4xl font-bold">Notifications</h1>
                    </div>
                    <div className="lg:flex lg:justify-center lg:items-start">
                        <NotificationsFilter activeCategory={activeCategory} setActiveCategory={setActiveCategory}/>
                        
                        {/* notification cards for mobile view */}
                        <hr className='bg-[#E3E3E3] h-2 border-none lg:hidden'/>
                        <div className="lg:hidden">
                            {recentNotifications.map((notif, index) => {
                                return <MobileNotificationCard key={index} id={notif.id} type={notif.type} title={notif.title} newJobsQuantity={notif.newJobsQuantity} image={notif.image} isVisited={notif.isVisited} date={notif.date}/>;
                            })}
                        </div>
                        <div className="lg:hidden">
                            {olderNotifications.map((notif, index) => {
                                return <MobileNotificationCard key={index} id={notif.id} type={notif.type} title={notif.title} newJobsQuantity={notif.newJobsQuantity} image={notif.image} isVisited={notif.isVisited} date={notif.date}/>;
                            })}
                        </div>
                        
                        {/* notification cards for desktop view */}
                        <div className="hidden lg:flex lg:flex-col lg:flex-4/5">
                            <h2 className="text-2xl text-[#6695CB]"><span className="font-semibold">TODAY</span> ({newNotifCount})</h2>
                            <div className="rounded-lg overflow-hidden mt-3 mb-10">
                                {recentNotifications.map((notif, index) => {
                                    return <DesktopNotificationCard key={index} id={notif.id} type={notif.type} title={notif.title} newJobsQuantity={notif.newJobsQuantity} isVisited={notif.isVisited} date={notif.date}/>;
                                })}
                            </div>
                            <h2 className="text-2xl text-[#6695CB] font-semibold">PREVIOUS</h2>
                            <div className="rounded-lg overflow-hidden mt-3 mb-10">
                                {olderNotifications.map((notif, index) => {
                                    return <DesktopNotificationCard key={index} id={notif.id} type={notif.type} title={notif.title} newJobsQuantity={notif.newJobsQuantity} isVisited={notif.isVisited} date={notif.date}/>;
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

/**
 * A responsive filter for categories in notification page.
 * @param {string} activeCategory - the currently selected category
 * @param {function} setActiveCategory - changes the currently selected category from inside the filter component
 * 
 * @example
 * const [activeCategory, setActiveCategory] = useState<string>('All');
 * <NotificationsFilter activeCategory={activeCategory} setActiveCategory={setActiveCategory}/>
 */
const NotificationsFilter: React.FC<{
    activeCategory: string;
    setActiveCategory: (category: string) => void;
}> = ({
    activeCategory,
    setActiveCategory
}) => {
    return (
        <div className="flex gap-2 text-Primary lg:text-xl p-5 overflow-x-auto lg:flex-col lg:flex-1/5">
            <button className={`hover:brightness-95 py-2 px-4 lg:py-1 lg:px-3 border lg:border-none rounded-full ${activeCategory === 'All' ? 'bg-Secondary text-white font-semibold' : 'bg-white'}`}
                onClick={()=>{setActiveCategory('All')}}>
                All
            </button>
            <button className={`hover:brightness-95 py-2 px-4 lg:py-1 lg:px-3 border lg:border-none rounded-full ${activeCategory === 'Articles' ? 'bg-Secondary text-white font-semibold' : 'bg-white'}`}
                onClick={()=>{setActiveCategory('Articles')}}>
                Articles
            </button>
            <button className={`hover:brightness-95 py-2 px-4 lg:py-1 lg:px-3 border lg:border-none rounded-full ${activeCategory === 'Jobs' ? 'bg-Secondary text-white font-semibold' : 'bg-white'}`}
                onClick={()=>{setActiveCategory('Jobs')}}>
                Jobs
            </button>
            <button className={`hover:brightness-95 py-2 px-4 lg:py-1 lg:px-3 border lg:border-none rounded-full ${activeCategory === 'Events' ? 'bg-Secondary text-white font-semibold' : 'bg-white'}`}
                onClick={()=>{setActiveCategory('Events')}}>
                Events
            </button>
            <button className={`hover:brightness-95 py-2 px-4 lg:py-1 lg:px-3 border lg:border-none rounded-full ${activeCategory === 'Donations' ? 'bg-Secondary text-white font-semibold' : 'bg-white'}`}
                onClick={()=>{setActiveCategory('Donations')}}>
                Donations
            </button>
        </div>
    );
}


export default UserNotificationsPage;