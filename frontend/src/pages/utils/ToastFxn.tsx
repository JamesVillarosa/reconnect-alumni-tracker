import { toast as sonnerToast } from "sonner";
import Toast from "../../components/Toast.tsx";

export type ToastType = "info" | "success" | "error" | "warning";

export interface ToastProps {
  id: string | number;
  title: string;
  description: string;
  type: ToastType | string;
  isLoading: boolean;
  button?: {
    label: string;
    onClick: () => void;
  };
}

export interface CustomToastContent {
  title: string;
  description: string;
  type: ToastType | string;
  button?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastPromiseContent {
  loading: CustomToastContent;
  success: CustomToastContent | undefined;
  error: CustomToastContent;
}

/**
 * Displays a custom toast notification using a headless implementation of the Sonner toast system.
 *
 * @function
 * @param {Omit<ToastProps, "id">} toast - The configuration object for the custom toast.
 * @param {string} toast.title - The title displayed in the toast notification.
 * @param {string} toast.description - The body or subtitle displayed under the title.
 * @param {string} toast.type - The type of the toast ("info" | "success" | "error" | "warning").
 * @param {boolean} toast.isLoading - If true, displays a spinning loader icon instead of a static icon.
 * @param {Object} toast.button - The configuration for an optional button inside the toast.
 * @param {string} toast.button.label - The text label for the button.
 * @param {() => void} toast.button.onClick - The function executed when the button is clicked.
 *
 * @returns {void} No value is returned. The toast is rendered immediately.
 *
 * @example
 * toast({
 *   title: "Profile Updated",
 *   description: "Your profile changes were saved successfully.",
 *   type: "success",
 *   isLoading: false,
 *   button: { label: "View", onClick: () => console.log("Clicked!") }
 * });
 */
export function toast(toast: Omit<ToastProps, "id">): string | number {
  return sonnerToast.custom((id) => (
    <Toast
      id={id}
      title={toast.title}
      description={toast.description}
      type={toast.type}
      isLoading={toast.isLoading}
      button={toast.button}
    />
  ));
}

/**
 * Displays a dynamic toast notification that updates based on the state of a given promise (loading, success, or error).
 *
 * @function
 * @template T
 * @param {Promise<T>} promise - The promise whose state will control the toast updates.
 * @param {ToastPromiseContent} content - An object containing three toast configurations:
 * - `loading`: The toast that appears while the promise is pending (typically shows a spinner or "loading" message).
 * - `success`: The toast that appears if the promise resolves successfully (typically shows a success icon and confirmation message).
 * - `error`: The toast that appears if the promise rejects or fails (typically shows an error icon and failure message).
 *
 * Each of these (loading, success, error) must include:
 * - `title`: The main title text to show.
 * - `description`: A short message or additional detail below the title.
 * - `type`: The type of the toast (`"info" | "success" | "error" | "warning"`) which controls the icon and color theme.
 * - `button` (optional): An optional action button with a label and onClick function (mostly useful for success/error states if needed).
 *
 * @returns {Promise<T>} Returns the original promise for continued `.then()` and `.catch()` chaining.
 *
 * @example
 * toastPromise(
 *   fetch('/api/save-profile'),
 *   {
 *     loading: {
 *       title: "Saving...",
 *       description: "Please wait while we save your changes.",
 *       type: "info"
 *     },
 *     success: {
 *       title: "Success!",
 *       description: "Your profile was updated.",
 *       type: "success"
 *     },
 *     error: {
 *       title: "Error",
 *       description: "We couldn't update your profile. Try again later.",
 *       type: "error"
 *     }
 *   }
 * );
 */
export function toastPromise<T>(
  promise: Promise<T>,
  content: ToastPromiseContent
): Promise<T> {
  const loadingToast = sonnerToast.custom((toastId) => (
    <Toast
      id={toastId}
      title={content.loading.title}
      description={content.loading.description}
      type={content.loading.type}
      isLoading={true}
    />
  ));

  promise
    .then((res) => {
      sonnerToast.dismiss(loadingToast);

      if (content.success !== undefined)
        sonnerToast.custom((toastId) => (
          <Toast
            id={toastId}
            title={content.success?.title || "Title"}
            description={content.success?.description || "Description"}
            type={content.success?.type || "Type"}
            isLoading={false}
            button={
              content.success?.button
                ? {
                    label: content.success.button.label,
                    onClick: content.success.button.onClick,
                  }
                : undefined
            }
          />
        ));
      return res;
    })
    .catch((err) => {
      sonnerToast.dismiss(loadingToast);

      sonnerToast.custom((toastId) => (
        <Toast
          id={toastId}
          title={content.error.title}
          description={content.error.description}
          type={content.error.type}
          isLoading={false}
          button={
            content.error.button
              ? {
                  label: content.error.button.label,
                  onClick: content.error.button.onClick,
                }
              : undefined
          }
        />
      ));
      throw err;
    });

  return promise;
}
