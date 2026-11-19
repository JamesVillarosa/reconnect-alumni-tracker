// Privacy Policy page
import React from "react";
import Footer from "../components/auth/Footer";

const PrivacyPolicyPage: React.FC = () => {
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
          Privacy Policy
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
              <a href="#information" className="text-secondary hover:underline">
                2. Information We Collect
              </a>
            </li>
            <li>
              <a href="#usage" className="text-secondary hover:underline">
                3. How We Use Information
              </a>
            </li>
            <li>
              <a href="#sharing" className="text-secondary hover:underline">
                4. Sharing of Information
              </a>
            </li>
            <li>
              <a href="#security" className="text-secondary hover:underline">
                5. Data Security
              </a>
            </li>
            <li>
              <a href="#rights" className="text-secondary hover:underline">
                6. Your Rights
              </a>
            </li>
            <li>
              <a href="#updates" className="text-secondary hover:underline">
                7. Changes to this Privacy Policy
              </a>
            </li>
            <li>
              <a href="#contact" className="text-secondary hover:underline">
                8. Contact Us
              </a>
            </li>
          </ul>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-24 w-full mb-16">
          <section id="introduction" className="px-8">
            <h2 className="text-3xl text-primary mb-4">1. Introduction</h2>
            <p className="text-lg mb-4">
              Re:Connect respects your privacy. This Privacy Policy describes
              how we collect, use, and protect your personal data when you use
              our platform.
            </p>
            <p className="text-lg">
              By accessing Re:Connect, you agree to this Privacy Policy.
            </p>
          </section>

          <div className="border-t border-gray-300 w-full"></div>

          <section id="information" className="px-8">
            <h2 className="text-3xl text-primary mb-4">
              2. Information We Collect
            </h2>
            <p className="text-lg">
              We collect personal details such as your full name, email address,
              graduation year, employment information, donation history, and
              event participation. We also collect technical information such as
              device and browsing details.
            </p>
          </section>

          <div className="border-t border-gray-300 w-full"></div>

          <section id="usage" className="px-8">
            <h2 className="text-3xl text-primary mb-4">
              3. How We Use Information
            </h2>
            <p className="text-lg">
              We use your information to verify alumni status, provide
              networking services, facilitate event participation, manage
              donation drives, send newsletters, and maintain the platform's
              security and functionality.
            </p>
          </section>

          <div className="border-t border-gray-300 w-full"></div>

          <section id="sharing" className="px-8">
            <h2 className="text-3xl text-primary mb-4">
              4. Sharing of Information
            </h2>
            <p className="text-lg">
              We do not sell or rent your personal data. Information is shared
              only with authorized ICS personnel or as required by law. Alumni
              profiles may display limited public information unless privacy
              settings are adjusted.
            </p>
          </section>

          <div className="border-t border-gray-300 w-full"></div>

          <section id="security" className="px-8">
            <h2 className="text-3xl text-primary mb-4">5. Data Security</h2>
            <p className="text-lg">
              We implement industry-standard encryption (AES-256) to protect
              your data during storage and transmission. Security measures are
              regularly reviewed to prevent unauthorized access or breaches.
            </p>
          </section>

          <div className="border-t border-gray-300 w-full"></div>

          <section id="rights" className="px-8">
            <h2 className="text-3xl text-primary mb-4">6. Your Rights</h2>
            <p className="text-lg">
              You have the right to access, correct, or request deletion of your
              personal data. You may also manage your profile's visibility
              settings through your account dashboard.
            </p>
          </section>

          <div className="border-t border-gray-300 w-full"></div>

          <section id="updates" className="px-8">
            <h2 className="text-3xl text-primary mb-4">
              7. Changes to this Privacy Policy
            </h2>
            <p className="text-lg">
              We may modify this Privacy Policy from time to time. Changes will
              be posted on this page, and significant updates will be
              communicated via email or platform notification.
            </p>
          </section>

          <div className="border-t border-gray-300 w-full"></div>

          <section id="contact" className="px-8">
            <h2 className="text-3xl text-primary mb-4">8. Contact Us</h2>
            <p className="text-lg">
              If you have any questions or concerns regarding this Privacy
              Policy, please contact the ICS Alumni Committee through the
              official communication channels available within Re:Connect.
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

export default PrivacyPolicyPage;
