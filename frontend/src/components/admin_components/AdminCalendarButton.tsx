import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarComponentProps {
    label?: string | React.ReactNode;
    placeholder?: string;
    Icon?: React.ReactNode;
    onDateChange: (date: Date | null) => void;
    isStartDate?: boolean;
    startDate?: Date | null;
    endDate?: Date | null;
    value?: Date | null;
    className?: string;
    disabled?: boolean;
    alignRight?: boolean;
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({
    label = "",
    placeholder = "",
    Icon = <CalendarIcon size={18} />,
    onDateChange,
    isStartDate = false,
    startDate = null,
    endDate = null,
    value = null,
    className = "",
    disabled = false,
    alignRight = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [position, setPosition] = useState<'top' | 'bottom'>('bottom');
    const [alignment, setAlignment] = useState<'left' | 'right'>('left');
    const calendarRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // initialize
    useEffect(() => {
        if (value) {
        const date = new Date(value);
        setSelectedDate(date);
        setCurrentMonth(new Date(date));
        } else {
        setSelectedDate(null);
        }
    }, [value]);

    // calculate position when opening
    useEffect(() => {
        if (isOpen && buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        const spaceRight = window.innerWidth - buttonRect.right;
        const calendarWidth = 300;
        const calendarHeight = 350;

        setPosition(spaceBelow < calendarHeight && spaceAbove > spaceBelow ? 'top' : 'bottom');
        
        if (alignRight || spaceRight < calendarWidth) {
            setAlignment('right');
        } else {
            setAlignment('left');
        }
        }
    }, [isOpen, alignRight]);

    // close calendar when clicked outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
        };

        if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleDateSelect = (date: Date) => {
        // validate date
        if (!isStartDate && startDate && date <= new Date(startDate)) {
        return;
        }

        if (isStartDate && endDate && date >= new Date(endDate)) {
        return;
        }

        setSelectedDate(date);
        onDateChange(date);
        setIsOpen(false);
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newMonth = new Date(currentMonth);
        if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
        } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
        }
        setCurrentMonth(newMonth);
    };

    const renderDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        // get first day of month and last date of month
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();

        // get last date of previous month
        const prevLastDate = new Date(year, month, 0).getDate();

        const days = [];

        // previous month days ( chow in curr calendar month )
        const prevMonthDays = firstDay === 0 ? 6 : firstDay - 1;
        for (let i = prevMonthDays; i >= 0; i--) {
        days.push(
            <button
            key={`prev-${i}`}
            className="w-8 h-8 flex items-center justify-center text-LightGray cursor-default"
            disabled
            >
            {prevLastDate - i}
            </button>
        );
        }

        // current month days
        for (let i = 1; i <= lastDate; i++) {
        const date = new Date(year, month, i);
        const isToday = isSameDay(date, new Date());
        const isSelected = selectedDate && isSameDay(date, selectedDate);
        const isDisabled =
            (!isStartDate && startDate && date <= new Date(startDate)) ||
            (isStartDate && endDate && date >= new Date(endDate));

        days.push(
            <button
            key={`current-${i}`}
            className={`w-6 h-6 flex items-center justify-center rounded-full 
                ${isToday ? 'font-semibold border-1 border-Primary' : ''}
                ${isSelected ? 'bg-Primary text-white hover:bg-white hover:border-2 hover:border-Primary hover:text-Primary' : ''}
                ${isDisabled ? 'text-LightGray cursor-not-allowed' : 'hover:bg-Primary hover:text-white cursor-pointer'}
            `}
            onClick={() => !isDisabled && handleDateSelect(date)}
            disabled={isDisabled ?? false}
            >
            {i}
            </button>
        );
        }

        // next month days (shown in curr calendar month)
        const totalDaysShown = prevMonthDays + lastDate;
        const remainder = totalDaysShown % 7;
        const nextMonthDays = remainder === 0 ? 0 : 7 - remainder - 1;
        for (let i = 1; i <= nextMonthDays; i++) {
        days.push(
            <button
            key={`next-${i}`}
            className="w-8 h-8 flex items-center justify-center text-LightGray cursor-default"
            disabled
            >
            {i}
            </button>
        );
        }

        return days;
    };

    const isSameDay = (date1: Date, date2: Date) => {
        return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
        );
    };

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        });
    };

    return (
        <div className={`relative ${className}`} ref={calendarRef}>
        
            {label && (
                <label className="block text-lg font-semibold text-Primary mb-1">
                    {label}
                </label>
            )}
        {!label && <div className='h-6 mb-2'></div>}
        
            <div className="relative">
                <button
                ref={buttonRef}
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full pl-3 pr-4 py-2 text-left border rounded-2xl shadow-sm 
                    text-sm font-semibold flex items-center gap-2
                    ${isOpen ? 'border-Primary ring-1 ring-blue-500' : 'border-Primary hover:border-Primary'}
                    ${disabled ? 'bg-LightGray cursor-not-allowed' : ''}
                `}
                disabled={disabled}
                >
                    <span className='text-Primary'>
                        {Icon}
                    </span>
                    <span className={`flex-1 ${disabled ? 'text-gray-400' : ''}`}>
                        {selectedDate ? formatDate(selectedDate) : placeholder}
                    </span>
                </button>

                {isOpen && !disabled && (
                <div className={`
                    absolute z-50 w-auto bg-white border border-Primary rounded-2xl shadow-lg p-4 pr-6
                    ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
                    ${alignment === 'right' ? 'right-0' : 'left-0'}
                `}>
                    <div className="flex items-center justify-between mb-4 w-full min-w-[250px]">
                        <button
                            type="button"
                            onClick={() => navigateMonth('prev')}
                            className="p-1 rounded-full hover:bg-MidBlue"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="font-medium">
                            {currentMonth.toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                            })}
                        </div>
                        <button
                            type="button"
                            onClick={() => navigateMonth('next')}
                            className="p-1 rounded-full hover:bg-MidBlue"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-4 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                            <div key={day} className="text-center text-xs font-semibold text-Primary w-8">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-4">
                        {renderDays()}
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            type="button"
                            onClick={() => {
                            setSelectedDate(null);
                            onDateChange(null);
                            setIsOpen(false);
                            }}
                            className="text-sm text-Gray hover:text-Warning mr-3"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-sm text-Primary hover:text-DarkBlue"
                        >
                            Close
                        </button>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default CalendarComponent;