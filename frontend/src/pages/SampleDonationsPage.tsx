import React from "react";
import DonationProps from "../types/donation";
import MainDonationModal from "../components/modals/MainDonationModal";

/**
 * Temporary type definition for banking details
 * @todo Replace with a more comprehensive type from a shared types file
 */
type BankingDetails = {
  bdo: string;
  bpi: string;
  landbank: string;
  gcash: string;
  maya: string;
};

/**
 * Temporary type definition for banking details
 * @todo Replace with a more comprehensive type from a shared types file
 */
type DonationWithAdditionalDetails = DonationProps & {
  bankingDetails: BankingDetails;
  address: string;
  contactNumber: string;
};

const SampleDonationsPage: React.FC = () => {
  const donations: DonationWithAdditionalDetails[] = [
    {
      _id: "1",
      created_at: new Date(),
      updated_at: new Date(),
      title: "Help Build a School",
      description:
        "Join us in raising funds to build a school for underprivileged children.",
      donorId_list: ["donor1", "donor2", "donor3"],
      raised_funds: 5000,
      target_funds: 10000,
      bankingDetails: {
        bdo: "1234-5678-90",
        bpi: "2345-6789-01",
        landbank: "3456-7890-12",
        gcash: "09171234567",
        maya: "09181234567",
      },
      address: "Brgy. Maligaya, Nueva Ecija",
      contactNumber: "09190001111",
    },
    {
      _id: "2",
      created_at: new Date(),
      updated_at: new Date(),
      title: "Medical Aid for Families",
      description:
        "Support families in Los Banos that are in need of urgent medical assistance.",
      donorId_list: ["donor4", "donor5"],
      raised_funds: 3000,
      target_funds: 5000,
      bankingDetails: {
        bdo: "4567-8901-23",
        bpi: "5678-9012-34",
        landbank: "6789-0123-45",
        gcash: "09172222222",
        maya: "09182222222",
      },
      address: "Sitio Mabuhay, Los Banos, Laguna",
      contactNumber: "09220002222",
    },
    {
      _id: "3",
      created_at: new Date(),
      updated_at: new Date(),
      title: "Clean Water Initiative",
      description:
        "Help provide clean and safe drinking water to remote communities.",
      donorId_list: ["donor6"],
      raised_funds: 1500,
      target_funds: 2000,
      bankingDetails: {
        bdo: "7890-1234-56",
        bpi: "8901-2345-67",
        landbank: "9012-3456-78",
        gcash: "09173333333",
        maya: "09183333333",
      },
      address: "Brgy. Kalinisan, Zamboanga del Norte",
      contactNumber: "09330003333",
    },
  ];

  /**
   * Handles the donation button click
   * @param {string} donationId - The ID of the donation to support
   */
  const handleDonate = (donationId: string) => {
    const modalId = `main_donation_modal_${donationId}`;
    const modal = document.getElementById(modalId) as HTMLDialogElement;
    modal?.showModal();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sample Donations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {donations.map((donation) => (
          <div key={donation._id} className="border rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold">{donation.title}</h2>
            <p className="text-gray-600 text-sm mb-2">
              Created At: {donation.created_at.toDateString()}
            </p>
            <p className="text-gray-600 text-sm mb-2">
              Updated At: {donation.updated_at.toDateString()}
            </p>
            <p className="text-gray-600 text-sm mb-2">
              Donors: {donation.donorId_list.length}
            </p>
            <p className="text-gray-600 text-sm mb-2">
              Raised Funds: P{donation.raised_funds.toLocaleString()} / P
                {donation.target_funds ? donation.target_funds.toLocaleString() : "N/A"}
            </p>
            <p className="text-gray-800 mb-4">{donation.description}</p>
            <button
              onClick={() => handleDonate(donation._id)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Donate
            </button>
          </div>
        ))}
      </div>

      {/* Donation Modals */}
      <div className="fixed z-50">
        {donations.map((donation) => {
          return (
              <MainDonationModal donation={donation} />
          );
        })}
      </div>
    </div>
  );
};

export default SampleDonationsPage;
