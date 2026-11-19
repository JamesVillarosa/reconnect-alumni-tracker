import React, { useState, useEffect } from "react";
import UserNavbar from "../../components/UserNavbar";
import JobPostingCard from "../../components/JobPostingCard";
import EventCardSmall from "../../components/EventCardSmall";
import DonateCard from "../../components/DonateCard";
import Modules from "../../components/Modules";
import { Bookmark } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import DesktopNavbar from "../../components/DesktopNavbar.tsx";
import MiniProfileBox from "../../components/profile/MiniProfileBox.tsx";
import { HomePageMobileHeader } from "../../components/MobileHeaders.tsx";
import ICSLogo from "../../assets/logos/ics.png";
import ReConnectLogo from "../../assets/logos/logo.png";
import UPLogo from "../../assets/logos/up.png";
import Button from "../../components/Button.tsx";
import { useAuthContext } from "../../hooks/useAuthContext.ts";
import { useJobsContext } from "../../hooks/useJobsContext.tsx";
import { useEventsContext } from "../../hooks/useEventsContext.tsx";
import { useDonationsContext } from "../../hooks/useDonationsContext.tsx";
import ArticlesCarousel from "../../components/ArticlesCarousel.tsx";
import { useSavedJobsContext } from "../../hooks/useSavedJobsContext.tsx";
import { CardSkeleton } from "../../components/Skeleton.tsx";
import { DonationCardSkeleton } from "../../components/donations/DonationCardSkeleton.tsx";
import { JobCardSkeleton } from "../../components/JobCardSkeleton.tsx";

