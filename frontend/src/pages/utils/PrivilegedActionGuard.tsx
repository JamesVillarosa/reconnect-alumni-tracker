import React from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { showToast } from "../../components/utils/ToastFxn";

interface PrivilegedActionProps {
  children: React.ReactElement<any>;
  actionProp?: string; // the prop name of the function to override (e.g., "onClick" or "action")
}

/**
 * Wrapper to protect Privileged Actions from users who are not "Verified".
 * @param {ReactElement} children - elements inside this PrivilegedAction tag
 * @param {string} actionProp - the prop name of the function to override (e.g., "onClick" or "action"), not needed if onClick
 * 
 * @example
 * <PrivilegedAction actionProp="action">
      <FloatingActionButton
        icon="plus"
        text="Create Event"
        action={() => {
          navigate("/user/requests/event");
        }}
      />
    </PrivilegedAction>
 *
 * @example
 * <PrivilegedAction>
      <button onClick={() => {}}>Close</button>
    </PrivilegedAction>
 */
const PrivilegedAction: React.FC<PrivilegedActionProps> = ({ children, actionProp = "onClick" }) => {
  const { user } = useAuthContext();

  const originalAction = children.props[actionProp];

  const wrappedAction = (...args: any[]) => {
    if (user?.verification_status !== "Verified") {
      showToast("error", "Unverified Status", "You are not yet privileged enough to perform this action.");
      return;
    }
    if (typeof originalAction === "function") {
      originalAction(...args);
    }
  };

  return React.cloneElement(children, {
    [actionProp]: wrappedAction,
  });
};

export default PrivilegedAction;