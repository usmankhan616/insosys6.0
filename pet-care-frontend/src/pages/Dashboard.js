import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [hoveredCard, setHoveredCard] = React.useState(null);
    const [hoveredBtn, setHoveredBtn] = React.useState(null);

    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <nav style={navStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '28px' }}>🐾</span>
                    <h1 style={{ margin: 0 }}>Paw Track</h1>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="cursor-target"
                        onClick={() => navigate('/profile')}
                        onMouseEnter={() => setHoveredBtn('profile')}
                        onMouseLeave={() => setHoveredBtn(null)}
                        style={{ ...btnNav, ...(hoveredBtn === 'profile' ? btnNavHover : {}) }}
                    >
                        👤 Profile
                    </button>
                    <button
                        className="cursor-target"
                        onClick={() => { localStorage.clear(); navigate('/login'); }}
                        onMouseEnter={() => setHoveredBtn('logout')}
                        onMouseLeave={() => setHoveredBtn(null)}
                        style={{ ...btnLogout, ...(hoveredBtn === 'logout' ? btnLogoutHover : {}) }}
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div style={{ marginTop: '25px' }}>
                <h3 style={{ color: '#555' }}>Welcome back, <span style={{ color: '#1DB954' }}>{userEmail}</span></h3>

                {/* Features for PET OWNERS */}
                {userRole === 'PET_OWNER' && (
                    <>
                        <h4 style={sectionTitle}>🐾 PET MANAGEMENT</h4>
                        <div style={gridStyle}>
                            <div
                                className="cursor-target"
                                onClick={() => navigate('/health-management')}
                                onMouseEnter={() => setHoveredCard('pet-profile')}
                                onMouseLeave={() => setHoveredCard(null)}
                                style={{ ...cardStyle, ...(hoveredCard === 'pet-profile' ? cardHover : {}) }}
                            >

                                <span style={cardIcon}>🐶</span>
                                <h3 style={cardTitle}>Pet Profile</h3>
                                <p style={cardDesc}>Manage your pets and view health records</p>
                            </div>
                            <div
                                className="cursor-target"
                                onClick={() => navigate('/health-monitoring')}
                                onMouseEnter={() => setHoveredCard('health')}
                                onMouseLeave={() => setHoveredCard(null)}
                                style={{ ...cardStyle, ...(hoveredCard === 'health' ? cardHover : {}) }}
                            >

                                <span style={cardIcon}>📊</span>
                                <h3 style={cardTitle}>Health Monitoring</h3>
                                <p style={cardDesc}>Track activity, stress, pulse & calories</p>
                            </div>
                            <div
                                className="cursor-target"
                                onClick={() => navigate('/vaccination-schedule')}
                                onMouseEnter={() => setHoveredCard('vaccine')}
                                onMouseLeave={() => setHoveredCard(null)}
                                style={{ ...cardStyle, ...(hoveredCard === 'vaccine' ? cardHover : {}) }}
                            >

                                <span style={cardIcon}>💉</span>
                                <h3 style={cardTitle}>Vaccination Schedule</h3>
                                <p style={cardDesc}>View & manage vaccination records</p>
                            </div>
                        </div>

                        <h4 style={sectionTitle}>📅 SCHEDULE</h4>
                        <div style={gridStyle}>
                            <div
                                className="cursor-target"
                                onClick={() => navigate('/appointments')}
                                onMouseEnter={() => setHoveredCard('appt')}
                                onMouseLeave={() => setHoveredCard(null)}
                                style={{ ...cardStyle, ...(hoveredCard === 'appt' ? cardHover : {}) }}
                            >

                                <span style={cardIcon}>🩺</span>
                                <h3 style={cardTitle}>Book Appointment</h3>
                                <p style={cardDesc}>Schedule online or in-clinic consultation</p>
                            </div>
                            <div
                                className="cursor-target"
                                onClick={() => navigate('/meetings')}
                                onMouseEnter={() => setHoveredCard('meetings')}
                                onMouseLeave={() => setHoveredCard(null)}
                                style={{ ...cardStyle, ...(hoveredCard === 'meetings' ? cardHover : {}) }}
                            >

                                <span style={cardIcon}>📅</span>
                                <h3 style={cardTitle}>My Meetings</h3>
                                <p style={cardDesc}>View all appointments & confirm payments</p>
                            </div>
                        </div>

                        <h4 style={sectionTitle}>🛒 MARKETPLACE</h4>
                        <div style={gridStyle}>
                            <div
                                className="cursor-target"
                                onClick={() => navigate('/marketplace')}
                                onMouseEnter={() => setHoveredCard('shop')}
                                onMouseLeave={() => setHoveredCard(null)}
                                style={{ ...cardStyle, ...(hoveredCard === 'shop' ? cardHover : {}) }}
                            >

                                <span style={cardIcon}>🛍️</span>
                                <h3 style={cardTitle}>Shop Products</h3>
                                <p style={cardDesc}>Browse food, medicine & accessories</p>
                            </div>
                            <div
                                className="cursor-target"
                                onClick={() => navigate('/order-tracking')}
                                onMouseEnter={() => setHoveredCard('orders')}
                                onMouseLeave={() => setHoveredCard(null)}
                                style={{ ...cardStyle, ...(hoveredCard === 'orders' ? cardHover : {}) }}
                            >

                                <span style={cardIcon}>📦</span>
                                <h3 style={cardTitle}>Order Tracking</h3>
                                <p style={cardDesc}>View order history and delivery status</p>
                            </div>
                        </div>
                    </>
                )}

                {/* Features for VETERINARIANS */}
                {userRole === 'DOCTOR' && (
                    <>
                        <h4 style={sectionTitle}>🩺 DOCTOR PANEL</h4>
                        <div style={gridStyle}>
                            <div
                                className="cursor-target"
                                onClick={() => navigate('/vet-appointments')}
                                onMouseEnter={() => setHoveredCard('consult')}
                                onMouseLeave={() => setHoveredCard(null)}
                                style={{ ...cardStyle, ...(hoveredCard === 'consult' ? cardHover : {}) }}
                            >

                                <span style={cardIcon}>📋</span>
                                <h3 style={cardTitle}>My Consultations</h3>
                                <p style={cardDesc}>View today's appointments & manage slots</p>
                            </div>
                            <div
                                className="cursor-target"
                                onClick={() => navigate('/patient-records')}
                                onMouseEnter={() => setHoveredCard('records')}
                                onMouseLeave={() => setHoveredCard(null)}
                                style={{ ...cardStyle, ...(hoveredCard === 'records' ? cardHover : {}) }}
                            >

                                <span style={cardIcon}>🐕</span>
                                <h3 style={cardTitle}>Patient Records</h3>
                                <p style={cardDesc}>View treatment history for all patients</p>
                            </div>
                        </div>
                    </>
                )}

                {/* Features for ADMINS */}
                {userRole === 'ADMIN' && (
                    <>
                        <h4 style={sectionTitle}>⚙️ ADMIN PANEL</h4>
                        <div style={gridStyle}>
                            <div className="cursor-target" onClick={() => navigate('/admin/users')} style={cardStyle}>
                                <span style={cardIcon}>👥</span>
                                <h3 style={cardTitle}>Manage Users</h3>
                                <p style={cardDesc}>View and manage all users</p>
                            </div>
                            <div className="cursor-target" onClick={() => navigate('/admin/inventory')} style={cardStyle}>
                                <span style={cardIcon}>📦</span>
                                <h3 style={cardTitle}>Inventory</h3>
                                <p style={cardDesc}>Manage product inventory</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const navStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #1DB954', paddingBottom: '15px', marginBottom: '20px' };
const btnNav = { padding: '10px 18px', backgroundColor: '#f5f5f5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.3s ease', color: '#333' };
const btnNavHover = { backgroundColor: '#1DB954', color: 'white', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(29, 185, 84, 0.3)' };
const btnLogout = { padding: '10px 18px', backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease', fontSize: '0.95rem' };
const btnLogoutHover = { backgroundColor: '#ff5252', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)' };
const sectionTitle = { color: '#1DB954', fontWeight: '700', fontSize: '1.1rem', letterSpacing: '1.5px', marginTop: '35px', marginBottom: '20px', textTransform: 'uppercase' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' };
const cardStyle = { padding: '30px', border: '2px solid #f0f0f0', borderRadius: '16px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', userSelect: 'none' };
const cardHover = { transform: 'translateY(-6px)', boxShadow: '0 12px 28px rgba(0,0,0,0.12)', border: '2px solid #1DB954' };
const cardIcon = { fontSize: '3rem', display: 'block', marginBottom: '12px' };
const cardTitle = { margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: '700', color: '#222' };
const cardDesc = { margin: 0, color: '#666', fontSize: '0.9rem', lineHeight: '1.4' };

export default Dashboard;
