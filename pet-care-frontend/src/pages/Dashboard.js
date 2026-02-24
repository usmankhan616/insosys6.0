import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole"); // We will store this during login

    return (
        <div style={{ padding: '20px' }}>
            <nav style={navStyle}>
                <h1>Pet Care Dashboard ({userRole})</h1>
                <div>
                    <button onClick={() => navigate('/profile')}>My Profile</button>
                    <button onClick={() => { localStorage.clear(); navigate('/login'); }}>Logout</button>
                </div>
            </nav>

            <div style={{ marginTop: '20px' }}>
                <h3>Welcome back, {userEmail}!</h3>

                <div style={gridStyle}>
                    {/* Features for PET OWNERS */}
                    {userRole === 'PET_OWNER' && (
                        <>
                            <div onClick={() => navigate('/health-management')} style={cardStyle}>🐾 My Pets & Health</div>
                            <div onClick={() => navigate('/appointments')} style={cardStyle}>📅 Book Appointment</div>
                            <div onClick={() => navigate('/marketplace')} style={cardStyle}>🛒 Shop Products</div>
                        </>
                    )}

                    {/* Features for VETERINARIANS */}
                    {userRole === 'DOCTOR' && (
                        <>
                            <div onClick={() => navigate('/vet-appointments')} style={cardStyle}>📋 My Consultations</div>
                            <div onClick={() => navigate('/patient-records')} style={cardStyle}>🐕 Patient Records</div>
                        </>
                    )}

                    {/* Features for ADMINS */}
                    {userRole === 'ADMIN' && (
                        <>
                            <div onClick={() => navigate('/admin/users')} style={cardStyle}>👥 Manage Users</div>
                            <div onClick={() => navigate('/admin/inventory')} style={cardStyle}>📦 Inventory Management</div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const navStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '10px' };
const gridStyle = { display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' };
const cardStyle = { padding: '40px', border: '1px solid #ddd', borderRadius: '15px', flex: '1 1 250px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#f9f9f9', transition: '0.3s' };

export default Dashboard;