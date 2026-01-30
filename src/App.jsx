import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import DonorDashboard from './pages/DonorDashboard';
import SeekerDashboard from './pages/SeekerDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import TestAdminPage from './pages/TestAdminPage';
import OrganizerPortal from './pages/OrganizerPortal';
import DonationCampsPage from './pages/DonationCampsPage';
import HospitalSignup from './pages/HospitalSignup';
import HospitalDashboard from './pages/HospitalDashboard';
import ProfileSettings from './pages/ProfileSettings';
import { AuthProvider } from './context/AuthContext';
import ChatBot from './components/ChatBot';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DonorDashboard />} />
              <Route path="/search" element={<SeekerDashboard />} />
              <Route path="/camps" element={<DonationCampsPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/settings" element={<ProfileSettings />} />
              <Route path="/test-admin" element={<TestAdminPage />} />
              <Route path="/organizer" element={<OrganizerPortal />} />
              <Route path="/hospital-signup" element={<HospitalSignup />} />
              <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
            </Routes>
          </main>
          <ChatBot />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
