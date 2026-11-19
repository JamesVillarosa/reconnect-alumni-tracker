import React from "react";

interface TextProps {
  text: string | undefined;
  format: "body" | "subheading" | "heading" | "title" | "label" | "small";
  icon?: React.ReactNode;
  className?: string; // added in case you want to override the preset styles
}

const Text: React.FC<TextProps> = ({ text, format, icon, className = "" }) => {
  const getStyle = () => {
    switch (format) {
      case "title":
        return "text-2xl font-bold";
      case "heading":
        return "text-xl font-semibold";
      case "subheading":
        return "text-lg font-semibold";
      case "body":
        return "text-base font-normal";
      case "label":
        return "text-base font-bold";
      case "small":
        return "text-sm font-normal";
    }
  };
  return (
    <div
      className={`flex items-center gap-2 text-Primary ${getStyle()} ${className}`}
    >
      {icon && <span>{icon}</span>}
      <span>{text}</span>
    </div>
  );
};

export default Text;
