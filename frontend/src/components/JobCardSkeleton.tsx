/**
 * A skeleton component for a job card, used as a placeholder while loading data.
 * 
 * @param param0 - Props for the JobCardSkeleton component (currently unused).
 * @returns A JSX element representing the skeleton UI for a job card.
 */
export function JobCardSkeleton() {
  return (
    <div className="card card-md border-[#C6D8EB] border-2 rounded-3xl">
      <div className="flex flex-col card-body text-Primary gap-4">
        <div className="flex justify-between mb-0.5">
          <div className="bg-Primary/10 skeleton h-6 w-6 rounded-md" />{" "}
          {/* Icon */}
          <div className="bg-Primary/10 skeleton h-6 w-6 rounded-md" />{" "}
          {/* Bookmark */}
        </div>
        <div className="flex flex-col gap-1">
          <div className="bg-Primary/10 skeleton h-5 w-3/4 rounded-md" />{" "}
          {/* Job title */}
          <div className="bg-Primary/10 skeleton h-5 w-2/4 rounded-md" />
          {/* Company */}
        </div>
        <div className="flex flex-col gap-1">
          <div className="bg-Primary/10 skeleton h-4 w-2/3 rounded-md" />{" "}
          {/* Location */}
          <div className="bg-Primary/10 skeleton h-4 w-1/3 rounded-md" />{" "}
          {/* Salary */}
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-Primary/10 skeleton rounded-full h-4 w-4" />{" "}
          {/* Icon */}
          <div className="bg-Primary/10 skeleton h-4 w-1/2 rounded-md" />{" "}
          {/* Author + time */}
        </div>
      </div>
    </div>
  );
}

export default JobCardSkeleton;