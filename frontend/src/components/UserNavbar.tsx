import React from 'react';
import { House, UsersRound, Heart, BriefcaseBusiness } from 'lucide-react'; 
import { Link } from 'react-router-dom';
import HouseFilled from './custom_icons/HomeIcon_filled.tsx';
import BriefcaseFilled from './custom_icons/BriefcaseIcon_filled.tsx';

const UserNavbar: React.FC<{ activePage: string }> = ({activePage}) => (
    <div className='dock sm:hidden'>
        <Link to="/user" className='flex flex-col items-center justify-center'>
            { (activePage == 'Home') ? <HouseFilled/> : <House style={{ color: 'var(--color-Primary)' }}/>}
            <span className='text-xs text-Primary'>Home</span>
        </Link>
        <Link to="/user/events" className='flex flex-col items-center justify-center'>
            { (activePage == 'Events') ? <UsersRound style={{ fill: 'var(--color-Primary)', color: 'var(--color-Primary)' }}/> : <UsersRound style={{ color: 'var(--color-Primary)' }}/>}
            <span className='text-xs text-Primary'>Events</span>
        </Link>
        <Link to="/user/donate" className='flex flex-col items-center justify-center'>
            { (activePage == 'Donate') ? <Heart style={{ fill: 'var(--color-Primary)', color: 'var(--color-Primary)' }}/> : <Heart style={{ color: 'var(--color-Primary)' }}/>}
            <span className='text-xs text-Primary'>Donate</span>
        </Link>
        <Link to="/user/jobs" className='flex flex-col items-center justify-center'>
            { (activePage == 'Jobs') ? <BriefcaseFilled/> : <BriefcaseBusiness style={{ color: 'var(--color-Primary)' }}/>}
            <span className='text-xs text-Primary'>Jobs</span>
        </Link>
        {/* <Link to="/user/notifs" className='flex flex-col items-center justify-center'>
            { (activePage == 'Notifs') ? <BellRing style={{ fill: 'var(--color-Primary)', color: 'var(--color-Primary)' }}/> : <BellRing style={{ color: 'var(--color-Primary)' }}/>}
            <span className='text-xs text-Primary'>Notifs</span>
        </Link> */}
    </div>
);

export default UserNavbar;