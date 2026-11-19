// About page
import React from "react";
import Logo from "../assets/logos/logo.png";
import Footer from "../components/auth/Footer";

const AboutPage: React.FC = () => {
  return (
    <div className="  min-h-screen flex flex-col items-center">
      {/* Top Banner Image */}
      <div className="w-full h-[400px] overflow-hidden flex justify-center -mt-30">
        <img
          src="https://www.lnds.lu/wp-content/themes/lnds-2023/public/images/default_header_image.5e62c7.png"
          alt="Network Background"
          className="h-full object-cover"
        />
      </div>

      <div className=" text-center max-w-4xl px-4 pt-20 -mt-34">
        <img
          src={Logo}
          alt="Re:Connect Logo"
          className="mx-auto mb-8 w-20 h-20"
        />

        <h1 className="text-5xl text-primary mb-6">About Re:Connect</h1>
        <p className="text-md text-color-BlackText mb-16">
          Welcome to <span className="font-regular">Re:Connect</span>, the
          official alumni engagement and career networking platform of the
          Institute of Computer Science (ICS), University of the Philippines Los
          Baños. Built for the ICS community, Re:Connect empowers alumni to
          maintain strong ties, discover career opportunities, and give back
          through events, mentorship, and donations — all within one unified
          platform.
        </p>

        <section className="mb-24">
          <h2 className="text-3xl font-regular text-primary mb-4">Vision</h2>
          <p className="text-sm text-color-BlackText">
            To foster a thriving, connected, and empowered community of ICS
            alumni worldwide.
          </p>
        </section>

        <section className="mb-24">
          <h2 className="text-3xl font-regular text-primary mb-4">Mission</h2>
          <p className="text-sm text-color-BlackText">
            To centralize ICS alumni data and networking, enabling career
            growth, event participation, and alumni-driven initiatives through a
            secure, accessible, and dynamic platform.
          </p>
        </section>

        <section className="mb-24">
          <h2 className="text-3xl font-regular text-primary mb-4">
            Who Are We?
          </h2>
          <p className="text-sm text-color-BlackText mb-4">
            Re:Connect was envisioned under the leadership of Asst. Prof. John
            Patrick VJ. Albacea and developed by a team of passionate Computer
            Science students. Its goal: to provide a dedicated platform where
            ICS alumni can stay informed, grow professionally, and continue
            contributing to the legacy of ICS.
          </p>
          <p className="text-sm text-color-BlackText mb-4">
            Starting from the idea of organizing a fragmented alumni network
            previously relying on third-party platforms like Facebook Groups,
            Re:Connect launched to offer official job postings, events,
            donations, newsletters, and alumni records management — all in one
            place.
          </p>
          <p className="text-sm text-color-BlackText">
            Today, Re:Connect strengthens alumni relations and career
            opportunities, managed under the stewardship of the ICS Alumni
            Committee and future-proofed for generations of ICS graduates to
            come.
          </p>
        </section>

        <section className="mb-24">
          <h2 className="text-3xl font-regular text-primary mb-4">
            What We Offer
          </h2>
          <ul className="list-none space-y-4 text-sm text-color-BlackText">
            <li>
              <span className="font-regular">Alumni Records Management:</span>{" "}
              Maintain your profile and stay connected with fellow alumni.
            </li>
            <li>
              <span className="font-regular">Career Network:</span> Discover job
              opportunities or share openings with other ICS alumni.
            </li>
            <li>
              <span className="font-regular">Events and Reunions:</span> RSVP,
              propose, and attend alumni events organized by ICS.
            </li>
            <li>
              <span className="font-regular">Donation Drives:</span> Support
              scholarships, events, and lab initiatives through verified
              donation campaigns.
            </li>
            <li>
              <span className="font-regular">Community Engagement:</span>{" "}
              Receive newsletters, announcements, and institutional updates
              directly from ICS.
            </li>
          </ul>
        </section>

        <div className="text-center mt-16">
          <p className="text-5xl font-light text-secondary mb-8">
            Powered by our community, built for our future. Welcome home, ICS
            alumni.
          </p>
        </div>
        <div className="flex w-full">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
