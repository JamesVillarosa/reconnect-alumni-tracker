import { createContext, useReducer, useEffect, ReactNode, Dispatch, useState } from "react";

// Define the shape of the `CurrentCareer` object based on the API response
interface CurrentCareer {
  company: string;
  classification: string;
  industry: string;
  tenured_status: boolean;
  salary_range: string;
  is_current: boolean;
}

// Define the structure of a `User` object
interface User {
  _id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  current_career: CurrentCareer;
  auth_provider: string;
  account_status: string;
  verification_status: string;
  created_at: string;
  updated_at: string;
  biography: string;
  location: string;
  profile_picture: string;
  header_picture: string;
}

// Define the initial state of authentication
interface AuthState {
  user: User | null; // `user` can either be a `User` object or null if not authenticated
}

// Define the possible actions to update the authentication state
type AuthAction =
  | { type: "LOGIN"; payload: User } // Action to log the user in
  | { type: "LOGOUT" }; // Action to log the user out

// Define the type of the context, which will include both the state and the dispatch function
interface AuthContextType extends AuthState {
  dispatch: Dispatch<AuthAction>; // Dispatch function to trigger actions
  loading: boolean; // Boolean to indicate if the user is authenticated
}

// Create the AuthContext with an initial value of `undefined`
export const AuthContext = createContext<AuthContextType | null>(null);

// Reducer function to update the authentication state based on the dispatched actions
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN":
      return { user: action.payload }; // Update the state with the user object on login
    case "LOGOUT":
      return { user: null }; // Clear the user object on logout
    default:
      return state; // Return the current state if the action type is unrecognized
  }
};

// Define the props for the AuthContextProvider component
interface AuthContextProviderProps {
  children: ReactNode; // `children` will be the components wrapped by this provider
}

// AuthContextProvider component: wraps your app to provide the `AuthContext`
export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  // Use `useReducer` to handle authentication state changes
  const [state, dispatch] = useReducer(authReducer, {
    user: null, // Initial state has no user logged in
  });
  const [loading, setLoading] = useState(true); // Track loading state

  // `useEffect` hook to fetch user data from the server on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Send a request to the server to validate the current user's session
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/validate_user`, // Use the environment variable for the API URL
          {
            credentials: "include", // Ensure that cookies (e.g., session cookies) are included in the request
          }
        );

        // Check if the response is successful, throw an error if not
        if (!response.ok) {
          throw new Error("Failed to validate user");
        }

        // Parse the response and extract the `user` object
        const user: User = (await response.json()).user; // Make sure the response has the `user` property
        dispatch({ type: "LOGIN", payload: user }); // Dispatch the LOGIN action to update the state
      } catch (error) {
        // Log any errors that occur while fetching the user data
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false); // Set loading to false when the check is complete
      }
    };

    // Call the function to fetch the user data
    fetchUser();
  }, []); // Empty dependency array means this will only run once when the component mounts

  // Log the current state of the context for debugging purposes
  console.log("AuthContext state:", state);


  return (
    // Provide the `AuthContext` to all child components
    <AuthContext.Provider value={{ ...state, dispatch, loading }}>
      {children} {/* Render the children (components wrapped by this provider) */}
    </AuthContext.Provider>
  );
};
