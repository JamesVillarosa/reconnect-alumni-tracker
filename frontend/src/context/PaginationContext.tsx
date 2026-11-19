import { createContext, useContext, useState } from 'react';

type PaginationContextType = {
  adminPageNumber: number;
  setAdminPageNumber: (page: number) => void;
};

const PaginationContext = createContext<PaginationContextType | undefined>(undefined);
/**
 * Allows pagination to persist in the pages wrapped by this context.
 * @example
 * import { PaginationProvider } from './PaginationContext';

export const AdminRoutes = () => {
  return (
    <PaginationProvider>
      <Routes>
        <Route path="/admin/alumni" element={<AdminAlumniPage />} />
        <Route path="/admin/alumni/:id" element={<AdminAlumniDetailsPage />} />
        <Route path="/admin/jobs" element={<AdminJobsPage />} />
        <Route path="/admin/jobs/:id" element={<AdminJobsDetailsPage />} />
      </Routes>
    </PaginationProvider>
  );
};
 * 
 * @example
 * 
 * import { usePagination } from './PaginationContext';

const AdminAlumniPage = () => {
  const { alumniPage, setAlumniPage } = usePagination();

  return (
    <div>
      <p>Current Alumni Page: {alumniPage}</p>
      <button onClick={() => setAlumniPage(alumniPage + 1)}>Next</button>
    </div>
  );
};
 */
export const PaginationProvider = ({ children }: { children: React.ReactNode }) => {
  const [adminPageNumber, setAdminPageNumber] = useState(1);

  return (
    <PaginationContext.Provider value={{ adminPageNumber, setAdminPageNumber}}>
      {children}
    </PaginationContext.Provider>
  );
};

export const usePagination = () => {
  const context = useContext(PaginationContext);
  if (!context) throw new Error('usePagination must be used within PaginationProvider');
  return context;
};