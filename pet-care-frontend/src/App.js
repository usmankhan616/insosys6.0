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
import HealthMonitoring from './pages/HealthMonitoring';
import VaccinationSchedule from './pages/VaccinationSchedule';
import Marketplace from './pages/Marketplace';
import OrderTracking from './pages/OrderTracking';
import Meetings from './pages/Meetings';

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

        {/* Pet Profile & Health Tracking Module */}
        <Route path="/health-management" element={<HealthManagement />} />
        <Route path="/add-pet" element={<AddPet />} />
        <Route path="/pet-profile/:petId" element={<PetProfile />} />
        <Route path="/add-health-record/:petId" element={<AddHealthRecord />} />
        <Route path="/health-monitoring" element={<HealthMonitoring />} />
        <Route path="/vaccination-schedule" element={<VaccinationSchedule />} />

        {/* Appointment Scheduling Module */}
        <Route path="/appointments" element={<BookAppointment />} />
        <Route path="/meetings" element={<Meetings />} />

        {/* Doctor Dashboard Routes */}
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/vet-appointments" element={<DoctorDashboard />} />
        <Route path="/patient-records" element={<DoctorDashboard />} />

        {/* Pet Marketplace & Product Purchases Module */}
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/order-tracking" element={<OrderTracking />} />

        {/* Catch-all for undefined routes */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
