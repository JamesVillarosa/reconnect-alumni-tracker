import { ReactNode, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import FormStepper from "../../components/FormStepper";
import Button from "../../components/Button";

interface UserMultiStepFormProps {
  title: string;
  steps: string[];
  // highestStep: number;
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  // direction: number;
  // goToNextStep: () => void;
  // goToPrevStep: () => void;
  isLoading?: boolean;
  isSuccessful?: boolean;
  onFormClose?: () => void;
  navigateTo: () => void;
  children: ReactNode;
  onSubmit: () => void;
  resetForm: () => void;
  validateStep?: (step: number) => boolean;
}

const UserMultiStepForm: React.FC<UserMultiStepFormProps> = ({
  title,
  steps,
  activeStep,
  setActiveStep,
  isLoading = false,
  onFormClose,
  navigateTo,
  children,
  onSubmit,
  resetForm,
  validateStep,
}) => {
  const navigate = useNavigate();
  const url = useLocation();

  const [prevStep, setPrevStep] = useState<number>(0);
  const [highestStep, setHighestStep] = useState<number>(0);
  const direction = activeStep > prevStep ? 1 : -1;

  const goToNextStep = () => {
    setPrevStep(activeStep);
    setActiveStep((prev) => {
      const nextStep = prev + 1;

      setHighestStep((highest) => Math.max(highest, nextStep));

      return nextStep;
    });
  };

  const goToPrevStep = () => {
    setPrevStep(activeStep);
    setActiveStep((prev) => prev - 1);
  };

  // Variants for the animation
  const slideVariants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      position: "absolute",
    }),
    center: {
      x: 0,
      opacity: 1,
      position: "relative",
      transition: { duration: 0.3 },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      position: "absolute",
    }),
  };

  useEffect(() => {
    setHighestStep(0);
  }, [url]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full  max-h-screen">
      <div className="flex flex-col w-full h-full min-h-[780px] max-h-[780px] max-w-[720px] bg-white items-center justify-between p-3 sm:rounded-xl my-6">
        {/* Header */}
        <section className="mb-4 p-3 w-full text-Primary block max-w-[1080px]">
          <div className="flex flex-col gap-6 px-4">
            <div className="flex items-center gap-3 mt-5 text-lg ">
              <button
                onClick={() => {
                  if (onFormClose) onFormClose();
                  else navigate(-1);
                }}
              >
                <ArrowLeft
                  size={42}
                  className="p-1 transition-colors duration-100 rounded-full cursor-pointer text-Primary bg-FaintBlue hover:bg-DarkBlue"
                />
              </button>
              <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
            </div>
            <p className="my-1 text-sm font-normal">
              By submitting this application, you consent to the use of your
              email and contact number for future updates and communications.
            </p>
          </div>
        </section>

        {/* Stepper */}
        <div className="flex justify-center w-full">
          <FormStepper
            steps={steps}
            highestStep={highestStep}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
          />
        </div>

        {/* Step Content */}
        <div className="w-full h-full text-Primary bg-base-100 px-5 my-3 rounded-2xl flex justify-center relative overflow-x-hidden overflow-y-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeStep}
              variants={slideVariants}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
              className={`w-full justify-center ${
                isLoading ? "items-center" : ""
              } flex`}
            >
              {isLoading ? (
                <div className="loading loading-spinner loading-xl scale-125 flex h-fit overflow-hidden items-center justify-between  text-Primary"></div>
              ) : (
                children
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex w-full gap-3 p-3">
          {activeStep < steps.length ? (
            <>
              <span className="w-1/2">
                {activeStep > 0 && (
                  <button
                    className="w-full border-none btn bg-FaintBlue text-Primary rounded-xl"
                    onClick={goToPrevStep}
                  >
                    Back
                  </button>
                )}
              </span>
              <span className="!w-1/2">
                {activeStep < steps.length - 1 ? (
                  <button
                    className="w-full text-white border-none btn bg-Primary rounded-xl"
                    onClick={() => {
                      if (validateStep?.(activeStep)) {
                        console.log("HELLO");
                        goToNextStep();
                      }
                    }}
                  >
                    Next
                  </button>
                ) : (
                  <Button className="btn border-none !mt-0" onClick={onSubmit}>
                    Submit
                  </Button>
                )}
              </span>
            </>
          ) : (
            <>
              <span className="w-1/2">
                <button
                  className="w-full border-none btn bg-FaintBlue text-Primary rounded-xl"
                  onClick={() => {
                    resetForm();
                    goToNextStep();
                  }}
                >
                  Create Another
                </button>
              </span>
              <span className="w-1/2">
                <button
                  className="w-full text-white border-none btn bg-Primary rounded-xl"
                  onClick={navigateTo}
                >
                  View All
                </button>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserMultiStepForm;
