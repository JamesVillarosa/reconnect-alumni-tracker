import React from "react";

interface CustomButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "major" | "minor";
  type?: "button" | "submit" | "reset";
  className?: string;
  isDisabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  onClick,
  children,
  variant = "major",
  type = "button",
  className = "",
  isDisabled = false,
}) => {
  const buttonStyles =
    variant === "major"
      ? "bg-Gradient2 text-white font-bold hover:bg-Gradient1 hover:brightness-110 py-2"
      : "bg-white text-[#414651] font-medium border border-[#D9D9D9] hover:bg-gray-300 py-1.5";

  return (
    <button
      className={`w-full mt-4 ${className} ${buttonStyles} text-md lg:text-md font-semibold rounded-xl transition 
        ${isDisabled ? "opacity-50 cursor-not-allowed hover:brightness-100 hover:bg-Gradient2" : ""}`}
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
};

export default CustomButton;