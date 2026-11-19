// User Agreement page
import React from "react";
import Footer from "../components/auth/Footer";

const UserAgreementPage: React.FC = () => {
  return (
    <div className="bg-base-100 min-h-screen flex flex-col items-center pt-16">
      {/* Top Banner */}
      <div className="w-full h-[400px] overflow-hidden flex justify-center -mt-40">
        <img
          src="https://www.lnds.lu/wp-content/themes/lnds-2023/public/images/default_header_image.5e62c7.png"
          alt="Network Background"
          className="h-full object-cover"
        />
      </div>

      {/* Page Content */}
      <div className="max-w-5xl w-full flex flex-col items-center">
        {/* Heading */}
        <h1 className="text-4xl text-primary mb-8 text-center">
          User Agreement
        </h1>

        {/* Table of Contents */}
        <div className="mb-12 px-8 w-full">
          <h2 className="text-2xl text-primary mb-4">Table of Contents</h2>
          <ul className="list-disc list-inside text-lg space-y-2">
            <li>
              <a
                href="#introduction"
                className="text-secondary hover:underline"
              >
                1. Introduction
              </a>
            </li>
            <li>
              <a href="#obligations" className="text-secondary hover:underline">
                2. Obligations
              </a>
            </li>
            <li>
              <a href="#rights" className="text-secondary hover:underline">
                3. Rights and Limits
              </a>
            </li>
            <li>
              <a href="#disclaimer" className="text-secondary hover:underline">
                4. Disclaimer and Limit of Liability
              </a>
            </li>
            <li>
              <a href="#termination" className="text-secondary hover:underline">
                5. Termination
              </a>
            </li>
            <li>
              <a href="#dispute" className="text-secondary hover:underline">
                6. Dispute Resolution
              </a>
            </li>
            <li>
              <a href="#general" className="text-secondary hover:underline">
                7. General Terms
              </a>
            </li>
            <li>
              <a href="#contact" className="text-secondary hover:underline">
                8. How to Contact Us
              </a>
            </li>
          </ul>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-24 w-full mb-16">
          <section id="introduction" className="px-8">
            <h2 className="text-3xl text-primary mb-4">1. Introduction</h2>
            <p className="text-lg mb-4">
              Re:Connect is the official alumni engagement and professional
              networking platform of the Institute of Computer Science (ICS) at
              the University of the Philippines Los Baños. This User Agreement
              governs your access to and use of Re:Connect.
            </p>
            <p className="text-lg">
              By registering or using Re:Connect, you agree to comply with this
              User Agreement.
            </p>
          </section>

          <div className="border-t border-gray-300 w-full"></div>

          <section id="obligations" className="px-8">
            <h2 className="text-3xl text-primary mb-4">2. Obligations</h2>
            <p className="text-lg mb-2 font-semibold">2.1 Eligibility</p>
            <p className="text-lg mb-4">
              Users must be verified ICS alumni or authorized administrative
              personnel. False information is prohibited.
            </p>
            <p className="text-lg mb-2 font-semibold">2.2 Account Security</p>
            <p className="text-lg mb-4">
              You are responsible for maintaining the confidentiality of your
              account credentials.
            </p>
            <p className="text-lg mb-2 font-semibold">2.3 Acceptable Use</p>
            <p className="text-lg">
              Re:Connect must be used solely for professional and alumni-related
              purposes.
            </p>
          </section>

          <div className="border-t border-gray-300 w-full"></div>

          <section id="rights" className="px-8">
            <h2 className="text-3xl text-primary mb-4">3. Rights and Limits</h2>
            <p className="text-lg mb-2 font-semibold">3.1 Content Ownership</p>
            <p className="text-lg mb-4">
              You retain ownership of the content you submit but grant
              Re:Connect rights to display and moderate it within the platform.
            </p>
            <p className="text-lg mb-2 font-semibold">3.2 Moderation Rights</p>
            <p className="text-lg">
              The ICS Alumni Committee may moderate, remove, or restrict content
              that violates platform policies.
            </p>
          </section>

          <div className="border-t border-gray-300 w-full"></div>

          <section id="disclaimer" className="px-8">
            <h2 className="text-3xl text-primary mb-4">
              4. Disclaimer and Limit of Liability
            </h2>
            <p className="text-lg">
              Re:Connect does not guarantee employment outcomes or external
              transaction success. ICS UPLB is not responsible for external
              dealings made through the platform.
            </p>
          </section>

          <div className="border-t border-gray-300 w-full"></div>

          <section id="termination" className="px-8">
            <h2 className="text-3xl text-primary mb-4">5. Termination</h2>
            <p className="text-lg">
              Re:Connect reserves the right to suspend or terminate user
              accounts for violations of this agreement or misconduct on the
              platform.
            </p>
          </section>

          <div className="border-t border-gray-300 w-full"></div>

          <section id="dispute" className="px-8">
            <h2 className="text-3xl text-primary mb-4">
              6. Dispute Resolution
            </h2>
            <p className="text-lg">
              Disputes related to this User Agreement shall be resolved in
              accordance with applicable laws of the Republic of the
              Philippines.
            </p>
          </section>

          <div className="border-t border-gray-300 w-full"></div>

          <section id="general" className="px-8">
            <h2 className="text-3xl text-primary mb-4">7. General Terms</h2>
            <p className="text-lg">
              Re:Connect may update this User Agreement at any time. Continued
              use of the platform indicates acceptance of the updated terms.
            </p>
          </section>

          <div className="border-t border-gray-300 w-full"></div>

          <section id="contact" className="px-8">
            <h2 className="text-3xl text-primary mb-4">8. How to Contact Us</h2>
            <p className="text-lg">
              For questions regarding this agreement, please contact the ICS
              Alumni Committee through the official channels provided in the
              platform.
            </p>
          </section>
        </div>
        <div className="flex w-full">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default UserAgreementPage;
