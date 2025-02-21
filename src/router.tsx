
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Leads from './pages/Leads';
import Communications from './pages/Communications';
import QuickCall from './pages/QuickCall';
import Settings from './pages/Settings';
import SignIn from './pages/SignIn';

export function CRMRouter() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/leads" element={<Leads />} />
      <Route path="/communications" element={<Communications />} />
      <Route path="/quick-call" element={<QuickCall />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/signin" element={<SignIn />} />
    </Routes>
  );
}
