
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import ContactDetail from "./pages/ContactDetail";
import QuickCall from "./pages/QuickCall";
import Settings from "./pages/Settings";
import Communications from "./pages/Communications";
import Deals from "./pages/Deals";
import SignIn from "./pages/SignIn";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/contacts/:id" element={<ContactDetail />} />
      <Route path="/quick-call" element={<QuickCall />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/communications" element={<Communications />} />
      <Route path="/deals" element={<Deals />} />
      <Route path="/sign-in" element={<SignIn />} />
    </Routes>
  );
};

export default App;
