import { Banknote, Bookmark, Clock, Image, MapPin, User } from "lucide-react";
import { motion } from "framer-motion";
import JobProps from "../types/job";
import { useSavedJobsContext } from "../hooks/useSavedJobsContext";
import PrivilegedAction from "../pages/utils/PrivilegedActionGuard";

const JobPostingCard: React.FC<{
  job: JobProps;
  isSelected: boolean;
  isRecent: boolean;
  isSaved: boolean;
  compact?: boolean;
}> = ({ job, isSelected, isRecent, isSaved, compact = false }) => {
  const { bookmarkJob, removeSavedJob } = useSavedJobsContext();
  const timeAgoString = (date: Date) => {
    const now = new Date();
    const target = new Date(date);

    const offset = target.getTimezoneOffset();
    const correctedTarget = new Date(target.getTime() + -offset * 60 * 1000);

    const diff = now.getTime() - correctedTarget.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) {
      return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
    } else if (hours < 1) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else if (days < 30) {
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    } else if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} month${months !== 1 ? "s" : ""} ago`;
    } else {
      const years = Math.floor(days / 365);
      return `${years} year${years !== 1 ? "s" : ""} ago`;
    }
  };

  return (
    <div
      className={`w-full duration-200 border-2 ${
        isRecent ? "border-ProfileBorder" : "border-FaintBlue"
      } hover:scale-[1.02] hover:cursor-pointer card card-md bg-linear-to-b transition-all rounded-3xl ${
        isSelected
          ? "sm:border-transparent sm:bg-FaintBlue"
          : "hover:border-[#C6D8EB] border-FaintBlue"
      }`}
    >
      <div className="gap-4 card-body text-Primary">
        <div className="flex flex-col leading-none">
          <div className="flex justify-between mb-3">
            <Image style={{ color: "var(--color-Primary)" }} />

            <motion.div
              key={isSaved ? "saved" : "unsaved"} // triggers animation on toggle
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.3 }}
            >
              <PrivilegedAction>
                <Bookmark
                  style={{
                    fill: isSaved ? "var(--color-Primary)" : "none",
                    color: "var(--color-Primary)",
                  }}
                  onClick={(e) => {
                    if (isSaved) removeSavedJob(job._id); // unbookmark job
                    else bookmarkJob(job); // bookmark job
                    e.stopPropagation();
                  }}
                />
              </PrivilegedAction>
            </motion.div>
          </div>
          <h2 className="text-xl font-medium">{job.title}</h2>
          <h2 className="font-light text-lg mt-[-6px]">{job.company_name}</h2>
        </div>
        {!compact && (
          <div>
            <div className="flex flex-col gap-1 text-base font-light leading-none">
              <span className="flex items-center gap-1">
                <MapPin size={16} />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Banknote size={16} />
                PHP {job.min_salary} - {job.max_salary}
              </span>
            </div>

            <div className="flex items-center">
              <User size={16} />
              <p className="ml-1 text-sm font-medium leading-none overflow-ellipsis line-clamp-1">
                {job.author_name +
                  " • " +
                  timeAgoString(job.date_posted ?? new Date())}
              </p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 text-md text-white overflow-x-auto">
          <span className="flex items-center gap-1 p-1 px-3 rounded-full bg-green-400">
            <Clock size={15} />
            {job.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default JobPostingCard;
