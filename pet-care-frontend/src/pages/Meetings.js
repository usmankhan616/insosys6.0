import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const Meetings = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const userEmail = localStorage.getItem("userEmail");

    // Payment Modal States
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paidAppointments, setPaidAppointments] = useState(() => {
        const stored = localStorage.getItem('paidAppointments_' + userEmail);
        return stored ? new Set(JSON.parse(stored)) : new Set();
    });

    useEffect(() => {
        if (!userEmail) {
            navigate('/login');
            return;
        }

        const fetchMeetings = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/appointments/owner-all/${userEmail}`);
                const sortedApps = response.data.sort((a, b) => new Date(b.appointmentTime) - new Date(a.appointmentTime));
                setAppointments(sortedApps);
            } catch (err) {
                console.error("Error fetching meetings:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMeetings();
    }, [userEmail, navigate]);

    const handlePayClick = (app) => {
        setSelectedApp(app);
        setShowPaymentModal(true);
        setPaymentSuccess(false);
    };

    const processPayment = () => {
        setPaymentProcessing(true);
        // Simulate payment gateway delay
        setTimeout(() => {
            setPaymentProcessing(false);
            setPaymentSuccess(true);
            setTimeout(() => {
                setShowPaymentModal(false);
                setPaymentSuccess(false);
                if (selectedApp) {
                    setPaidAppointments(prev => {
                        const next = new Set(prev).add(selectedApp.id);
                        localStorage.setItem('paidAppointments_' + userEmail, JSON.stringify([...next]));
                        return next;
                    });
                }
                setSelectedApp(null);
                alert("Payment Successful! Invoice ID: #INV-" + Math.floor(Math.random() * 1000000));
            }, 2000);
        }, 1500);
    };

    const activeApps = appointments.filter(app => !app.status || app.status === 'PENDING' || app.status === 'ACCEPTED');
    const pastApps = appointments.filter(app => app.status === 'COMPLETED' || app.status === 'REJECTED');

    const renderAppCard = (app) => (
        <div key={app.id} className="card" style={{
            padding: '20px',
            borderLeft: `5px solid ${app.status === 'ACCEPTED' ? 'var(--success)' :
                app.status === 'REJECTED' ? 'var(--danger)' :
                    app.status === 'COMPLETED' ? '#17a2b8' : 'var(--warning)'
                }`,
            backgroundColor: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px'
        }}>
            <div style={{ flex: '1 1 300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '18px' }}>Dr. {app.doctor?.fullName || 'N/A'}</strong>
                    <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor:
                            app.status === 'ACCEPTED' ? '#d4edda' :
                                app.status === 'REJECTED' ? '#f8d7da' :
                                    app.status === 'COMPLETED' ? '#d1ecf1' : '#fff3cd',
                        color:
                            app.status === 'ACCEPTED' ? '#155724' :
                                app.status === 'REJECTED' ? '#721c24' :
                                    app.status === 'COMPLETED' ? '#0c5460' : '#856404'
                    }}>
                        {app.status || 'PENDING'}
                    </span>
                </div>
                <div style={{ color: '#555', fontSize: '14px', marginBottom: '4px' }}>
                    <strong>Date & Time:</strong> {app.appointmentTime ? app.appointmentTime.replace('T', ' ').substring(0, 16) : 'N/A'}
                </div>
                <div style={{ color: '#555', fontSize: '14px' }}>
                    <strong>Patient:</strong> {app.pet?.name || 'Unknown'} ({app.type})
                </div>

                {/* Rejection Reason display */}
                {app.status === 'REJECTED' && app.rejectionReason && (
                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '8px', color: '#c53030', fontSize: '14px' }}>
                        <strong>Reason for Rejection:</strong> {app.rejectionReason}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {(app.status === 'ACCEPTED' || app.status === 'COMPLETED') && (
                    paidAppointments.has(app.id) ? (
                        <button className="btn btn-secondary cursor-target" style={{ backgroundColor: '#28a745', color: '#fff', border: 'none' }} onClick={() => alert("Joining meeting...")}>
                            🎥 Join Meeting
                        </button>
                    ) : (
                        <button className="btn btn-primary cursor-target" onClick={() => handlePayClick(app)}>
                            💳 Pay {app.status === 'ACCEPTED' ? 'Booking Fee' : 'Invoice'}
                        </button>
                    )
                )}
                {app.status === 'PENDING' && (
                    <span style={{ color: '#888', fontStyle: 'italic', fontSize: '14px' }}>
                        Waiting for doctor approval...
                    </span>
                )}
            </div>
        </div>
    );

    return (
        <div className="container gradient-bg" style={{ minHeight: '100vh', padding: '20px' }}>
            <div className="card glass-panel animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>📅 My Meetings & Appointments</h2>
                    <button className="btn btn-outline cursor-target" onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </button>
                </div>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Loading your meetings...</div>
                ) : appointments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                        <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>📭</span>
                        <h3 style={{ margin: 0, color: '#666' }}>No appointments found.</h3>
                        <p style={{ color: '#888' }}>You haven't booked any consultations yet.</p>
                        <button className="btn btn-primary cursor-target" style={{ marginTop: '15px' }} onClick={() => navigate('/book-appointment')}>
                            Book an Appointment
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {activeApps.length > 0 && (
                            <div>
                                <h3 style={{ borderBottom: '2px solid #1DB954', paddingBottom: '10px', color: '#2c3e50', marginBottom: '15px' }}>🟢 Active & Upcoming Appointments</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {activeApps.map(renderAppCard)}
                                </div>
                            </div>
                        )}
                        {pastApps.length > 0 && (
                            <div>
                                <h3 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px', color: '#666', marginBottom: '15px' }}>🕰️ Past History (Completed / Rejected)</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {pastApps.map(renderAppCard)}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Payment Modal inside Meetings */}
            {showPaymentModal && (
                <div className="modal-overlay" style={{ zIndex: 10000 }}>
                    <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
                        {paymentProcessing ? (
                            <div style={{ padding: '30px' }}>
                                <div className="spinner" style={{ margin: '0 auto 20px auto', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #1DB954', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                <h3 style={{ margin: 0 }}>Processing Payment...</h3>
                                <p style={{ color: '#666', fontSize: '14px' }}>Please do not close this window.</p>
                            </div>
                        ) : paymentSuccess ? (
                            <div style={{ padding: '30px', color: 'var(--success)' }}>
                                <div style={{ fontSize: '50px', marginBottom: '10px' }}>✅</div>
                                <h3 style={{ margin: 0 }}>Payment Successful!</h3>
                                <p style={{ color: '#666', fontSize: '14px' }}>Thank you for your payment.</p>
                            </div>
                        ) : (
                            <>
                                <h3 style={{ margin: '0 0 15px 0', color: 'var(--primary-color)' }}>Complete Payment</h3>
                                <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'left' }}>
                                    <p style={{ margin: '0 0 8px 0' }}><strong>Doctor:</strong> Dr. {selectedApp?.doctor?.fullName}</p>
                                    <p style={{ margin: '0 0 8px 0' }}><strong>Date:</strong> {selectedApp?.appointmentTime?.split('T')[0]}</p>
                                    <p style={{ margin: 0 }}><strong>Amount Due:</strong> ₹499</p>
                                </div>

                                <button className="btn btn-primary cursor-target" style={{ width: '100%', padding: '12px', fontSize: '16px', marginBottom: '10px' }} onClick={processPayment}>
                                    Pay ₹499 Securely
                                </button>
                                <button className="btn btn-outline cursor-target" style={{ width: '100%', padding: '12px', fontSize: '16px' }} onClick={() => setShowPaymentModal(false)}>
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Meetings;
