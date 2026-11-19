import React from "react";

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "major" | "minor";
  type?: "button" | "submit" | "reset";
  className?: string; // for overriding preset styles
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = "major", // major is default
  type = "button",
  className = "",
  disabled,
}) => {
  // different styles for different type of button
  const buttonStyles =
    variant === "major"
      ? "bg-Gradient2 text-white font-bold hover:bg-Gradient1 hover:brightness-110 py-2"
      : "bg-white text-[#414651] font-medium border border-[#D9D9D9] hover:bg-gray-300 py-1.5";
  return (
    <button
      className={`w-full mt-4  ${className} ${buttonStyles} text-md lg:text-md font-semibold rounded-xl transition`}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
