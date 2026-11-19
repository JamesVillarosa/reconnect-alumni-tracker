import { formatDistanceToNow, format, differenceInHours, differenceInSeconds, differenceInMinutes, differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears } from 'date-fns';

/**
 * A helper function for converting ISO Date to human-readable date/time.
 * @returns time in <> hours ago, if hours difference from now is < 24
 * @returns date in the format MMMM d, YYYY; if hours difference from now is > 24
 * 
 * @param {string} date - date in ISO format (used by backend)
 * 
 * @example
 * var isoDate = '2025-03-26T19:55:36.137+00:00';
 * var humanReadable = formatToHoursOrDate(isoDate);
 */
export function formatToHoursOrDate(date:string):string {
    const originalDate:Date = new Date(date);
    const hoursAgo = differenceInHours(new Date(), originalDate);

    const displayDate =
    hoursAgo < 24
        ? formatDistanceToNow(originalDate, { addSuffix: true })
        : format(originalDate, 'MMMM d, yyyy');

    return(displayDate);
}

/**
 * A helper function for converting ISO Date to human-readable date.
 * @returns date in the format MMMM d, YYYY
 * 
 * @param {string} date - date in ISO format (used by backend)
 * 
 * @example
 * var isoDate = '2025-03-26T19:55:36.137+00:00';
 * var humanReadable = formatToDate(isoDate);
 */
export function formatToDate(date:string):string {
    const originalDate:Date = new Date(date);

    return(format(originalDate, 'MMMM d, yyyy'));
}

/**
 * A helper function for converting ISO Date to human-readable date/time.
 * @returns time in seconds, minutes, hours, days, weeks, month, and years ago
 * @returns 2s, 5m, 10h, 4d, 1m, 2y
 * 
 * @param {string} date - date in ISO format (used by backend)
 * 
 * @example
 * var isoDate = '2025-03-26T19:55:36.137+00:00';
 * var relativeTime = formatToRelativeTime(isoDate);
 */
export function formatToRelativeTime(date:string):string {
    const originalDate = new Date(date);
    const now = new Date();

    const secondsAgo = differenceInSeconds(now, originalDate);
    const minutesAgo = differenceInMinutes(now, originalDate);
    const hoursAgo = differenceInHours(now, originalDate);
    const daysAgo = differenceInDays(now, originalDate);
    const weeksAgo = differenceInWeeks(now, originalDate);
    const monthsAgo = differenceInMonths(now, originalDate);
    const yearsAgo = differenceInYears(now, originalDate);

    if (secondsAgo < 60) {
        return 'Just now';
    } else if (minutesAgo < 60) {
        return `${minutesAgo}m`;
    } else if (hoursAgo < 24) {
        return `${hoursAgo}h`;
    } else if (daysAgo < 7) {
        return `${daysAgo}d`;
    } else if (weeksAgo <= 4) {
        return `${weeksAgo}w`;
    } else if (monthsAgo <= 12) {
        return `${monthsAgo}mo`;
    } else {
        return `${yearsAgo}y`;
    }
}

/**
 * A helper function for converting ISO Date to human-readable date/time.
 * @returns date in the format MM-DD-YYY
 * 
 * @param {string} date - date in ISO format (used by backend)
 * 
 * @example
 * var isoDate = '2025-03-26T19:55:36.137+00:00';
 * var date = formatDateWithDash(isoDate);
 */
export function formatDateWithDash(originalDate:string | Date):string {
    const date = new Date(originalDate);

    const formatted = [
        String(date.getMonth() + 1).padStart(2, '0'), // Month is 0-based
        String(date.getDate()).padStart(2, '0'),
        date.getFullYear()
    ].join('-');

    return formatted;
}


export function formatTimeAMPM(dateString: string): string {
    const date = new Date(dateString);
  
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
  
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours; // 12-hour clock correction
  
    const formattedTime = `${hours}:${minutes}${ampm}`;
  
    return formattedTime;
  }