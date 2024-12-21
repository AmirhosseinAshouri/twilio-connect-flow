import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { CRMSidebar } from "@/components/CRMSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "@/pages/Index";
import Contacts from "@/pages/Contacts";
import ContactDetail from "@/pages/ContactDetail";
import Deals from "@/pages/Deals";
import Communications from "@/pages/Communications";
import Settings from "@/pages/Settings";

function App() {
  return (
    <Router>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <CRMSidebar />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/contacts/:id" element={<ContactDetail />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/communications" element={<Communications />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </SidebarProvider>
      <Toaster />
    </Router>
  );
}

export default App;