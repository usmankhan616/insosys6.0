import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [appointments, setAppointments] = useState([]);
    const [history, setHistory] = useState([]);
    const [blockedSlots, setBlockedSlots] = useState([]);
    const [isReady, setIsReady] = useState(false);
    const doctorEmail = localStorage.getItem("userEmail");
    const today = new Date().toISOString().split('T')[0];

    const allSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

    // Identify mode based on URL
    const isHistoryMode = location.pathname === '/patient-records';

    const fetchData = async () => {
        try {
            // 1. Fetch Doctor Profile & Availability
            const statusRes = await axios.get(`http://localhost:8080/api/auth/profile?email=${doctorEmail}`);
            setIsReady(statusRes.data.isAvailable === 1 || statusRes.data.isAvailable === true);

            // 2. Fetch Today's Appointments
            const appRes = await axios.get(`http://localhost:8080/api/appointments/doctor/${doctorEmail}`);
            setAppointments(appRes.data);

            // 3. Fetch Blocked Slots for Time Management
            const blockRes = await axios.get(`http://localhost:8080/api/appointments/blocked?email=${doctorEmail}&date=${today}`);
            setBlockedSlots(blockRes.data);

            // 4. Fetch Full History for Patient Records
            const historyRes = await axios.get(`http://localhost:8080/api/appointments/history/${doctorEmail}`);
            setHistory(historyRes.data);
        } catch (err) { console.error("Data fetch error:", err); }
    };

    useEffect(() => { if (doctorEmail) fetchData(); }, [location.pathname, doctorEmail]);

    const toggleAvailability = async () => {
        const newStatus = !isReady;
        await axios.put(`http://localhost:8080/api/auth/availability?email=${doctorEmail}&status=${newStatus}`);
        setIsReady(newStatus);
    };

    const toggleSlot = async (slot) => {
        await axios.post(`http://localhost:8080/api/appointments/manage-slots`, {
            email: doctorEmail,
            date: today,
            slotTime: slot
        });
        fetchData(); // Auto-refresh after toggle
    };

    const handlePrescription = async (app) => {
        const note = prompt(`Enter prescription for ${app.pet?.name || "this pet"}:`);
        if (note) {
            // Requirements: Doctor enters name, prescription, saved with date/time
            await axios.post('http://localhost:8080/api/health/add-prescription', {
                petName: app.pet?.name,
                details: note,
                doctorEmail: doctorEmail
            });
            alert("Prescription saved and visible to Pet Owner.");
            fetchData();
        }
    };

    return (
        <div style={containerStyle}>
            <header style={headerStyle}>
                <h2>{isHistoryMode ? "🐕 Patient Treatment History" : "📋 Doctor's Consultation Desk"}</h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <strong>Status: {isReady ? "🟢 Online" : "🔴 Offline"}</strong>
                    <button onClick={toggleAvailability} style={isReady ? btnOff : btnOn}>
                        {isReady ? "Go Offline" : "Go Online"}
                    </button>
                    <button onClick={fetchData} style={btnRefresh}>🔄 Refresh List</button>
                    <button onClick={() => navigate('/dashboard')} style={btnNav}>Dashboard</button>
                </div>
            </header>

            {!isHistoryMode ? (
                <>
                    {/* Consultation UI: Show Time Table Management */}
                    <div style={managementBar}>
                        <h3>🗓️ Time Table Management ({today})</h3>
                        <div style={slotGrid}>
                            {allSlots.map(slot => (
                                <button
                                    key={slot}
                                    onClick={() => toggleSlot(slot)}
                                    style={blockedSlots.includes(slot) ? blockedBtn : freeBtn}>
                                    {slot} {blockedSlots.includes(slot) ? "(Blocked)" : "(Free)"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <h3>Today's Schedule</h3>
                    {appointments.length === 0 ? <p>No appointments for today.</p> :
                        appointments.map(app => (
                            <div key={app.id} style={horizontalRow}>
                                <div style={barItem}><strong>{app.appointmentTime?.split('T')[1].substring(0, 5)}</strong></div>
                                <div style={barItem}>Pet: <strong>{app.pet?.name || "Unknown"}</strong></div>
                                <div style={barItem}>Owner: {app.owner?.fullName}</div>
                                <button onClick={() => handlePrescription(app)} style={btnActive}>📝 Prescription</button>
                            </div>
                        ))
                    }
                </>
            ) : (
                <>
                    {/* Patient Records UI: Only Treatment Logs */}
                    <h3>Full treatment logs based on date and time</h3>
                    {history.length === 0 ? <p>No treatment history found.</p> :
                        history.map(record => (
                            <div key={record.id} style={historyRow}>
                                <div style={barItem}><strong>{record.appointmentTime?.replace('T', ' ').substring(0, 16)}</strong></div>
                                <div style={barItem}>Patient: {record.pet?.name}</div>
                                <div style={barItem}>Owner: {record.owner?.fullName}</div>
                                <div style={{ ...barItem, color: 'green', fontWeight: 'bold' }}>Status: {record.status}</div>
                            </div>
                        ))
                    }
                </>
            )}
        </div>
    );
};

// --- STYLES ---
const containerStyle = { padding: '30px', maxWidth: '1200px', margin: '0 auto' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '15px' };
const managementBar = { backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '15px', border: '1px solid #ddd', marginBottom: '30px' };
const horizontalRow = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 25px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '50px', marginBottom: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' };
const historyRow = { display: 'flex', justifyContent: 'space-between', padding: '15px 25px', borderBottom: '1px solid #eee', backgroundColor: '#f9f9f9', marginBottom: '8px', borderRadius: '12px' };
const slotGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' };
const barItem = { flex: 1, textAlign: 'center' };

const btnOn = { backgroundColor: '#1DB954', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '20px', cursor: 'pointer' };
const btnOff = { backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '20px', cursor: 'pointer' };
const btnRefresh = { backgroundColor: '#2196F3', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer' };
const btnNav = { padding: '10px 15px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer' };
const btnActive = { padding: '8px 20px', backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' };
const freeBtn = { padding: '10px', backgroundColor: '#e8f5e9', border: '1px solid #1DB954', borderRadius: '8px', cursor: 'pointer' };
const blockedBtn = { padding: '10px', backgroundColor: '#ffebee', border: '1px solid #d32f2f', borderRadius: '8px', cursor: 'pointer' };

export default DoctorDashboard;