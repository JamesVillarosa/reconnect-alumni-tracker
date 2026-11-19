import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import { styled } from "@mui/material/styles";
import { StepIconProps } from "@mui/material/StepIcon";
import React from "react";
import { CheckIcon } from "lucide-react";

const PRIMARY_COLOR = "#094FA1";
const UPCOMING_COLOR = "#78A8CA";

/**
 * Custom connector component that styles the line between steps.
 */
const CustomConnector = styled(StepConnector)(() => ({
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: UPCOMING_COLOR,
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

/**
 * Custom styled root for step icons based on their state (active, completed).
 */
const CustomStepIconRoot = styled("div")<{
  ownerState: { active?: boolean; completed?: boolean };
}>(({ ownerState }) => ({
  backgroundColor:
    ownerState.completed || ownerState.active ? PRIMARY_COLOR : UPCOMING_COLOR,
  zIndex: 1,
  color: "#fff",
  width: 24,
  height: 24,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  fontSize: 14,
}));

/**
 * Custom icon component used for each step in the Stepper.
 *
 * @param {StepIconProps} props - Props containing step state and icon.
 * @returns {JSX.Element} A styled icon component.
 */
const CustomStepIcon = ({ active, completed, icon }: StepIconProps) => (
  <CustomStepIconRoot ownerState={{ active, completed }}>
    {completed ? <CheckIcon size={16} /> : icon}
  </CustomStepIconRoot>
);

/**
 * Props for the FormStepper component.
 */
interface FormStepperProps {
  /** Array of step labels. */
  steps: string[];
  /** The highest step the user has reached. */
  highestStep: number;
  /** The currently active step index. */
  activeStep: number;
  /** Function to update the active step. */
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * A reusable form stepper component with clickable steps (up to the highest reached step),
 * customized icons, and connectors using Material UI.
 *
 * @param {FormStepperProps} props - The props for the FormStepper component.
 * @returns {JSX.Element} The rendered FormStepper component.
 */
const FormStepper: React.FC<FormStepperProps> = ({
  steps,
  highestStep,
  activeStep,
  setActiveStep,
}) => {
  return (
    <div className="flex justify-center w-full">
      <Box sx={{ width: "100%" }}>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          connector={<CustomConnector />}
        >
          {steps.map((label, index) => (
            <Step
              key={label}
              onClick={() => {
                if (index > highestStep) return;
                setActiveStep(index);
              }}
              className="cursor-pointer"
            >
              <StepLabel StepIconComponent={CustomStepIcon}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    </div>
  );
};

export default FormStepper;
