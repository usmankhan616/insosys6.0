import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import HealthManagement from './pages/HealthManagement';
import AddPet from './pages/AddPet';
import PetProfile from './pages/PetProfile';
import AddHealthRecord from './pages/AddHealthRecord';
import BookAppointment from './pages/BookAppointment';
import DoctorDashboard from './pages/DoctorDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Core Dashboards */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />

        {/* Phase 3: Health Management Module */}
        <Route path="/health-management" element={<HealthManagement />} />
        <Route path="/add-pet" element={<AddPet />} />
        <Route path="/pet-profile/:petId" element={<PetProfile />} />
        <Route path="/add-health-record/:petId" element={<AddHealthRecord />} />

        {/* Phase 4: Appointments & Doctor Management */}
        {/* Pet Owner Booking Page */}
        <Route path="/appointments" element={<BookAppointment />} />

        {/* Doctor Dashboard Routes */}
        {/* Note: We map multiple paths to DoctorDashboard to fix your "No routes matched" errors */}
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/vet-appointments" element={<DoctorDashboard />} />
        <Route path="/patient-records" element={<DoctorDashboard />} />

        {/* Placeholder for future Marketplace */}
        <Route path="/marketplace" element={<div>Marketplace Module Coming Soon</div>} />

        {/* Catch-all for undefined routes */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;