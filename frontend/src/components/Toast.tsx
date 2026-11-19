import { JSX, useEffect, useState } from "react";
import { toast as sonnerToast } from "sonner";
import {
  CircleCheck,
  CircleX,
  Info,
  LoaderCircle,
  TriangleAlert,
  X,
} from "lucide-react";
import { ToastProps } from "../pages/utils/ToastFxn";

const toastMap = {
  info: {
    icon: <Info size={36} />,
    text: "text-Secondary",
    border: "border-Secondary",
  },
  success: {
    icon: <CircleCheck size={36} />,
    text: "text-Accent",
    border: "border-Accent",
  },
  error: {
    icon: <CircleX size={36} />,
    text: "text-Error",
    border: "border-Error",
  },
  warning: {
    icon: <TriangleAlert size={36} />,
    text: "text-Warning",
    border: "border-Warning",
  },
};

export default function Toast(props: ToastProps) {
  const { title, description, type, isLoading, id, button } = props;

  const [toastType, setToastType] = useState<{
    icon: JSX.Element;
    text: string;
    border: string;
  }>(toastMap.info);

  useEffect(() => {
    setToastType(getToastType(type));
  }, [type]);

  const getToastType = (type: string) => {
    switch (type.toLowerCase()) {
      case "success":
        return toastMap.success;
      case "error":
        return toastMap.error;
      case "warning":
        return toastMap.warning;
      case "info":
      default:
        return toastMap.info;
    }
  };

  return (
    <div
      className={`flex rounded-lg bg-white shadow-lg border-l-[12px] ${toastType.border} ring-1 ring-black/5 w-full md:min-h-[100px] md:w-[300px] items-center p-4`}
    >
      <div className={`relative mr-3 ${toastType.text}`}>
        <div
          className={`transition-all duration-200 ease-in-out absolute ${
            isLoading
              ? "opacity-100 scale-100"
              : "opacity-0 scale-75 pointer-events-none"
          }`}
        >
          <LoaderCircle size={36} className="animate-spin" />
        </div>

        <div
          className={`transition-all duration-300 ease-in-out ${
            isLoading ? "opacity-0 scale-75" : "opacity-100 scale-100"
          }`}
        >
          {toastType.icon}
        </div>
      </div>

      <div className="flex flex-1 items-center mr-6">
        <div className="w-full text-BlackText">
          <p className="text-sm font-bold">{title}</p>
          <p className="mt-1 text-sm">{description}</p>
          {button != undefined ? (
            <button
              className="text-Primary cursor-pointer font-medium underline text-sm"
              onClick={button.onClick}
            >
              {button.label}
            </button>
          ) : (
            ""
          )}
        </div>
      </div>

      <div className="absolute right-3 top-3 ml-5 shrink-0 rounded-md text-sm font-medium focus:ring-2 focus:ring-DarkBlue focus:ring-offset-2 focus:outline-hidden">
        <button
          className={`rounded-full p-1 text-sm font-semibold text-BlackText hover:bg-FaintBlue transition-colors`}
          onClick={() => sonnerToast.dismiss(id)}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
