import React, { useState, useEffect, useRef } from "react";
import Textfield from "../../components/Textfield";
import Button from "../../components/Button";
import UserNavbar from "../../components/UserNavbar";
import CalendarComponent from "../../components/admin_components/AdminCalendarButton";
import { useLocation, useNavigate } from "react-router-dom";
import DonationProps from "../../types/donation";
import { Gift, Target, MapPin, Users, Minus, Image as Upload, ArrowLeft } from "lucide-react";
import { FormNavigationState_Donation } from "./AdminDonationsPage";

interface AdminDonationFormPageProps {
    donation?: DonationProps;
};

const AdminDonationFormPage: React.FC<AdminDonationFormPageProps> = ({ donation }) => {
    // const {user} = useAuthContext();
    const navigate = useNavigate();
    const reactLocation = useLocation();
    const state = reactLocation.state as FormNavigationState_Donation;
    const donationId = state.donationId ?? "";
    const donationDetails = state.donationDetails ?? null;
    const isEdit = state.isEdit ?? false;
    const fileInputRef = useRef<HTMLInputElement>(null);

    // form state
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [targetFunds, setTargetFunds] = useState<number>(0);
    const [beneficiaries, setBeneficiaries] = useState<string[]>([]);
    const [donationType, setDonationType] = useState<"monetary" | "non-monetary">("monetary");
    const [previewImage, setPreviewImage] = useState<string>("");
    const [, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        if (state?.donationDetails) {
            const { donationDetails } = state;
            setTitle(donationDetails.title || "");
            setDescription(donationDetails.description || "");
            setLocation(donationDetails.location || "");
            setEndDate(donationDetails.end_date ? new Date(donationDetails.end_date) : null);
            setTargetFunds(donationDetails.target_funds || 0);
            setBeneficiaries(donationDetails.beneficiaries || []);
            setDonationType(donationDetails.donationType || "monetary");
            setPreviewImage(donationDetails.imageURL || "");
        } else if (donation) {
            setTitle(donation.title || "");
            setDescription(donation.description || "");
            setLocation(donation.location || "");
            setEndDate(donation.end_date ? new Date(donation.end_date) : null);
            setTargetFunds(donation.target_funds || 0);
            setBeneficiaries(donation.beneficiaries || []);
            setDonationType(donation.donationType || "monetary");
            setPreviewImage(donation.imageURL || "");
        }
    }, [state, donation]);

    // image upload handler
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // beneficiary functions
    const addBeneficiary = () => {
        setBeneficiaries([...beneficiaries, ""]);
    };
    
    const removeBeneficiary = (index: number) => {
        const updatedBeneficiaries = beneficiaries.filter((_, i) => i !== index);
        setBeneficiaries(updatedBeneficiaries);
    };
    
    const updateBeneficiary = (index: number, value: string) => {
        const updatedBeneficiaries = [...beneficiaries];
        updatedBeneficiaries[index] = value;
        setBeneficiaries(updatedBeneficiaries);
    };

