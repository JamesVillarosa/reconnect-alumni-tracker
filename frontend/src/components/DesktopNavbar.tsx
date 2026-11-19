import { Link } from "react-router-dom";
// import { IoIosSearch } from "react-icons/io";
// import { useState } from "react";
import { House, UsersRound, Heart, BriefcaseBusiness } from 'lucide-react';
import HouseFilled from './custom_icons/HomeIcon_filled.tsx';
import BriefcaseFilled from './custom_icons/BriefcaseIcon_filled.tsx';
import reconnectLogo from '../assets/logos/logo.png'
import AccountDropdown from "./profile/AccountDropdown.tsx";
// import FontInc from '../assets/font_inc.svg';
// import FontDec from '../assets/font_dec.svg';

const DesktopNavbar: React.FC<{ activePage: string }> = ({ activePage }) => {
    // const [searchValue, setSearchValue] = useState<string>("");  // State to store the value

    // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     setSearchValue(event.target.value);  // Update the state when the input changes
    // };

    return (
        <div className='z-50 hidden w-full shadow-md shadow-primary/[8%] sm:block sticky top-0 '>
            <div className="hidden sm:flex justify-center items-center h-[4rem] w-full bg-white px-[2rem] gap-16 sticky top-0 z-90">
                <div className="max-w-[1080px] bg-white w-full flex justify-between items-center h-full gap-16">
                    {/* name of app, redirects to homepage */}
                    <Link to="/user" className="flex-none font-medium text-Primary">
                        <img src={reconnectLogo} alt="Reconnect logo" className="w-8" />
                    </Link>

                    {/* NOTE: disabled following revisions of navbar */}
                    {/* search bar */}
                    {/* <label className="input bg-[#EBF2FA] rounded-xl border-2 border-[#B9D5EB] flex-1">
                    <IoIosSearch size={24} className="h-[2em] opacity-50" />
                    <input type="text" className="grow" placeholder="" value={searchValue} onChange={handleChange} />
                </label> */}

                    {/* navigation buttons */}
                    <div className="flex justify-between gap-8">
                        <Link to="/user" className={`flex flex-col justify-center items-center h-[4rem] w-[4rem] hover:bg-gray-100 ${(activePage == 'Home') ? 'border-b-3 border-Primary' : ''}`}>
                            {(activePage == 'Home') ? <HouseFilled /> : <House style={{ color: 'var(--color-Primary)' }} />}
                            <span className='text-xs font-medium text-Primary'>Home</span>
                        </Link>
                        <Link to="/user/events" className={`flex flex-col justify-center items-center h-[4rem] w-[4rem] hover:bg-gray-100 ${(activePage == 'Events') ? 'border-b-3 border-Primary' : ''}`}>
                            {(activePage == 'Events') ? <UsersRound style={{ fill: 'var(--color-Primary)', color: 'var(--color-Primary)' }} /> : <UsersRound style={{ color: 'var(--color-Primary)' }} />}
                            <span className='text-xs text-Primary'>Events</span>
                        </Link>
                        <Link to="/user/donate" className={`flex flex-col justify-center items-center h-[4rem] w-[4rem] hover:bg-gray-100 ${(activePage == 'Donate') ? 'border-b-3 border-Primary' : ''}`}>
                            {(activePage == 'Donate') ? <Heart style={{ fill: 'var(--color-Primary)', color: 'var(--color-Primary)' }} /> : <Heart style={{ color: 'var(--color-Primary)' }} />}
                            <span className='text-xs text-Primary'>Donate</span>
                        </Link>
                        <Link to="/user/jobs" className={`flex flex-col justify-center items-center h-[4rem] w-[4rem] hover:bg-gray-100 ${(activePage == 'Jobs') ? 'border-b-3 border-Primary' : ''}`}>
                            {(activePage == 'Jobs') ? <BriefcaseFilled /> : <BriefcaseBusiness style={{ color: 'var(--color-Primary)' }} />}
                            <span className='text-xs text-Primary'>Jobs</span>
                        </Link>
                        {/* @TODO: uncomment this when to be implemented */}
                        {/* <Link to="/user/notifs" className={`flex flex-col justify-center items-center h-[4rem] px-1 hover:bg-gray-100 ${(activePage == 'Notifs') ? 'border-b-3 border-Primary' : ''}`}>
                            {(activePage == 'Notifs') ? <BellRing style={{ fill: 'var(--color-Primary)', color: 'var(--color-Primary)' }} /> : <BellRing style={{ color: 'var(--color-Primary)' }} />}
                            <span className='text-xs text-Primary'>Notifications</span>
                        </Link> */}
                    </div>

                    <AccountDropdown
                        className="w-full"
                    />

                    {/* NOTE: temporarily commented out due to implementation issues */}
                    {/* text size adjuster */}
                    {/* <div className="flex flex-none">
                <button className="hover:bg-gray-100 p-2 rounded-md h-[3rem] w-[3rem]" onClick={() => {}}>
                    <img src={FontInc} />
                </button>
                <button className="hover:bg-gray-100 p-2 rounded-md h-[3rem] w-[3rem]" onClick={() => {}}>
                    <img src={FontDec} />
                </button>
            </div> */}
                </div>
            </div>
        </div>
    );
}

export default DesktopNavbar;