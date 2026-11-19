import { useState } from "react";

export type FormErrors = Partial<Record<string, string>>;

export const useInputErrors = () => {
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * Sets an error message for a specific field.
   * @param fieldName - The name of the field (e.g., "username", "email").
   * @param message - The error message string.
   */
  const setFieldError = (fieldName: string, message: string) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: message,
    }));
  };

  /**
   * Clears the error message for a specific field.
   * @param fieldName - The name of the field to clear the error for.
   */
  const clearFieldError = (fieldName: string) => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  /**
   * Clears all error messages from the form.
   */
  const clearAllErrors = () => {
    setErrors({});
  };

  return {
    errors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
  };
};
