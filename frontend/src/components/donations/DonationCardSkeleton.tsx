/**
 * 
 * @returns {JSX.Element} A skeleton component for the donation card
 */
export function DonationCardSkeleton() {
    return (
        <div
            className="card bg-gradient-to-b from-[#FAFAFA] to-[#E7EFF6] border-[#C6D8EB] rounded-3xl transition duration-200 border-1"
        >
            {/* IMAGE SKELETON */}
            <figure className="p-4">
                <div className="w-full h-48 rounded-xl skeleton bg-primary/10" />
            </figure>

            {/* TEXT + PROGRESS SKELETON */}
            <div className="gap-0 pt-0 card-body text-DarkerPrimary w-full">
                <div className="h-6 w-3/4 rounded-md skeleton mb-2" /> {/* title */}
                <div className="h-4 w-1/2 rounded-md skeleton mb-4" /> {/* end date */}
                <div className="h-4 w-full rounded-full skeleton" /> {/* progress bar */}
            </div>
        </div>
    );
}