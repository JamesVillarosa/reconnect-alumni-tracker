import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import UserHomepage from "./pages/user/UserHomepage";
import SignUpPage from "./pages/SignUpPage";
import AboutPage from "./pages/AboutPage";
import UserAgreementPage from "./pages/UserAgreementPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import ErrorPage from "./pages/ErrorPage";
import UserEventsPage from "./pages/user/UserEventsPage";
import UserDonatePage from "./pages/user/UserDonatePage";
import UserJobsPage from "./pages/user/UserJobsPage";
import UserNotificationsPage from "./pages/user/UserNotificationsPage";
import UserProfilePage from "./pages/user/UserProfilePage";
// import DemoSignUpPage from "./pages/demo/DemoBasicSignUpPage";
// import DemoSignInPage from "./pages/demo/DemoBasicSignIn";
import UserJobPostingFormPage from "./pages/user/UserJobPostingFormPage";
import UserRequestsPage from "./pages/user/UserRequestsPage";
// import UserJobDetails from "./pages/user/UserJobDetails";
// import DemoPostJob from "./pages/demo/DemoPostJob";
// import DemoGetAllJobs from "./pages/demo/DemoGetJob";
// import DemoGetJobById from "./pages/demo/DemoGetJobById";
// import DemoUpdateJob from "./pages/demo/DemoUpdateJob";
// import DemoUpdateEvent from "./pages/demo/DemoUpdateEvent";
// import DemoDeleteEvent from "./pages/demo/DemoDeleteEvent";
// import { DemoCreateEvent, DemoEventList } from "./pages/demo/DemoGetEvent";
// import DemoSignUpPage from "./pages/demo/DemoBasicSignUpPage";
// import DemoSignInPage from "./pages/demo/DemoBasicSignIn";
import AdminJobsPage from "./pages/admin/AdminJobsPage";
import AdminJobsPostFormPage from "./pages/admin/AdminJobsPostingFormPage";
import AdminEventsPage from "./pages/admin/AdminEventsPage";
import AdminEventDetailsPage from "./pages/admin/AdminEventDetailsPage";
import AdminEventsPostFormPage from "./pages/admin/AdminEventsPostingFormPage";
import AdminDonationsPage from "./pages/admin/AdminDonationsPage";
import AdminDonationDetailsPage from "./pages/admin/AdminDonationDetailsPage";
import AdminDonationsPostFormPage from "./pages/admin/AdminDonationsPostingFormPage";
import FacebookCallback from "./components/auth/FacebookCallback";
import ProtectedRoutes from "./pages/utils/ProtectedRoute";
import GoogleCallback from "./components/auth/GoogleCallback";
import UserNewsDetailsPage from "./pages/user/UserNewsDetails";
import UserEventDetails from "./pages/user/UserEventDetails";
import UserCreateEventFormPage from "./pages/user/UserCreateEventFormPage";
import SampleDonationsPage from "./pages/SampleDonationsPage";
import { Toaster } from "sonner";
import { ScrollToTop } from "./pages/utils/ScrollToTop";
import UserNewsAndArticlesPage from "./pages/user/UserNewsAndAnnouncementsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import UserSurveyPage from "./pages/user/UserSurveyPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminAlumniPage from "./pages/admin/AdminAlumniPage";
import AdminAlumniDetailsPage from "./pages/admin/AdminAlumniDetailsPage.tsx";
import AdminJobsDetailsPage from "./pages/admin/AdminJobsDetailsPage";
import UserDonatePageRefactor from "./pages/user/UserDonatePageRefactor";
import UserDonationDetails from "./pages/user/UserDonationDetails";
import { PaginationProvider } from "./context/PaginationContext.tsx";

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
        <PaginationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="*" element={<ErrorPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/user-agreement" element={<UserAgreementPage />} />
            {/* User protected routes */}
            <Route element={<ProtectedRoutes destination="/user" inverted />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />
              <Route path="/auth/callback" element={<FacebookCallback />} />
            </Route>
            {/* Protected Routes */}
            <Route element={<ProtectedRoutes destination="/" />}>
              <Route path="/user" element={<UserHomepage />} />
              <Route path="/user/profile" element={<UserProfilePage />} />
              <Route path="/user/survey" element={<UserSurveyPage />} />
              <Route path="/user/events" element={<UserEventsPage />} />
              <Route path="/user/events/:id" element={<UserEventDetails />} />
              <Route
                path="/user/events/create"
                element={<UserCreateEventFormPage />}
              />
              <Route path="/user/donate" element={<UserDonatePageRefactor />} />
              <Route path="/user/donate/:id" element={<UserDonationDetails />} />
              <Route path="/user/jobs" element={<UserJobsPage />} />
              <Route
                path="/user/jobs/create-job"
                element={<UserJobPostingFormPage />}
              />
              <Route path="/user/requests/:tab" element={<UserRequestsPage />} />
              <Route path="/user/notifs" element={<UserNotificationsPage />} />
              <Route path="/user/news" element={<UserNewsAndArticlesPage />} />
              <Route
                path="/user/news/details"
                element={<UserNewsDetailsPage />}
              />{" "}
              {/* FOR INTEGRATION: "/user/news/:newsId" */}
            </Route>
            Sampe Events Page for D
            <Route path="/sample/donations" element={<SampleDonationsPage />} />
            {/* Demo Pages from Backend */}
            {/* <Route path="/demo/sign-up" element={<DemoSignUpPage />} /> */}
            {/* <Route path="/demo/sign-in" element={<DemoSignInPage />} /> */}
            {/* Demo Pages for Jobs */}
            {/* <Route path="/demo/post-job" element={<DemoPostJob />} /> */}
            {/* <Route path="/demo/get-all-jobs" element={<DemoGetAllJobs />} /> */}
            {/* <Route path="/demo/get-job" element={<DemoGetJobById />} /> */}
            {/* <Route path="/demo/update-job" element={<DemoUpdateJob />} /> */}
            {/* Demo Pages for Events */}
            {/* <Route path="/demo/post-event" element={<DemoCreateEvent />} /> */}
            {/* <Route path="/demo/get-all-events" element={<DemoEventList />} /> */}
            {/* <Route path="/demo/update-event" element={<DemoUpdateEvent />} /> */}
            {/* <Route path="/demo/delete-event" element={<DemoDeleteEvent />} /> */}
            {/* Admin Routes */}
            <Route element={<ProtectedRoutes destination="/" adminOnly />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              
              <Route path="/admin/jobs" element={<AdminJobsPage />} />
              <Route path="/admin/jobs/view" element={<AdminJobsDetailsPage />} />
              <Route path="/admin/jobs/form" element={<AdminJobsPostFormPage />} />
            
              <Route path="/admin/events" element={<AdminEventsPage />} />
              <Route path="/admin/events/view" element={<AdminEventDetailsPage />}/>
              <Route path="/admin/events/form" element={<AdminEventsPostFormPage />} />
            
              <Route path="/admin/donations" element={<AdminDonationsPage />} />
              <Route path="/admin/donations/view" element={<AdminDonationDetailsPage />} />
              <Route path="/admin/donations/form" element={<AdminDonationsPostFormPage />} />
            
              <Route path="/admin/alumni" element={<AdminAlumniPage />} />
              <Route path="/admin/alumni/view" element={<AdminAlumniDetailsPage />} />
              
              
            </Route>
          </Routes>
        </PaginationProvider>
      <Toaster position={"top-right"} />
    </BrowserRouter>
  );
}

export default App;