// form submission handler
const handleForm = async () => {
    try {
        // * Real Form data
        var formData = {
            title: title,
            description: description,
            location: location,
            end_date: endDate || new Date(new Date().setMonth(new Date().getMonth()+1)),
            beneficiaries: beneficiaries.filter(b => b.trim() !== ""),
            target_funds: targetFunds,
            donationType: donationType,
            imageURL: previewImage || state?.donationDetails?.imageURL || "",
        };

        console.log("Got formData: ", formData);
        
        // ? Hardcoded test data 
        // formData = {
        //     title: "Relief Goods for Flood Victims (Updated)",
        //     description: "Updated: We are collecting non-perishable goods for affected families",
        //     location: "Laguna, Philippines (Updated)",
        //     end_date: new Date("2024-04-20"), // Updated end date
        //     beneficiaries: ["64f7f70fa303f2aee836fde1", "64f7f70fa303f2aee836fde2"], // Added beneficiaries
        //     target_funds: 50000, // Added target funds
        //     donationType: "non-monetary",
        //     imageURL: "https://example.com/images/relief-drive-updated.jpg",
        // };
        
  
      // If editing an existing donation
      if (state?.donationId || donation?._id) {
        const donationId = state?.donationId || donation?._id;

        // TODO: remove this after testing
        // const donationId = "67f7f70fa303f2aee836fde2";

        console.log(`API URL: ${import.meta.env.VITE_API_URL}`);
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/donation/${donationId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: "include",
        
          body: JSON.stringify(formData)
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to update donation');
        }
  
        const updatedDonation = await response.json();
        console.log('Donation updated:', updatedDonation);
      }
      
    //   todo: remove after testing
      navigate('/admin/donations');

      // Navigate with the updated data
    //   navigate('/admin/donations', {
    //     state: {
    //       newDonation: {
    //         _id: generateDonationId(),
    //         created_at: state?.donationDetails?.created_at || new Date(),
    //         updated_at: new Date(),
    //         created_by: state?.donationDetails?.created_by || "admin",
    //         ...formData,
    //         raised_funds: state?.donationDetails?.raised_funds || 0,
    //         donorId_list: state?.donationDetails?.donorId_list || []
    //       },
    //       isEdit: !!state?.donationId || !!donation?._id
    //     } 
    //   });

    
    } catch (error : any) {
      console.error('Error updating donation:', error);
      alert(error.message || 'Failed to save donation');
    }
  };

    return (
        <div className="flex flex-col items-center justify-between min-h-screen bg-white">
            <div className="w-full text-Primary bg-base-100 px-5 py-2 mb-16 rounded-2xl max-w-2xl md:max-w-3xl lg:max-w-4xl">
                <div className="flex py-8 gap-3 items-center">
                    <ArrowLeft className="text-Primary" onClick={() => navigate(-1)}/>
                    <h1 className="font-bold text-3xl">{isEdit ? "Edit Donation Cause" : "Create Donation Cause"}</h1>
                    {isEdit ? "" : <p className="text-sm">Fill out the form below to create a new donation cause for alumni and students to contribute to.</p>}
                </div>
                
                <div className="flex flex-col pb-8">
                    {/* image upload */}
                    <div className="mb-4">
                        <label className="font-medium text-sm text-Label">Cause Image</label>
                        <div className="flex items-center gap-4 mt-2">
                            {(previewImage || state?.donationDetails?.imageURL) && (
                                <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                                    <img 
                                        src={previewImage || state?.donationDetails?.imageURL} 
                                        alt="Cause preview" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            <Button 
                                onClick={triggerFileInput}
                                variant="minor"
                                className="flex items-center gap-2 text-Primary bg-black"
                            >
                                <Upload size={16} />
                                {(previewImage || state?.donationDetails?.imageURL) ? "Change Image" : "Upload Image"}
                            </Button>
                        </div>
                    </div>

                    <h4 className="text-lg font-bold">Cause Details</h4>
                    
                    <div className="w-full mt-4">
                        <label className="font-medium text-sm text-Label">Cause Title*</label>
                        <Textfield
                            label=""
                            type="text"
                            placeholder="Cause Title"
                            value={title}
                            icon={<Gift size={20} className="text-Label" />}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    
                    <div className="pb-4 mt-4">
                        <label htmlFor="description" className="font-medium text-sm text-Label">Cause Description*</label>
                        <textarea 
                            id="description" 
                            className="w-full min-h-32 p-3 border border-[#A9C1DE] rounded-3xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                            placeholder="Describe the cause in detail" 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>
                    
                    <div className="pb-4 mt-4">
                        <CalendarComponent 
                            label="End Date*" 
                            placeholder="Pick an end date" 
                            onDateChange={(date) => setEndDate(date)} 
                            value={endDate}
                        />
                    </div>
                    
                    <div className="w-full mt-4">
                        <label className="font-medium text-sm text-Label">Location (Optional)</label>
                        <Textfield
                            label=""
                            type="text"
                            placeholder="Location if applicable"
                            value={location}
                            icon={<MapPin size={20} className="text-Label" />}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                    
                    <div className="mt-4">
                        <label className="font-medium text-sm text-Label">Beneficiaries</label>
                        {beneficiaries.map((beneficiary, index) => (
                            <div key={index} className="relative w-full mt-2">
                                <Textfield 
                                    label="" 
                                    type="text" 
                                    placeholder="Beneficiary name or description" 
                                    value={beneficiary} 
                                    icon={<Users size={20} className="text-Label" />} 
                                    onChange={(e) => updateBeneficiary(index, e.target.value)} 
                                />
                                {index > 0 && (
                                    <Minus 
                                        size={20} 
                                        className="absolute right-3 inset-y-0 my-auto text-Label cursor-pointer" 
                                        onClick={() => removeBeneficiary(index)} 
                                    />
                                )}
                            </div>
                        ))}
                        <div className="mt-2">
                            <Button onClick={addBeneficiary} variant="minor" className="text-Primary bg-black">
                                + ADD BENEFICIARY
                            </Button>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <label className="font-medium text-sm text-Label">Donation Type*</label>
                        <div className="flex gap-4 mt-2">
                            <Button 
                                variant={donationType === "monetary" ? "major" : "minor"} 
                                className="flex-1"
                                onClick={() => setDonationType("monetary")}
                            >
                                Monetary
                            </Button>
                            <Button 
                                variant={donationType === "non-monetary" ? "major" : "minor"} 
                                className="flex-1"
                                onClick={() => setDonationType("non-monetary")}
                            >
                                Non-Monetary
                            </Button>
                        </div>
                    </div>
                    
                    {donationType === "monetary" && (
                        <div className="pb-4 mt-4">
                            <label className="font-medium text-sm text-Label">Target Funds (PHP)*</label>
                            <Textfield
                                label=""
                                type="number"
                                placeholder="Target amount in PHP"
                                value={targetFunds.toString()}
                                icon={<Target size={20} className="text-Label" />}
                                onChange={(e) => setTargetFunds(Number(e.target.value))}
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4">
                    <Button 
                        onClick={() => window.history.back()}
                        variant="minor"
                        className="border border-Primary text-Primary"
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleForm} variant="major">
                        {state?.donationDetails || donation ? "Save Changes" : "Create Cause"}
                    </Button>
                </div>
            </div>
            
            <div className="mt-8">
                <UserNavbar activePage='AdminDonationForm'/>
            </div>
        </div>
    );
};

export default AdminDonationFormPage;