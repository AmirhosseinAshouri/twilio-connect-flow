import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { CRMSidebar } from "@/components/CRMSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Dashboard from "@/pages/Dashboard";
import Contacts from "@/pages/Contacts";
import ContactDetail from "@/pages/ContactDetail";
import Deals from "@/pages/Deals";
import Communications from "@/pages/Communications";
import Settings from "@/pages/Settings";
import SignIn from "@/pages/SignIn";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        {!isAuthenticated ? (
          <>
            <Routes>
              <Route path="/signin" element={<SignIn />} />
              <Route path="*" element={<Navigate to="/signin" replace />} />
            </Routes>
            <Toaster />
          </>
        ) : (
          <SidebarProvider>
            <div className="flex h-screen w-full">
              <CRMSidebar />
              <main className="flex-1 overflow-y-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/contacts/:id" element={<ContactDetail />} />
                  <Route path="/deals" element={<Deals />} />
                  <Route path="/communications" element={<Communications />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </SidebarProvider>
        )}
        <Toaster />
      </Router>
    </ErrorBoundary>
  );
}

export default App;