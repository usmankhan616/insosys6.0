import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PetProfile = () => {
    const { petId } = useParams();
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [hoveredBtn, setHoveredBtn] = useState(null);
    const [completedVaccines, setCompletedVaccines] = useState({});

    // Payment Modal States
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [paidInvoices, setPaidInvoices] = useState({});
    const [activeInvoice, setActiveInvoice] = useState(null);
    const [vaccinations, setVaccinations] = useState([]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [healthRes, vaccRes] = await Promise.all([
                    axios.get(`http://localhost:8080/api/health/pet/${petId}`),
                    axios.get(`http://localhost:8080/api/vaccinations/pet/${petId}`)
                ]);
                let healthData = healthRes.data || [];
                const vaccData = vaccRes.data || [];

                // normalise and add description field so UI cards render correctly
                healthData = healthData.map(r => ({
                    ...r,
                    description: r.details || '',
                    recordType: r.recordType || ''
                }));

                // convert vaccination records into the same shape as health records for display
                const vaccAsHealth = vaccData.map(v => ({
                    id: `vac-${v.id}`,
                    recordType: 'Vaccination',
                    description: v.vaccineName,
                    vaccinationDate: v.dateAdministered,
                    nextVaccinationDate: v.nextDueDate,
                    veterinarianName: v.veterinarianName,
                    vaccId: v.id,
                    isCompleted: v.isCompleted
                }));

                setRecords([...healthData, ...vaccAsHealth]);
                setVaccinations(vaccData);
                // Get user email to fetch history invoices
                const userEmail = localStorage.getItem("userEmail");
                if (userEmail) {
                    try {
                        const invRes = await axios.get(`http://localhost:8080/api/appointments/owner-history/${userEmail}`);
                        // Filter to show only if it belongs to this pet
                        const petAppointments = invRes.data.filter(app => String(app.pet?.id) === String(petId));
                        setInvoices(petAppointments);
                    } catch (e) {
                        console.error("No invoice data found.");
                    }
                }
            } catch (err) {
                console.error("Error fetching records", err);
            }
        };
        fetchAll();

        // if another tab (doctor) updates the pet history, refresh automatically
        const handleStorage = (e) => {
            if (e.key === 'petHistoryUpdated' && e.newValue === String(petId)) {
                fetchAll();
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [petId]);

    const markVaccineCompleted = async (vaccId, current) => {
        try {
            // toggle persisted state on server
            const res = await axios.patch(`http://localhost:8080/api/vaccinations/complete/${vaccId}`, { completed: !current });
            // update local UI state to reflect persisted change
            setCompletedVaccines(prev => ({ ...prev, [vaccId]: res.data.isCompleted }));
            // also update records array so the vaccination card shows correct status without full refetch
            setRecords(prev => prev.map(r => r.vaccId === vaccId ? { ...r, isCompleted: res.data.isCompleted } : r));
        } catch (err) {
            console.error('Failed to update vaccination status', err);
            alert('Failed to update vaccination status. Please try again.');
        }
    };

    const handleDummyPayment = (invoiceId) => {
        setIsProcessingPayment(true);
        setTimeout(() => {
            setIsProcessingPayment(false);
            setPaymentSuccess(true);
            setTimeout(() => {
                setShowPaymentModal(false);
                setPaymentSuccess(false);
                if (invoiceId) {
                    setPaidInvoices(prev => ({ ...prev, [invoiceId]: true }));
                }
            }, 2000);
        }, 1500);
    };

    return (
        <div style={{ padding: isMobilePP ? '20px' : '40px', maxWidth: '900px', margin: '0 auto', boxSizing: 'border-box' }}>
            {/* Dual Navigation Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '10px' }}>
                <button
                    onClick={() => navigate(-1)}
                    onMouseEnter={() => setHoveredBtn('back')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{ ...btnNav, ...(hoveredBtn === 'back' ? { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', backgroundColor: '#e8e8e8' } : {}) }}>
                    ← Back
                </button>
                <button
                    onClick={() => navigate('/dashboard')}
                    onMouseEnter={() => setHoveredBtn('home')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{ ...btnNav, ...(hoveredBtn === 'home' ? { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', backgroundColor: '#e8e8e8' } : {}) }}>
                    🏠 Home
                </button>
            </div>

            <h2 style={{ borderBottom: '2px solid #1DB954', paddingBottom: '10px' }}>🐾 Pet Health Portal</h2>

            {/* 1. CLINICAL MEDICAL RECORDS SECTION */}
            <div style={sectionStyle}>
                <h3 style={{ color: '#2c3e50' }}>📋 Clinical Encounters (Medical History)</h3>
                {records.filter(r => (r.recordType || '').toLowerCase().includes('medical') || r.recordType === 'Vaccination').length === 0 ? (
                    <p style={emptyText}>No clinical records found.</p>
                ) : (
                    records.filter(r => (r.recordType || '').toLowerCase().includes('medical') || r.recordType === 'Vaccination').map(rec => (
                        <div
                            key={rec.id}
                            onMouseEnter={() => setHoveredCard(rec.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            style={{ ...medicalCard, ...(hoveredCard === rec.id ? { transform: 'translateY(-4px)', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', border: '2px solid #1DB954' } : {}) }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h4 style={{ margin: '0', color: '#1DB954', fontWeight: '700' }}>
                                    {rec.recordType === 'Vaccination'
                                        ? '💉 Vaccine: ' + rec.description
                                        : '📋 Clinical Encounter'}
                                </h4>
                                <span style={dateTag}>{rec.date}</span>
                            </div>
                            {rec.recordType !== 'Vaccination' && (
                                <>
                                    <p style={{ margin: '10px 0 5px 0', color: '#555' }}><strong>Details:</strong></p>
                                    <p style={{ margin: '4px 0 10px 0', whiteSpace: 'pre-wrap', color: '#333' }}>{rec.details || rec.description}</p>
                                </>
                            )}
                            {rec.veterinarianName && (
                                <p style={{ margin: 0, color: '#666' }}><strong>Attending Veterinarian:</strong> {rec.veterinarianName}</p>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* 2. VACCINATION SECTION (summary) */}
            <div style={sectionStyle}>
                <h3 style={{ color: '#2c3e50' }}>💉 Vaccination Status</h3>
                <div style={gridStyle}>
                    {records.filter(r => r.recordType === 'Vaccination').map(rec => (
                        <div
                            key={rec.id}
                            onMouseEnter={() => setHoveredCard(rec.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            style={{ ...vaccineCard, ...(hoveredCard === rec.id ? { transform: 'translateY(-4px)', boxShadow: '0 8px 20px rgba(29, 185, 84, 0.2)' } : {}), transition: 'all 0.3s ease' }}>
                            <h4 style={{ margin: '0 0 10px 0', fontWeight: '700', color: '#1DB954' }}>💉 {rec.description}</h4>
                            <p style={{ margin: '8px 0', color: '#555' }}><strong>Date Administered:</strong> {rec.vaccinationDate}</p>
                            <p style={{ color: rec.isCompleted ? '#4caf50' : '#d9534f', fontWeight: rec.isCompleted ? 'normal' : 'bold', margin: '10px 0 12px 0' }}>📅 {rec.isCompleted ? '✓ Completed' : `Next Booster: ${rec.nextVaccinationDate}`}</p>
                            <button
                                onClick={() => markVaccineCompleted(rec.vaccId, rec.isCompleted || completedVaccines[rec.vaccId])}
                                onMouseEnter={() => setHoveredBtn(`vacc-${rec.vaccId}`)}
                                onMouseLeave={() => setHoveredBtn(null)}
                                style={{
                                    ...vaccineBtn,
                                    ...((rec.isCompleted || completedVaccines[rec.vaccId]) ? vaccBtnCompleted : vaccBtnIncomplete),
                                    ...(hoveredBtn === `vacc-${rec.vaccId}` ? vaccBtnHover : {})
                                }}>
                                {(rec.isCompleted || completedVaccines[rec.vaccId]) ? '✓ Completed' : '○ Mark as Done'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. PRESCRIPTION SECTION */}
            <div style={sectionStyle}>
                <h3 style={{ color: '#2c3e50' }}>💊 Active Prescriptions</h3>
                {records.filter(r => r.recordType && r.recordType.toLowerCase() === 'prescription').length === 0 ? (
                    <p style={emptyText}>No active prescriptions found.</p>
                ) : (
                    records.filter(r => r.recordType && r.recordType.toLowerCase() === 'prescription').map(rec => (
                        <div
                            key={rec.id}
                            onMouseEnter={() => setHoveredCard(rec.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            style={{ ...prescripCard, ...(hoveredCard === rec.id ? { transform: 'translateY(-4px)', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', border: '2px solid #1DB954' } : {}), transition: 'all 0.3s ease' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ color: '#1DB954', fontSize: '1.05rem' }}>💊 Prescription</strong>
                                <span style={dateTag}>{rec.date ? new Date(rec.date).toLocaleString() : ''}</span>
                            </div>
                            <p style={{ whiteSpace: 'pre-wrap', marginTop: '12px', color: '#555' }}>{rec.details}</p>
                        </div>
                    ))
                )}
            </div>

            {/* 4. PAST APPOINTMENT INVOICES (Dummy Payment) */}
            <div style={sectionStyle}>
                <h3 style={{ color: '#2c3e50' }}>🧾 Post-Consultation Invoices</h3>
                {invoices.length === 0 ? (
                    <p style={emptyText}>No pending invoices for completed appointments.</p>
                ) : (
                    invoices.map(inv => {
                        const isPaid = paidInvoices[inv.id];
                        return (
                            <div key={inv.id} style={{ ...prescripCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>Consultation on {inv.appointmentTime?.split('T')[0]}</h4>
                                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Doctor: {inv.doctor?.fullName}</p>
                                </div>
                                <div>
                                    {isPaid ? (
                                        <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓ Paid</span>
                                    ) : (
                                        <button className="btn btn-primary" onClick={() => { setActiveInvoice(inv.id); setShowPaymentModal(true); }}>
                                            Pay $45.00
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* User no longer allowed to add health records directly; doctors add records while prescribing */}

            {/* Dummy Payment Modal */}
            {showPaymentModal && (
                <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ color: 'var(--primary-color)', marginTop: 0 }}>Pay Outstanding Balance</h3>
                        <p style={{ color: '#555', marginBottom: '20px' }}>Consultation Fee: <strong>$45.00</strong></p>

                        {isProcessingPayment ? (
                            <div style={{ padding: '30px' }}>
                                <div className="spinner" style={{ margin: '0 auto 15px auto', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                <p style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>Processing Payment...</p>
                            </div>
                        ) : paymentSuccess ? (
                            <div style={{ padding: '30px' }}>
                                <div style={{ fontSize: '48px', color: 'var(--success)', marginBottom: '15px' }}>✓</div>
                                <h3 style={{ color: 'var(--success)', margin: '0 0 10px 0' }}>Payment Successful!</h3>
                                <p style={{ color: '#666' }}>Your invoice has been cleared.</p>
                                <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setShowPaymentModal(false)}>Close</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <button className="btn btn-outline" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }} onClick={handleDummyPayment}>
                                    💳 Pay via Credit / Debit Card
                                </button>
                                <button className="btn btn-outline" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }} onClick={handleDummyPayment}>
                                    📱 Pay via UPI / Wallet
                                </button>
                                <button className="btn" style={{ marginTop: '10px', backgroundColor: '#e2e8f0', color: '#4a5568' }} onClick={() => setShowPaymentModal(false)}>
                                    Pay Later
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Styles
const isMobilePP = typeof window !== 'undefined' && window.innerWidth < 768;
const sectionStyle = { marginBottom: isMobilePP ? '20px' : '35px' };
const emptyText = { fontStyle: 'italic', color: '#999', marginTop: '10px' };
const medicalCard = { backgroundColor: '#fff', padding: '22px', borderRadius: '12px', marginBottom: '15px', border: '2px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' };
const vaccineCard = { backgroundColor: '#e8f5e9', padding: '18px', borderRadius: '10px', borderLeft: '5px solid #1DB954', transition: 'all 0.3s ease' };
const prescripCard = { backgroundColor: '#fff', padding: '18px', borderRadius: '10px', border: '2px solid #f0f0f0', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.3s ease' };
const dateTag = { backgroundColor: '#f0f0f0', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', color: '#666' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' };
const btnNav = { backgroundColor: '#f5f5f5', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease', fontSize: '0.95rem' };
const vaccineBtn = { width: '100%', padding: '10px 14px', border: '2px solid #1DB954', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease', fontSize: '0.9rem', marginTop: '8px' };
const vaccBtnIncomplete = { backgroundColor: '#fff', border: '2px solid #1DB954', color: '#1DB954' };
const vaccBtnCompleted = { backgroundColor: '#1DB954', border: '2px solid #1DB954', color: 'white' };
const vaccBtnHover = { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(29, 185, 84, 0.2)' };

export default PetProfile;