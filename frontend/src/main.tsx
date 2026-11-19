import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthContextProvider } from './context/AuthContext.tsx'
import { JobsContextProvider } from './context/JobsContext.tsx'
import { SavedJobsContextProvider } from './context/SavedJobsContext.tsx'
import { EventsContextProvider } from './context/EventsContext.tsx'
import { DonationsContextProvider } from './context/DonationsContext.tsx'
import { ArticlesContextProvider } from './context/ArticlesContext.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthContextProvider>
      <JobsContextProvider>
        <SavedJobsContextProvider>
          <EventsContextProvider>
            <DonationsContextProvider>
              <ArticlesContextProvider>
                <App />
              </ArticlesContextProvider>
            </DonationsContextProvider>
          </EventsContextProvider>
        </SavedJobsContextProvider>
      </JobsContextProvider>
    </AuthContextProvider>
  </StrictMode>
);
