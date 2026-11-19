import Toast from "../../components/Toast";
import { toast as sonnerToast } from "sonner";

export const showToast = (
    type: "info" | "success" | "error" | "warning",
    title: string,
    description: string,
    isLoading = false
  ) => {
    sonnerToast.custom((id) => (
      <Toast
        id={id}
        type={type}
        title={title}
        description={description}
        isLoading={isLoading} button={{
          label: "",
          onClick: function (): void {
            throw new Error("Function not implemented.");
          }
        }}      />
    ));
  };