const UserHomepage: React.FC = () => {
	const navigate = useNavigate();
	const { allJobs } = useJobsContext();
	const { allEvents } = useEventsContext();
	const { allDonations } = useDonationsContext();
	const { user } = useAuthContext();
	const username: string = user ? user.first_name : "User";
	const { savedJobs } = useSavedJobsContext();
	const [isLoading, setIsLoading] = useState(true);

	// Simulate loading state
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 1000);
		return () => clearTimeout(timer);
	}, []);

	// checks if job is saved
	const isJobSaved = (jobId: string) =>
		savedJobs.some((job) => job._id === jobId);

	return (
		<>
			{/* // <div className="flex flex-col items-center w-full min-h-screen p-2 overflow-x-hidden"> */}
			{/* ============================== Mobile HomePage Layout =============================== */}
			<div className="px-5 mb-[5rem] lg:hidden">
				<UserNavbar activePage="Home" />

				{/* header section */}
				<HomePageMobileHeader />

				{/* greeting section */}
				<div className="w-full mx-auto text-left sm:hidden">
					<h1 className="text-2xl font-semibold text-Primary">Welcome,</h1>
					<h1 className="text-5xl font-bold text-Primary">{username}</h1>
				</div>
				{/* modules section */}
				<div className="flex flex-col items-center w-full sm:hidden">
					<Modules />
					<div className="w-full text-right max-w-[360px] mx-auto">
						<p className="m-2 text-base text-Primary">
							Click the boxes to access the modules
						</p>
					</div>
				</div>
				{/* articles section */}
				<div className="flex flex-col items-center w-full mt-10">
					<div className="w-full items-left">
						<h1 className="mt-4 mb-5 text-4xl font-bold text-Primary max-w-4/5">
							Recent News and Articles
						</h1>
					</div>
					<ArticlesCarousel />
					<Button onClick={() => navigate("/user/news")}>
						Click here to browse all news.
					</Button>
				</div>

				{/* Upcoming Events Section */}
				<section className="flex flex-col mt-15">
					<h1 className="text-4xl font-bold text-Primary">Upcoming Events</h1>
					{/* Small Event Cards Container */}
					<div className="flex flex-col mt-5 space-y-5">
						{isLoading ? (
							<>
								<CardSkeleton variant="event" />
								<CardSkeleton variant="event" />
								<CardSkeleton variant="event" />
							</>
						) : (
							allEvents.slice(0, 3).map((event) => (
								<div onClick={() => navigate(`/user/events/${event._id}`)}>
									<EventCardSmall key={event._id} {...event} />
								</div>
							))
						)}
					</div>
					{/* See more button */}
					<Button onClick={() => navigate("/user/events")}>
						Click to see more
					</Button>
				</section>

				{/* Donation Cards Section */}
				<section className="flex flex-col mt-15">
					<h1 className="text-4xl font-bold text-Primary">Donate Now</h1>
					{/* Donation Cards Container */}
					<div className="flex flex-col mt-5 space-y-5">
						{isLoading ? (
							<>
								<DonationCardSkeleton />
								<DonationCardSkeleton />
							</>
						) : (
							allDonations.slice(0, 2).map((donation) => (
								<DonateCard key={donation._id} {...donation} />
							))
						)}
					</div>

					{/* See more button */}
					<Button onClick={() => navigate("/user/donate")}>
						Click to see more
					</Button>
				</section>

				<h1 className="text-4xl font-bold text-Primary mt-15">
					Recent Job
					<br />
					Postings
				</h1>
				<div className="flex flex-col gap-3 my-4">
					{isLoading ? (
						<>
							<JobCardSkeleton />
							<JobCardSkeleton />
						</>
					) : (
						allJobs.slice(0, 2).map((job, index) => (
							<div
								key={index}
								onClick={() => navigate(`/user/jobs?id=${job._id}`)}
								className="cursor-pointer"
							>
								<JobPostingCard
									job={job}
									isSelected={false}
									isRecent={false}
									isSaved={isJobSaved(job._id)}
								/>
							</div>
						))
					)}
				</div>
				{/* See more button */}
				<Button
					onClick={() => {
						navigate("/user/jobs");
					}}
				>
					Click to see more
				</Button>
			</div>

			{/* ============================== Desktop HomePage Layout ============================== */}
			<div className="flex-col hidden lg:flex bg-Tertiary">
				<DesktopNavbar activePage="Home" />

				{/* 3 columns for layout */}
				<div className="flex justify-center w-full">
					<div className="flex justify-between my-[4rem] gap-4 max-w-[1080px]">
						{/* left column */}
						<div className="flex flex-col flex-shrink-0 gap-4 w-[20%] min-w-[200px]">
							{/* user profile block */}
							<div className="w-full overflow-hidden bg-white rounded-xl border-1 border-Primary/20 h-50">
								{isLoading ? (
									<CardSkeleton variant="profile" />
								) : (
									<MiniProfileBox />
								)}
							</div>
							{/* RSVPed Events block */}
							{/* <div className="flex flex-col w-full gap-5 p-4 bg-white rounded-xl border-1 border-Primary/20 text-Primary">
								<h1 className="text-xl font-bold">RSVPed Events</h1>

								{/* skeleton when loading for events that are rsvped by the user */}
								{/* {isLoading ? (
									<CardSkeleton variant="event" /> 
								) : (
									<>
										<h3 className="text-xs font-bold">There is nothing here.</h3>
										<Link
											to="/user/events"
											className="text-xs font-bold underline underline-offset-2"
										>
											View events here.
										</Link>
									</>
								)} */}
							{/* </div> */} 
							{/* bookmarks block */}
							<div className="w-full p-4 text-xs font-bold bg-white rounded-xl border-1 border-Primary/20 text-Primary">
								{/* button to saved jobs */}
								<Link
									to="/user/jobs?tab=saved"
									className="flex items-center gap-1 py-1 rounded-lg hover:bg-gray-100"
								>
									<Bookmark style={{ fill: "--color-Primary" }} />
									<span>Saved Jobs</span>
								</Link>
								{/* button to user's donations */}
								{/* <Link
									to=""
									className="flex items-center gap-1 py-1 rounded-lg hover:bg-gray-100"
								>
									<Bookmark style={{ fill: "--color-Primary" }} />
									<span>My Donations</span>
								</Link> */}
							</div>
							<ICSFooter />
						</div>

						{/* middle column */}
						<div className="flex flex-col gap-4 flex-grow basis-[50%] min-w-[300px]">							{/* Recent News and Articles section */}
							<div className="flex flex-col items-center w-full p-6 bg-white rounded-xl border-1 border-Primary/20">
								<h1 className="self-start mb-5 text-3xl font-bold text-Primary">
									Recent News and Articles
								</h1>
								<div className="">
									{isLoading ? (
										<div className="flex flex-col gap-4 w-full">
											<CardSkeleton variant="article" />
											
										</div>
									) : (
										<ArticlesCarousel />
									)}
								</div>
								<Button onClick={() => navigate("/user/news")}>
									Click here to browse all news
								</Button>
							</div>
							{/* Donate Now section */}
							<div className="w-full p-6 bg-white rounded-xl border-1 border-Primary/20">
								<h1 className="mb-3 text-3xl font-bold text-Primary">
									Donate Now
								</h1>
								{/* Donation Cards Container */}
								<div className="flex flex-col space-y-5">
									{isLoading ? (
										<>
											<DonationCardSkeleton />
											<DonationCardSkeleton />
										</>
									) : (
										allDonations.slice(0, 2).map((donation) => (
											<DonateCard key={donation._id} {...donation} />
										))
									)}
								</div>
								{/* See more button */}
								<Button onClick={() => navigate("/user/donate")}>
									See more
								</Button>
							</div>
						</div>

						{/* right column */}
						<div className="flex flex-col gap-4 flex-shrink-0 w-[30%] min-w-[250px]">							{/* Upcoming Events section */}
							<div className="flex flex-col items-center w-full p-6 bg-white rounded-xl border-1 border-Primary/20">
								<h1 className="self-start mb-5 text-3xl font-bold text-Primary">
									Upcoming Events
								</h1>
								{/* Small Event Cards Container */}
								<div className="flex flex-col w-full space-y-5">
									{isLoading ? (
										<>
											<CardSkeleton variant="event" />
											<CardSkeleton variant="event" />
											<CardSkeleton variant="event" />
										</>
									) : (
										allEvents.slice(0, 3).map((event) => (
											<div
												key={event._id}
												onClick={() => navigate(`/user/events/${event._id}`)}
												className="cursor-pointer"
											>
												<EventCardSmall {...event} />
											</div>
										))
									)}
								</div>
								{/* See more button */}
								<Button onClick={() => navigate("/user/events")}>
									See more
								</Button>
							</div>
							{/* Recent Job Postings sections */}
							<div className="flex flex-col items-center w-full p-6 bg-white rounded-xl border-1 border-Primary/20">
								<h1 className="self-start mb-5 text-3xl font-bold text-Primary">
									Recent Job Postings
								</h1>
								<div className="flex flex-col w-full gap-3">
									{isLoading ? (
										<>
											<JobCardSkeleton />
											<JobCardSkeleton />
										</>
									) : (
										allJobs.slice(0, 2).map((job, index) => (
											<div
												key={index}
												onClick={() => navigate(`/user/jobs?id=${job._id}`)}
												className="cursor-pointer"
											>
												<JobPostingCard
													job={job}
													isSelected={false}
													isRecent={false}
													isSaved={isJobSaved(job._id)}
												/>
											</div>
										))
									)}
								</div>
								{/* See more button */}
								<Button onClick={() => navigate("/user/jobs")}>See more</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

/**
 * A foodter for the desktop view of the HomePage.
 * @returns a component that displays the address and contacts of ICS. Clicking on the email address prompts to send email. Also displays the logos.
 */
const ICSFooter = () => {
	const ICS: string = "Institute of Computer Science";
	const address: string =
		"Institute of Computer Science\nCollege of Arts and Sciences, UPLB\nLos Baños Laguna, Philippines 4031";
	const contactInfo: string = "(049) 536 2302 63-49-536-2302";
	const emailAddress: string = "ics.uplb@up.edu.ph";
	return (
		<div className="flex flex-col items-start px-3 text-xs text-Primary">
			<h4 className="font-bold">{ICS}</h4>
			<br />
			<h4 className="font-bold">Address:</h4>
			<h4 style={{ whiteSpace: "pre-line" }}>{address}</h4>
			<br />
			<h4 className="font-bold">Contact:</h4>
			<h4>{contactInfo}</h4>
			{/* clicking on email address prompts to send email */}
			<a href={`mailto:${emailAddress}`}>
				<h4>{emailAddress}</h4>
			</a>
			<br />
			<div className="flex h-10 gap-1">
				<a href="https://uplb.edu.ph/" rel="noopener noreferrer">
					<img src={UPLogo} className='h-full aspect-square' />
				</a>
				<a href="https://ics.uplb.edu.ph/" rel="noopener noreferrer">
					<img src={ICSLogo} className='h-full aspect-square' />
				</a>
				<img src={ReConnectLogo} className='h-full aspect-square' />
			</div>
		</div>
	);

};

export default UserHomepage;
