import { useState } from 'react';
import PulsingProgressBar from '../PulsingProgressBar';
import placeholder from '../../assets/donation_mock.jpeg';

/**
 * DonationCard Component
 * 
 * This component renders a card that displays information about a donation campaign.
 * It includes an image, title, end date, progress bar, and handles click events.
 * 
 * @param - The props object containing the following properties:
 * @param id - A unique identifier for the donation card.
 * @param title - The title of the donation campaign.
 * @param endDate - The end date of the donation campaign.
 * @param raisedAmount - The amount of money raised so far.
 * @param goalAmount - The target goal amount for the campaign.
 * @param onClick - A callback function triggered when the card is clicked.
 * @param imageURL - (Optional) The URL of the image to display for the campaign.
 * 
 * @returns A JSX.Element representing the donation card.
 */
export function DonationCard({
    id, title, endDate, raisedAmount, goalAmount, item_requirements, onClick, imageURL: imageURL, requiresMoney = true
}: {
    id: string;
    title: string;
    endDate: Date;
    raisedAmount: number;
    goalAmount: number;
    requiresMoney?: boolean;
    item_requirements?: {
        item_name: string;
        target_quantity: number;
        current_quantity: number;
    }[];
    onClick: () => void;
    imageURL?: string;
}) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const imageUrl = imageURL || placeholder; // uses provided placeholderImage or fallback to default

    // calculate progress half from monetary and half from in-kind
    const inKindProgress = item_requirements ? item_requirements.reduce((acc, item) => {
        return acc + (item.current_quantity / item.target_quantity) * 50;
    }, 0) : 0;
    const monetaryProgress = Math.floor((raisedAmount / goalAmount) * 50);
    const totalProgress = Math.min(monetaryProgress + inKindProgress, 100);
    let progressBarValue = Math.floor(totalProgress);

    // adjust to show 0 if NaN
    if (isNaN(progressBarValue))
        progressBarValue = 0;

    return (
        <div
            key={id + "card"}
            className="card bg-gradient-to-b from-[#FAFAFA] to-[#E7EFF6] border-[#C6D8EB] rounded-3xl transition duration-200 hover:-translate-[0.05rem] hover:shadow-lg hover:cursor-pointer border-1"
            onClick={onClick}
        >
            {/* CARD IMAGE */}
            <figure className="p-4">
                <div className="relative w-full h-48 overflow-hidden rounded-xl bg-primary/10">
                    {/* this conditionally loads a skeleton */}
                    {!imageLoaded && (
                        <div className="absolute inset-0 skeleton rounded-xl" />
                    )}
                    <div
                        className={`w-full h-full rounded-xl transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        style={{
                            backgroundImage: `url(${imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <img
                            src={imageUrl}
                            alt="donation photo"
                            className="hidden"
                            onLoad={() => setImageLoaded(true)}
                        />
                    </div>
                </div>
            </figure>
            {/* DONATION CARD PREVIEW DETAILS */}
            <div className="w-full gap-0 pt-0 card-body text-DarkerPrimary">
                <h2 className="text-xl card-title line-clamp-1">{title}</h2>
                <p className="text-sm text-Label">End Date: {endDate.toLocaleDateString()}</p>
                <PulsingProgressBar progress={progressBarValue} raisedAmount={raisedAmount} className="mt-2" hasMoney={requiresMoney}/>
            </div>
        </div>
    );
}