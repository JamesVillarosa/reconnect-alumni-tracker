import React, { JSX, useEffect, useState } from "react";
import ImageInputButton from "../../components/ImageInputButton";
import { Check, X, Plus, Trash } from "lucide-react";
import Checkbox from "../../components/Checkbox";
import { useLocation, useNavigate } from "react-router-dom";
import UserMultiStepForm from "./UserMultiStepForm";
import { AnimatePresence, motion } from "framer-motion";
import { toastPromise } from "../utils/ToastFxn";
import MultiSelector from "../../components/MultiSelector";
import InputField from "../../components/InputField";
import { useInputErrors } from "../utils/InputError";

const UserRequestsPage: React.FC = () => {
  const [request, setRequest] = useState<string>("Alumnus Information");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccessful, setIsSuccessful] = useState<boolean>(false);
  const [formTitle, setFormTitle] = useState<string>("Request");
  const [steps, setSteps] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState<number>(3);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [organizers, setOrganizers] = useState<
    { id: string; name: string; email: string }[]
  >([{ id: crypto.randomUUID(), name: "", email: "" }]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [eventDate, setEventDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [location, setLocation] = useState<string>("");
  const [beneficiaries, setBeneficiaries] = useState<
    { id: string; name: string }[]
  >([{ id: crypto.randomUUID(), name: "" }]);
  const [donationType, setDonationType] = useState<string[]>(["Monetary"]);
  const [targetAmount, setTargetAmount] = useState<string>("0");
  const [items, setItems] = useState<
    { id: string; name: string; quantity: string }[]
  >([]);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const { errors, setFieldError, clearFieldError, clearAllErrors } =
    useInputErrors();

  // navigation
  const navigate = useNavigate();
  const url = useLocation();

  // reset form
  const resetForm = () => {
    setActiveStep(0);
    setName("");
    setEmail("");
    setLocation("");
    setRequest("Alumnus Information");
    setOrganizers([{ id: crypto.randomUUID(), name: "", email: "" }]);
    setTitle("");
    setDescription("");
    setEventDate(undefined);
    setEndDate(undefined);
    setBeneficiaries([]);
    setDonationType(["Monetary"]);
    setTargetAmount("");
    setItems([]);
    setAgreementChecked(false);
    setFile(null);
    setIsLoading(false);
    setIsSuccessful(false);
    clearAllErrors();
  };

  useEffect(() => {
    // Function to determine what title should be shown in the form
    const getFormDetails = () => {
      const pathname = url.pathname;

      if (pathname.includes("request")) {
        if (pathname.includes("event")) {
          setRequest("Event Creation");
          setFormTitle("Request for Event Creation");
          setSteps(["Organizer Information", "Event Information"]);
        } else if (pathname.includes("info")) {
          setRequest("Alumnus Information");
          setFormTitle("Request for Alumnus Information");
          setSteps(["Recipient Information", "Full Details"]);
        } else if (pathname.includes("donation-cause")) {
          setRequest("Donation Cause Creation");
          setFormTitle("Request for Cause Creation");
          setSteps([
            "Organizer Information",
            "Cause Information",
            "Donations",
            "Beneficiaries",
          ]);
        }
      }
    };

    resetForm();
    getFormDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // Adds an organizer
  const handleAddOrganizer = () => {
    setOrganizers([
      ...organizers,
      { id: crypto.randomUUID(), name: "", email: "" },
    ]);
  };

  // Handles changing organizer name
  const handleChangeOrganizer = (
    index: number,
    field: "name" | "email",
    value: string
  ) => {
    const updated = [...organizers];
    updated[index][field] = value;
    setOrganizers(updated);
  };

  // Removes an organizer by id
  const removeOrganizer = (id: string) => {
    setOrganizers((prev) => prev.filter((org) => org.id !== id));
  };

  // Adds beneficiary
  const handleAddBeneficiary = () => {
    setBeneficiaries([...beneficiaries, { id: crypto.randomUUID(), name: "" }]);
  };

  // Updates value in beneficiary element
  const handleChangeBeneficiary = (index: number, value: string) => {
    const updated = [...beneficiaries];
    updated[index] = { ...updated[index], name: value };
    setBeneficiaries(updated);
  };

  // Removes a beneficiary by id
  const removeBeneficiary = (id: string) => {
    setBeneficiaries(beneficiaries.filter((b) => b.id !== id));
  };

  // Adds new item
  const handleAddItem = () => {
    setItems([...items, { id: crypto.randomUUID(), name: "", quantity: "" }]);
  };

  // Updates value of item instance
  const handleChangeItem = (
    index: number,
    field: "name" | "quantity",
    value: string
  ) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  // Removes a beneficiary by id
  const removeItem = (id: string) => {
    setItems(items.filter((b) => b.id !== id));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  // API Call - Submit Form
  const handleForm = async () => {
    const getISODate = (date: Date | undefined) => (date ? date : undefined);

    const buildFetchOptions = (payload: object): RequestInit => ({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const postData = async (url: string, payload: object) => {
      const response = await fetch(url, buildFetchOptions(payload));
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Something went wrong.");
      }
      return response;
    };

    try {
      setIsLoading(true);

      if (request === "Alumnus Information") {
        console.log(name, email, description);
        // You can implement actual logic later here
        setIsSuccessful(true);
        return;
      }

      let url = "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let payload: any = {};

      if (request === "Event Creation") {
        url = `${import.meta.env.VITE_API_URL}/events`;
        payload = {
          title,
          description,
          event_date: getISODate(eventDate),
          location,
          organizers,
          eventImageURL: file ? file.name : "",
        };
      }

      if (request === "Donation Cause Creation") {
        url = `${import.meta.env.VITE_API_URL}/donation`;
        payload = {
          title,
          description,
          end_date: getISODate(endDate),
          location,
          organizers,
          beneficiaries,
          donationImageURL: file ? file.name : "",
          status: "Active",
          commentId: "000000000000000000000000",
        };

        const isMonetary = donationType.includes("Monetary");
        const isInKind = donationType.includes("In-Kind");

        payload.allow_monetary = isMonetary;
        payload.allow_non_monetary = isInKind;

        if (isMonetary) {
          payload.target_funds = parseFloat(targetAmount);
        }

        if (isInKind) {
          payload.items = items.map((item) => ({
            name: item.name,
            quantity: parseInt(item.quantity),
            current_quantity: 0,
          }));
        }
      }

      await toastPromise(postData(url, payload), {
        loading: {
          title: "Submitting...",
          description: "Your request is being submitted.",
          type: "info",
        },
        success: {
          title: "Success!",
          description: "Request submitted successfully.",
          type: "success",
        },
        error: {
          title: "Failed!",
          description: "Something went wrong while submitting the form.",
          type: "error",
        },
      });

      setIsSuccessful(true);
    } catch (err) {
      console.error("Form submission error:", err);
      setIsSuccessful(false);
    } finally {
      setIsLoading(false);
      setActiveStep((prev) => prev + 1);
    }
  };

  /**
   * Functions to help validate the input fields
   */
  const validateAlumnStep = (step: number): boolean => {
    let isValid = true;

    switch (step) {
      case 0:
        if (!name.trim() || !email.trim()) {
          if (!name.trim())
            setFieldError("fullName", "Please enter your full name");
          if (!email.trim())
            setFieldError("email", "Please provide a valid email");

          isValid = false;
        }
        if (name.trim()) clearFieldError("fullName");
        if (email.trim()) clearFieldError("email");
        break;

      case 1:
        if (!description.trim() || !agreementChecked) {
          if (!description.trim())
            setFieldError(
              "description",
              "Please provide the description of your request"
            );
          if (!agreementChecked)
            setFieldError("agreement", "Please check the agreement first");
          isValid = false;
        }

        if (description.trim()) clearFieldError("description");
        if (agreementChecked) clearFieldError("agreement");
        break;

      default:
        break;
    }

    return isValid;
  };

  const validateEventStep = (step: number): boolean => {
    let isValid = true;
    let hasOrganizerError = false;

    switch (step) {
      case 0:
        // no organizer at all
        if (organizers.length === 0) {
          setFieldError("qualifications", "Add at least one organizer");
          isValid = false;
          break;
        }

        // validate each organizer's fields
        organizers.forEach((org) => {
          const nameKey = `fullName${org.id}`;
          const emailKey = `email${org.id}`;

          if (!org.name.trim()) {
            setFieldError(nameKey, "Name is required");
            hasOrganizerError = true;
            isValid = false;
          } else {
            clearFieldError(nameKey);
          }

          if (!org.email.trim()) {
            setFieldError(emailKey, "Email is required");
            hasOrganizerError = true;
            isValid = false;
          } else {
            clearFieldError(emailKey);
          }
        });

        // Only clear the general error if all individual fields are valid
        if (!hasOrganizerError) {
          clearFieldError("qualifications");
        }
        break;

      case 1:
        if (
          !title.trim() ||
          !location.trim() ||
          !description.trim() ||
          !eventDate ||
          !file
        ) {
          if (!title.trim())
            setFieldError("eventTitle", "Please provide the event title");
          if (!location.trim())
            setFieldError("location", "Please provide the event's location");
          if (!description.trim())
            setFieldError(
              "description",
              "Please provide the description of your event"
            );
          if (!agreementChecked)
            setFieldError("agreement", "Please check the agreement first");
          if (!eventDate)
            setFieldError("eventDate", "Please indicate the event date");
          if (!file)
            setFieldError("file", "Please upload an image for the event");
          isValid = false;
        }

        if (title.trim()) clearFieldError("eventTitle");
        if (location.trim()) clearFieldError("location");
        if (description.trim()) clearFieldError("description");
        if (eventDate) clearFieldError("eventDate");
        if (file) clearFieldError("file");
        if (agreementChecked) clearFieldError("agreement");
        break;

      default:
        break;
    }

    return isValid;
  };

  const validateCauseStep = (step: number): boolean => {
    let isValid = true;
    let hasOrganizerError = false;
    let hasBeneficiaryError = false;

    switch (step) {
      case 0:
        // no organizer at all
        if (organizers.length === 0) {
          setFieldError("qualifications", "Add at least one organizer");
          isValid = false;
          break;
        }

        // validate each organizer's fields
        organizers.forEach((org) => {
          const nameKey = `fullName${org.id}`;
          const emailKey = `email${org.id}`;

          if (!org.name.trim()) {
            setFieldError(nameKey, "Name is required");
            hasOrganizerError = true;
            isValid = false;
          } else {
            clearFieldError(nameKey);
          }

          if (!org.email.trim()) {
            setFieldError(emailKey, "Email is required");
            hasOrganizerError = true;
            isValid = false;
          } else {
            clearFieldError(emailKey);
          }
        });

        // Only clear the general error if all individual fields are valid
        if (!hasOrganizerError) {
          clearFieldError("qualifications");
        }
        break;

      case 1:
        if (
          !title.trim() ||
          !location.trim() ||
          !description.trim() ||
          !endDate ||
          !file
        ) {
          if (!title.trim())
            setFieldError("causeTitle", "Please provide the cause title");
          if (!location.trim())
            setFieldError("location", "Please provide the cause's location");
          if (!description.trim())
            setFieldError(
              "description",
              "Please provide the description of your cause"
            );
          if (!agreementChecked)
            setFieldError("agreement", "Please check the agreement first");
          if (!endDate)
            setFieldError("endDate", "Please indicate the cause's end date");
          if (!file)
            setFieldError("file", "Please upload an image for the cause");
          isValid = false;
        }

        if (title.trim()) clearFieldError("causeTitle");
        if (location.trim()) clearFieldError("location");
        if (description.trim()) clearFieldError("description");
        if (endDate) clearFieldError("endDate");
        if (file) clearFieldError("file");
        break;

      case 2:
        if (donationType.length < 1 || !targetAmount.trim()) {
          if (donationType.length < 1)
            setFieldError(
              "donationType",
              "Please indicate the donation type/s"
            );
          if (!location.trim())
            setFieldError("location", "Please provide the cause's location");
          if (!targetAmount.trim())
            setFieldError(
              "targetAmount",
              "Please provide the target monetary donation"
            );

          isValid = false;
        }

        if (donationType.includes("In-Kind")) {
          if (items.length < 1) {
            setFieldError("items", "Please add at least one item");
            isValid = false;
          } else {
            items.forEach((item) => {
              const nameKey = `itemName${item.id}`;
              const quantityKey = `quantity${item.id}`;

              if (!item.name.trim()) {
                setFieldError(nameKey, "Item name is required");
                isValid = false;
              } else {
                clearFieldError(nameKey);
              }

              if (!item.quantity.trim()) {
                setFieldError(quantityKey, "Quantity is required");
                isValid = false;
              } else {
                clearFieldError(quantityKey);
              }
            });
          }
        }

        if (donationType.length > 0) clearFieldError("donationType");
        if (targetAmount.trim()) clearFieldError("targetAmount");

        break;

      case 3:
        // no organizer at all
        if (beneficiaries.length === 0) {
          setFieldError("beneficiaries", "Add at least one beneficiary");
          isValid = false;
          break;
        }

        // validate each organizer's fields
        beneficiaries.forEach((bnf) => {
          const nameKey = `beneficiaryName${bnf.id}`;

          if (!bnf.name.trim()) {
            setFieldError(nameKey, "Name is required");
            hasBeneficiaryError = true;
            isValid = false;
          } else {
            clearFieldError(nameKey);
          }
        });

        // Only clear the general error if all individual fields are valid
        if (!hasBeneficiaryError) {
          clearFieldError("beneficiaries");
        }
        break;

      default:
        break;
    }

    return isValid;
  };

  // Function to help verify each step
  const validateStep = (step: number) => {
    if (url.pathname.includes("/requests/info")) return validateAlumnStep(step);
    else if (url.pathname.includes("/requests/event"))
      return validateEventStep(step);
    else if (url.pathname.includes("/requests/donation-cause"))
      return validateCauseStep(step);
    else return false;
  };

  /**
   * function to help render the proper fields for alumni info request
   * @returns
   */
  const renderAlumniInfo = (): JSX.Element | null => {
    switch (activeStep) {
      case 0:
        return (
          <section className="w-full px-6 py-3">
            <div className="flex flex-col gap-4">
              {/* Name */}
              <div className="w-full">
                <InputField
                  name="fullName"
                  label="Full name"
                  placeholder="Enter your full name"
                  value={name}
                  isRequired={true}
                  error={errors["fullName"]}
                  iconName="circle-user-round"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="w-full">
                <InputField
                  type="email"
                  name="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  value={email}
                  isRequired={true}
                  error={errors["email"]}
                  iconName="mail"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </section>
        );
      case 1:
        return (
          <section className="w-full px-6 py-3">
            <div className="flex flex-col gap-4">
              <div className="w-full">
                <InputField
                  name="description"
                  placeholder="Specify your request here"
                  label="What information are you requesting? Please specify the name/s
                  and details, if applicable."
                  rows={9}
                  value={description}
                  isRequired={true}
                  error={errors["description"]}
                  isTextArea={true}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="w-full">
                <Checkbox
                  label="I have read and agree to the Event Participation Terms &amp; Conditions and acknowledge that Re:Connect will use any information I provide in connection with future events. I also agree to adhere to the Re:Connect event code of conduct for my attendance at any Re:Connect event, both in-person and online."
                  checked={agreementChecked}
                  onChange={(e) => setAgreementChecked(e.target.checked)}
                  className="!flex !flex-row !items-start italic"
                />
              </div>
            </div>
          </section>
        );
      case 2:
        return (
          <section className="flex flex-col items-center justify-center w-full h-full text-center px-4 gap-4">
            {/* SUCCESSFUL */}
            {isSuccessful && (
              <>
                <div className="w-20 h-20 rounded-full text-Accent bg-green-100 flex items-center justify-center">
                  <Check size={50} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-Primary">
                    Request Sent Successfully!
                  </h2>
                  <p className="text-sm text-BlackText">
                    Thank you for submitting. Your request has been sent.
                  </p>
                </div>
              </>
            )}

            {/* FAIL */}
            {!isSuccessful && (
              <>
                <div className="w-20 h-20 rounded-full text-Error bg-red-100 flex items-center justify-center">
                  <X size={50} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-Error">
                    Request Failed!
                  </h2>
                  <p className="text-sm text-BlackText">
                    An error has occured. Your request was not sent.
                  </p>
                </div>
                <button
                  onClick={() => {}}
                  className="btn mt-2 bg-Error text-white px-4 py-2 rounded-xl hover:bg-red-400 transition"
                >
                  Retry
                </button>
              </>
            )}
          </section>
        );
      default:
        return null;
    }
  };

  /**
   * function to help render the proper fields for alumni info request
   * @returns
   */
  const renderEventInfo = (): JSX.Element | null => {
    switch (activeStep) {
      case 0:
        return (
          <section className="w-full px-6 py-3">
            <div className="flex flex-col">
              <div className="flex flex-col">
                <label className="font-medium text-sm text-Label">
                  Organizer/s<span className="text-error">*</span>
                </label>

                <div className="flex flex-col h-full w-full overflow-x-hidden overflow-y-hidden">
                  <AnimatePresence>
                    {organizers.map((org, idx) => (
                      <motion.div
                        key={org.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="w-full flex items-center justify-between overflow-y-hidden">
                          <span className="my-2">Organizer {idx + 1}</span>
                          {organizers.length > 1 && (
                            <Trash
                              size={36}
                              className="btn text-Error cursor-pointer h-full p-2 transition-colors duration-100 border-none bg-none hover:bg-Error/15 rounded-full"
                              onClick={() => removeOrganizer(org.id)}
                            />
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center w-full gap-4">
                          <InputField
                            name={`name${org.id}`}
                            placeholder="Name"
                            value={org.name}
                            isRequired={true}
                            error={errors["fullName" + org.id]}
                            iconName="circle-user-round"
                            className="w-full"
                            onChange={(e) =>
                              handleChangeOrganizer(idx, "name", e.target.value)
                            }
                          />
                          <InputField
                            name={`email${org.id}`}
                            placeholder="Email"
                            value={org.email}
                            isRequired={true}
                            error={errors["email" + org.id]}
                            iconName="mail"
                            className="w-full"
                            onChange={(e) =>
                              handleChangeOrganizer(
                                idx,
                                "email",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Add Button */}
                <button
                  className="flex mt-4 h-10 z-10 btn sticky bottom-3 rounded-3xl border-none bg-DarkBlue text-white hover:bg-Secondary"
                  onClick={handleAddOrganizer}
                >
                  <Plus size={21} />
                  Add organizer
                </button>
              </div>
            </div>
          </section>
        );
      case 1:
        return (
          <section className="w-full px-6 py-3">
            <div className="flex flex-col gap-4">
              {/* Title */}
              <div className="w-full">
                <InputField
                  label="Event Title"
                  name={"eventTitle"}
                  placeholder="Title"
                  value={title}
                  isRequired={true}
                  error={errors["eventTitle"]}
                  iconName="type"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Location */}
              <div className="w-full">
                <InputField
                  label="Location"
                  name={"location"}
                  placeholder="Location"
                  value={location}
                  isRequired={true}
                  error={errors["location"]}
                  iconName="map-pin"
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="w-full">
                <InputField
                  label="Description"
                  name={"description"}
                  placeholder="Place the event's full details here"
                  value={description}
                  isRequired={true}
                  error={errors["description"]}
                  isTextArea={true}
                  rows={9}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Date */}
              <div className="w-full">
                <InputField
                  label="Date"
                  type="date"
                  name={"date"}
                  value={eventDate ? eventDate.toISOString().split("T")[0] : ""}
                  isRequired={true}
                  error={errors["eventDate"]}
                  iconName="calendar"
                  iconPosition="right"
                  onChange={(e) => {
                    const dateStr = e.target.value;
                    setEventDate(dateStr ? new Date(dateStr) : undefined);
                  }}
                />
              </div>

              {/* Image */}
              <div className="w-full">
                <label className="font-medium text-sm text-Label">
                  Upload Image
                  <span className="text-error">*</span>
                </label>
                <ImageInputButton
                  id="eventDate"
                  onFileChange={handleFileChange}
                />
              </div>

              {/* <div className="w-full">
                <Checkbox
                  label="I have read and agree to the Event Participation Terms &amp; Conditions and acknowledge that Re:Connect will use any information I provide in connection with future events. I also agree to adhere to the Re:Connect event code of conduct for my attendance at any Re:Connect event, both in-person and online."
                  checked={agreementChecked}
                  onChange={(e) => setAgreementChecked(e.target.checked)}
                  className="!flex !flex-row !items-start italic"
                />
              </div> */}
            </div>
          </section>
        );
      case 2:
        return (
          <section className="flex flex-col items-center justify-center w-full h-full text-center px-4 gap-4">
            {/* SUCCESSFUL */}
            {isSuccessful && (
              <>
                <div className="w-20 h-20 rounded-full text-Accent bg-green-100 flex items-center justify-center">
                  <Check size={50} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-Primary">
                    Request Sent Successfully!
                  </h2>
                  <p className="text-sm text-BlackText">
                    Thank you for submitting. Your request has been sent.
                  </p>
                </div>
              </>
            )}

            {/* FAIL */}
            {!isSuccessful && (
              <>
                <div className="w-20 h-20 rounded-full text-Error bg-red-100 flex items-center justify-center">
                  <X size={50} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-Error">
                    Request Failed!
                  </h2>
                  <p className="text-sm text-BlackText">
                    An error has occured. Your request was not sent.
                  </p>
                </div>
                <button
                  onClick={() => {}}
                  className="btn mt-2 bg-Error text-white px-4 py-2 rounded-xl hover:bg-red-400 transition"
                >
                  Retry
                </button>
              </>
            )}
          </section>
        );
      default:
        return null;
    }
  };

  /**
   * function to help render the proper fields for donation cause request
   * @returns
   */
  const renderCauseInfo = (): JSX.Element | null => {
    switch (activeStep) {
      case 0:
        return (
          <section className="w-full px-6 py-3">
            <div className="flex flex-col gap-4">
              <label className="font-medium text-sm text-Label">
                Organizer/s<span className="text-error">*</span>
              </label>

              <AnimatePresence>
                {organizers.map((org, idx) => (
                  <motion.div
                    key={org.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-full flex items-center justify-between">
                      <span className="my-2">Organizer {idx + 1}</span>
                      {organizers.length > 1 && (
                        <Trash
                          size={36}
                          className="btn text-Error cursor-pointer h-full p-2 transition-colors duration-100 border-none bg-none hover:bg-Error/15 rounded-full"
                          onClick={() => removeOrganizer(org.id)}
                        />
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center w-full gap-4">
                      <InputField
                        name={`name${org.id}`}
                        placeholder="Name"
                        value={org.name}
                        isRequired={true}
                        error={errors["fullName" + org.id]}
                        iconName="circle-user-round"
                        className="w-full"
                        onChange={(e) =>
                          handleChangeOrganizer(idx, "name", e.target.value)
                        }
                      />
                      <InputField
                        name={`email${org.id}`}
                        placeholder="Email"
                        value={org.email}
                        isRequired={true}
                        error={errors["email" + org.id]}
                        iconName="mail"
                        className="w-full"
                        onChange={(e) =>
                          handleChangeOrganizer(idx, "email", e.target.value)
                        }
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add Button */}
              <button
                className="flex mt-4 h-10 z-10 btn sticky bottom-3 rounded-3xl border-none bg-DarkBlue text-white hover:bg-Secondary"
                onClick={handleAddOrganizer}
              >
                <Plus size={21} />
                Add organizer
              </button>
            </div>
          </section>
        );

      case 1:
        return (
          <section className="w-full px-6 py-3">
            <div className="flex flex-col gap-4">
              {/* Title */}
              <div className="w-full">
                <InputField
                  label="Cause Title"
                  name={"causeTitle"}
                  placeholder="Title"
                  value={title}
                  isRequired={true}
                  error={errors["causeTitle"]}
                  iconName="type"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Location */}
              <div className="w-full">
                <InputField
                  label="Location"
                  name={"location"}
                  placeholder="Location"
                  value={location}
                  isRequired={true}
                  error={errors["location"]}
                  iconName="map-pin"
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="w-full">
                <InputField
                  label="Description"
                  name={"description"}
                  placeholder="Place the event's full details here"
                  value={description}
                  isRequired={true}
                  error={errors["description"]}
                  isTextArea={true}
                  rows={9}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Date */}
              <div className="w-full">
                <InputField
                  label="End Date"
                  type="date"
                  name={"date"}
                  value={endDate ? endDate.toISOString().split("T")[0] : ""}
                  isRequired={true}
                  error={errors["endDate"]}
                  iconName="calendar"
                  iconPosition="right"
                  onChange={(e) => {
                    const dateStr = e.target.value;
                    setEndDate(dateStr ? new Date(dateStr) : undefined);
                  }}
                />
              </div>

              {/* Image */}
              <div className="w-full">
                <label className="font-medium text-sm text-Label">
                  Upload Image
                  <span className="text-error">*</span>
                </label>
                <ImageInputButton
                  id="causeDate"
                  onFileChange={handleFileChange}
                />
              </div>
            </div>
          </section>
        );

      case 2:
        return (
          <section className="w-full px-6 py-3">
            <div className="flex flex-col gap-4">
              <div className="w-full flex flex-col gap-2">
                <label className="font-medium text-sm text-Label">
                  Donation Type<span className="text-error">*</span>
                </label>
                <MultiSelector
                  label=""
                  options={["Monetary", "In-Kind"]}
                  values={donationType}
                  onSelect={(values) => setDonationType(values)}
                />
              </div>

              {/* Conditional Rendering based on Donation Type */}
              {donationType.includes("Monetary") && (
                <div className="w-full">
                  <InputField
                    type="number"
                    label="Target Amount"
                    name={"targetAmount"}
                    placeholder="Target Amount"
                    value={targetAmount}
                    isRequired={true}
                    error={errors["targetAmount"]}
                    iconName="philippine-peso"
                    onChange={(e) => setTargetAmount(e.target.value)}
                  />
                </div>
              )}

              {donationType.includes("In-Kind") && (
                <div className="flex flex-col w-full gap-3">
                  <label className="font-medium -mb-3 text-sm text-Label">
                    Target Items<span className="text-error">*</span>
                  </label>

                  <AnimatePresence>
                    {items.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="w-full flex items-center justify-between">
                          <span className="my-2">Item {idx + 1}</span>
                          {items.length > 1 && (
                            <Trash
                              size={36}
                              className="btn text-Error cursor-pointer h-full p-2 transition-colors duration-100 border-none bg-none hover:bg-Error/15 rounded-full"
                              onClick={() => removeItem(item.id)}
                            />
                          )}
                        </div>

                        <div className="flex sm:items-center w-full gap-4">
                          <InputField
                            name={`name${item.id}`}
                            placeholder="Item Name"
                            value={item.name}
                            isRequired={true}
                            error={errors["itemName" + item.id]}
                            className="w-full flex-9/12"
                            onChange={(e) =>
                              handleChangeItem(idx, "name", e.target.value)
                            }
                          />
                          <InputField
                            type="number"
                            name={`quantity${item.id}`}
                            placeholder="Quantity"
                            value={item.quantity}
                            isRequired={true}
                            error={errors["quantity" + item.id]}
                            className="w-full flex-3/12"
                            onChange={(e) =>
                              handleChangeItem(idx, "quantity", e.target.value)
                            }
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <button
                    className="flex mt-4 h-10 z-10 btn sticky bottom-3 rounded-3xl border-none bg-DarkBlue text-white hover:bg-Secondary"
                    onClick={handleAddItem}
                  >
                    <Plus size={21} />
                    Add item
                  </button>
                </div>
              )}
            </div>
          </section>
        );

      case 3:
        return (
          <section className="w-full px-6 py-3">
            <div className="flex flex-col gap-4">
              <label className="font-medium -mb-4 text-sm text-Label">
                Beneficiaries<span className="text-error">*</span>
              </label>

              {beneficiaries.map((beneficiary, idx) => (
                <div key={beneficiary.id}>
                  <div className="w-full flex items-center justify-between">
                    <span className="my-2">Beneficiary {idx + 1}</span>

                    {beneficiaries.length > 1 && (
                      <Trash
                        size={36}
                        className="btn text-Error cursor-pointer h-full p-2 transition-colors duration-100 border-none bg-none hover:bg-Error/15 rounded-full"
                        onClick={() => removeBeneficiary(beneficiary.id)}
                      />
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center w-full gap-4">
                    <InputField
                      name={`beneficiaryName${beneficiary.id}`}
                      placeholder="Name"
                      value={beneficiary.name}
                      isRequired={true}
                      error={errors["beneficiaryName" + beneficiary.id]}
                      iconName="circle-user-round"
                      className="w-full"
                      onChange={(e) =>
                        handleChangeBeneficiary(idx, e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}

              {/* Add Button */}
              <button
                className="flex mt-4 h-10 z-10 btn sticky bottom-3 rounded-3xl border-none bg-DarkBlue text-white hover:bg-Secondary"
                onClick={handleAddBeneficiary}
              >
                <Plus size={21} />
                Add beneficiary
              </button>
            </div>
          </section>
        );

      case 4:
        return (
          <section className="flex flex-col items-center justify-center w-full h-full text-center px-4 gap-4">
            {/* SUCCESSFUL */}
            {isSuccessful && (
              <>
                <div className="w-20 h-20 rounded-full text-Accent bg-green-100 flex items-center justify-center">
                  <Check size={50} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-Primary">
                    Request Sent Successfully!
                  </h2>
                  <p className="text-sm text-BlackText">
                    Thank you for submitting. Your request has been sent.
                  </p>
                </div>
              </>
            )}

            {/* FAIL */}
            {!isSuccessful && (
              <>
                <div className="w-20 h-20 rounded-full text-Error bg-red-100 flex items-center justify-center">
                  <X size={50} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-Error">
                    Request Failed!
                  </h2>
                  <p className="text-sm text-BlackText">
                    An error has occured. Your request was not sent.
                  </p>
                </div>
                <button
                  onClick={() => {}}
                  className="btn mt-2 bg-Error text-white px-4 py-2 rounded-xl hover:bg-red-400 transition"
                >
                  Retry
                </button>
              </>
            )}
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* <UserNavbar activePage="Events" />
      <DesktopNavbar activePage="Events" /> */}
      {/* <BackAndFontAndProfileHeader /> */}

      <div className="flex flex-col items-center justify-center h-screen w-full bg-linear-to-b from-Secondary from-10% to-Primary max-h-screen ">
        <div className="flex flex-col w-fit h-fit items-center rounded-3xl">
          {/* Navigation Buttons */}
          <div className="flex justify-center items-center w-fit rounded-2xl">
            <div className="flex flex-wrap gap-2">
              {[
                "Alumnus Information",
                "Event Creation",
                "Donation Cause Creation",
              ].map((option) => (
                <button
                  key={option}
                  className={`px-3 py-1.5 rounded-4xl text-xs sm:text-sm transition 
                            ${
                              request === option
                                ? "bg-Primary text-white"
                                : " text-Label bg-white hover:opacity-100"
                            }
                        `}
                  onClick={() => {
                    setRequest(option);
                    if (option === "Alumnus Information" && request !== option)
                      navigate("/user/requests/info");
                    if (option === "Event Creation" && request !== option)
                      navigate("/user/requests/event");
                    if (
                      option === "Donation Cause Creation" &&
                      request !== option
                    )
                      navigate("/user/requests/donation-cause");
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <UserMultiStepForm
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            validateStep={validateStep}
            onFormClose={() => {
              const pathname = url.pathname;

              if (pathname.includes("request")) {
                if (pathname.includes("event")) return navigate("/user/events");
                else if (pathname.includes("info")) return navigate("/user");
                else if (pathname.includes("donation-cause"))
                  return navigate("/user/donate");
              }
            }}
            navigateTo={() => navigate("/")}
            steps={steps}
            title={formTitle}
            isLoading={isLoading}
            isSuccessful={isSuccessful}
            onSubmit={() => {
              if (!validateStep(steps.length - 1)) return;
              handleForm();
            }}
            resetForm={() => {
              resetForm();
              setActiveStep(-1);
            }}
          >
            {/* Alumni Request Form */}
            {url.pathname.includes("/requests/info") && renderAlumniInfo()}

            {/* Event Creation Form */}
            {url.pathname.includes("/requests/event") && renderEventInfo()}

            {/* Donation Cause Creation Form */}
            {url.pathname.includes("/requests/donation-cause") &&
              renderCauseInfo()}
          </UserMultiStepForm>
        </div>
      </div>
    </>
  );
};

export default UserRequestsPage;
