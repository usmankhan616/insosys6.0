import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import '../index.css';

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

    const fetchData = React.useCallback(async () => {
        try {
            const statusRes = await axios.get(`http://localhost:8080/api/auth/profile?email=${doctorEmail}`);
            setIsReady(statusRes.data.isAvailable === 1 || statusRes.data.isAvailable === true);

            let appRes = await axios.get(`http://localhost:8080/api/appointments/doctor/${doctorEmail}`);
            const appsWithVacc = await Promise.all(appRes.data.map(async app => {
                if (app.pet && app.pet.id) {
                    try {
                        const vacRes = await axios.get(`http://localhost:8080/api/vaccinations/pet/${app.pet.id}`);
                        const due = vacRes.data.some(v => new Date(v.nextDueDate) <= new Date());
                        return { ...app, vaccDue: due };
                    } catch (_e) { }
                }
                return { ...app, vaccDue: false };
            }));
            setAppointments(appsWithVacc);

            const blockRes = await axios.get(`http://localhost:8080/api/appointments/blocked?email=${doctorEmail}&date=${today}`);
            setBlockedSlots(blockRes.data);

            const historyRes = await axios.get(`http://localhost:8080/api/appointments/history/${doctorEmail}`);
            setHistory(historyRes.data);
        } catch (err) { console.error("Data fetch error:", err); }
    }, [doctorEmail, today]);

    useEffect(() => { if (doctorEmail) fetchData(); }, [location.pathname, doctorEmail, fetchData]);

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
        fetchData();
    };

    // Prescription modal states
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [prescriptionText, setPrescriptionText] = useState('');
    const [meds, setMeds] = useState([{ name: '', qty: '1', course: '3 Days', times: { morning: false, afternoon: false, evening: false } }]);
    const [petHistory, setPetHistory] = useState([]);
    const [petVaccinations, setPetVaccinations] = useState([]);
    const [ownerPets, setOwnerPets] = useState([]);
    const [assignPetId, setAssignPetId] = useState('');

    const openPrescription = async (app) => {
        setSelectedApp(app);
        setPrescriptionText('');
        setShowPrescriptionModal(true);
        setAssignPetId(app.pet?.id ? String(app.pet.id) : '');

        if (app.owner && app.owner.email) {
            try {
                const petsRes = await axios.get(`http://localhost:8080/api/pets/owner?email=${app.owner.email}`);
                setOwnerPets(petsRes.data || []);
            } catch (e) { setOwnerPets([]); }
        } else { setOwnerPets([]); }

        try {
            if (app.pet && app.pet.id) {
                const [histRes, vaccRes] = await Promise.all([
                    axios.get(`http://localhost:8080/api/health/pet/${app.pet.id}`),
                    axios.get(`http://localhost:8080/api/vaccinations/pet/${app.pet.id}`)
                ]);
                setPetHistory(histRes.data || []);
                setPetVaccinations(vaccRes.data || []);
            } else {
                setPetHistory([]);
                setPetVaccinations([]);
            }
        } catch (err) { }
    };

    const assignPetToAppointment = async (petId) => {
        if (!selectedApp || !petId) return;
        try {
            await axios.patch(`http://localhost:8080/api/appointments/${selectedApp.id}/assign-pet?petId=${petId}`);
            const pet = ownerPets.find(p => String(p.id) === String(petId));
            setSelectedApp(prev => ({ ...prev, pet }));
            setAssignPetId(petId);
            if (pet && pet.id) {
                const [histRes, vaccRes] = await Promise.all([
                    axios.get(`http://localhost:8080/api/health/pet/${pet.id}`),
                    axios.get(`http://localhost:8080/api/vaccinations/pet/${pet.id}`)
                ]);
                setPetHistory(histRes.data || []);
                setPetVaccinations(vaccRes.data || []);
            }
            alert('Pet information updated');
            fetchData();
        } catch (err) { alert('Failed to assign pet'); }
    };

    const submitPrescription = async () => {
        if (!selectedApp) return;
        if (!selectedApp.pet || !selectedApp.pet.id) {
            if (assignPetId) await assignPetToAppointment(assignPetId);
            if (!selectedApp.pet || !selectedApp.pet.id) { alert('Please select and assign a pet.'); return; }
        }
        try {
            const medsText = meds.map((m, i) => {
                const times = [m.times.morning ? 'Morning' : null, m.times.afternoon ? 'Afternoon' : null, m.times.evening ? 'Evening' : null].filter(Boolean).join(', ');
                return `${i + 1}. ${m.name || 'Medication'} — ${m.qty}, ${m.course}, ${times}`;
            }).join('\n');
            const details = (medsText ? medsText + '\n\n' : '') + (prescriptionText || '');

            await axios.post('http://localhost:8080/api/health/add-prescription', {
                petId: selectedApp.pet?.id, details, doctorEmail
            }, { withCredentials: false, headers: { 'Content-Type': 'application/json' } });

            alert('Prescription saved!');
            setShowPrescriptionModal(false);
            fetchData();
        } catch (err) { alert('Failed to save prescription'); }
    };

    const completeAppointment = async (appId) => {
        try {
            await axios.post(`http://localhost:8080/api/appointments/complete/${appId}`);
            fetchData();
        } catch (err) { alert('Failed to mark completed'); }
    };

    return (
        <div className="container gradient-bg" style={{ minHeight: '100vh' }}>
            <div className="card glass-panel animate-fade-in" style={{ marginBottom: '20px' }}>
                <div className="page-header">
                    <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>{isHistoryMode ? "🐕 Patient Treatment History" : "📋 Doctor's Consultation Desk"}</h2>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <strong style={{ color: isReady ? 'var(--primary-color)' : 'var(--danger)' }}>
                            Status: {isReady ? "🟢 Online" : "🔴 Offline"}
                        </strong>
                        <button className={`btn cursor-target ${isReady ? 'btn-danger' : 'btn-primary'}`} onClick={toggleAvailability}>
                            {isReady ? "Go Offline" : "Go Online"}
                        </button>
                        <button className="btn btn-secondary cursor-target" onClick={fetchData}>🔄 Refresh List</button>
                        <button className="btn btn-outline cursor-target" onClick={() => navigate('/dashboard')}>Dashboard</button>
                    </div>
                </div>

                {!isHistoryMode ? (
                    <>
                        <div style={{ backgroundColor: '#f0f7ff', padding: '25px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '35px' }}>
                            <h3 style={{ margin: '0 0 15px 0' }}>🗓️ Time Table Management ({today})</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '12px' }}>
                                {allSlots.map(slot => {
                                    const isBlocked = blockedSlots.includes(slot);
                                    return (
                                        <button
                                            key={slot}
                                            className="cursor-target"
                                            onClick={() => toggleSlot(slot)}
                                            style={{
                                                padding: '12px',
                                                border: `2px solid ${isBlocked ? 'var(--danger)' : 'var(--primary-color)'}`,
                                                backgroundColor: isBlocked ? '#fff0f0' : '#f0fff4',
                                                color: isBlocked ? 'var(--danger)' : 'var(--primary-color)',
                                                borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
                                                transition: 'var(--transition)'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                        >
                                            {slot} {isBlocked ? "(Blocked)" : "(Free)"}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <h3>Today's Schedule</h3>
                        {appointments.length === 0 ? <p className="form-label">No appointments for today.</p> :
                            appointments.map(app => (
                                <div key={app.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', padding: '15px 25px', borderLeft: app.status === 'ACCEPTED' ? '4px solid var(--success)' : app.status === 'REJECTED' ? '4px solid var(--danger)' : '4px solid var(--warning)' }}>
                                    <div style={{ flex: 1 }}><strong>{app.appointmentTime ? `${app.appointmentTime.split('T')[0]} ${app.appointmentTime.split('T')[1].substring(0, 5)}` : 'N/A'}</strong></div>
                                    <div style={{ flex: 1 }}>Pet: <strong>{app.pet?.name || "Unknown"}</strong>{app.vaccDue && <span style={{ marginLeft: '8px', padding: '4px 8px', backgroundColor: 'var(--warning)', color: 'white', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>💉 Due</span>}</div>
                                    <div style={{ flex: 1 }}>Owner: {app.owner?.fullName}</div>
                                    <div style={{ flex: 1 }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                                            backgroundColor: app.status === 'ACCEPTED' ? '#d4edda' : app.status === 'REJECTED' ? '#f8d7da' : '#fff3cd',
                                            color: app.status === 'ACCEPTED' ? '#155724' : app.status === 'REJECTED' ? '#721c24' : '#856404'
                                        }}>
                                            {app.status || 'PENDING'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {(!app.status || app.status === 'PENDING') ? (
                                            <>
                                                <button className="btn btn-primary cursor-target" onClick={async () => {
                                                    try {
                                                        await axios.patch(`http://localhost:8080/api/appointments/${app.id}/status?status=ACCEPTED`);
                                                        fetchData();
                                                    } catch (e) { alert('Failed to accept'); }
                                                }}>Accept</button>
                                                <button className="btn btn-danger cursor-target" onClick={async () => {
                                                    const reason = window.prompt("Please provide a reason for rejecting this appointment:");
                                                    if (reason === null) return; // Cancelled
                                                    try {
                                                        const url = `http://localhost:8080/api/appointments/${app.id}/status?status=REJECTED${reason.trim() ? `&reason=${encodeURIComponent(reason.trim())}` : ''}`;
                                                        await axios.patch(url);
                                                        fetchData();
                                                    } catch (e) { alert('Failed to reject'); }
                                                }}>Reject</button>
                                            </>
                                        ) : app.status === 'ACCEPTED' ? (
                                            <>
                                                <button className="btn btn-primary cursor-target" onClick={() => openPrescription(app)}>Start Consultation</button>
                                                <button className="btn btn-secondary cursor-target" onClick={() => completeAppointment(app.id)}>✔ Mark Completed</button>
                                            </>
                                        ) : app.status === 'REJECTED' ? (
                                            <button className="btn btn-outline cursor-target" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={async () => {
                                                if (!window.confirm("Are you sure you want to permanently delete this rejected appointment?")) return;
                                                try {
                                                    await axios.delete(`http://localhost:8080/api/appointments/${app.id}`);
                                                    fetchData();
                                                } catch (e) { alert('Failed to delete'); }
                                            }}>🗑 Delete</button>
                                        ) : null}
                                    </div>
                                </div>
                            ))
                        }
                    </>
                ) : (
                    <>
                        <h3>Full Treatment Logs</h3>
                        {history.length === 0 ? <p>No treatment history found.</p> :
                            history.map(record => (
                                <div key={record.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '15px 25px', backgroundColor: '#fafbfc' }}>
                                    <div style={{ flex: 1 }}><strong>{record.appointmentTime?.replace('T', ' ').substring(0, 16)}</strong></div>
                                    <div style={{ flex: 1 }}>Patient: {record.pet?.name}</div>
                                    <div style={{ flex: 1 }}>Owner: {record.owner?.fullName}</div>
                                    <div style={{ flex: 1, color: 'var(--primary-color)', fontWeight: 'bold', textAlign: 'right' }}>Status: {record.status}</div>
                                </div>
                            ))
                        }
                    </>
                )}
            </div>

            {/* Prescription Modal */}
            {showPrescriptionModal && (
                <div className="modal-overlay" onClick={() => setShowPrescriptionModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0, color: 'var(--primary-color)' }}>Enter Prescription for {selectedApp?.pet?.name || 'Patient'}</h3>

                        {ownerPets.length > 0 && (
                            <div className="form-group" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <label className="form-label" style={{ margin: 0 }}>Assign Pet:</label>
                                <select className="form-input" style={{ width: 'auto' }} value={assignPetId} onChange={e => setAssignPetId(e.target.value)}>
                                    <option value="">-- select --</option>
                                    {ownerPets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <button className="btn btn-primary" onClick={() => assignPetToAppointment(assignPetId)} disabled={!assignPetId}>Assign</button>
                            </div>
                        )}

                        {/* Pet Medical History (Read Only for Doctor Reference) */}
                        <div style={{ padding: '15px', backgroundColor: '#f0f7ff', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary-color)' }}>🩺 Pet Medical History Reference</h4>

                            <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                                <div style={{ flex: '1', minWidth: '300px' }}>
                                    <h5 style={{ margin: '0 0 8px 0' }}>⚕️ Clinical Encounters</h5>
                                    {petHistory.length === 0 ? <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic', margin: 0 }}>No records found.</p> : petHistory.map(h => (
                                        <div key={h.id} style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '8px', marginBottom: '8px', border: '1px solid #e1e4e8', fontSize: '14px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <strong style={{ color: 'var(--primary-color)' }}>{h.recordType || 'Record'}</strong>
                                                <span style={{ color: '#666', fontSize: '12px' }}>{new Date(h.date).toLocaleDateString()}</span>
                                            </div>
                                            <div style={{ whiteSpace: 'pre-wrap', color: '#333' }}>{h.details}</div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ flex: '1', minWidth: '300px' }}>
                                    <h5 style={{ margin: '0 0 8px 0' }}>💉 Vaccinations</h5>
                                    {petVaccinations.length === 0 ? <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic', margin: 0 }}>No vaccination records.</p> : petVaccinations.map(v => (
                                        <div key={v.id} style={{ backgroundColor: '#f0fff4', padding: '10px', borderRadius: '8px', marginBottom: '8px', border: '1px solid #c6f6d5', fontSize: '14px' }}>
                                            <strong style={{ display: 'block', color: '#2f855a', marginBottom: '4px' }}>{v.vaccineName}</strong>
                                            <div style={{ color: '#4a5568' }}><strong>Administered:</strong> {v.dateAdministered}</div>
                                            <div style={{ color: v.isCompleted ? '#2f855a' : '#c53030' }}>
                                                {v.isCompleted ? '✓ Completed' : `Due: ${v.nextDueDate}`}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginTop: '15px' }}>
                            <label className="form-label">💊 Prescribe Medications</label>
                            {meds.map((m, idx) => (
                                <div key={idx} className="card" style={{ padding: '15px', marginBottom: '15px', backgroundColor: '#fafbfc', border: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                        <input className="form-input" style={{ flex: 2 }} value={m.name} onChange={(e) => { const c = [...meds]; c[idx].name = e.target.value; setMeds(c); }} placeholder="Medication name" />
                                        <input className="form-input" style={{ flex: 1 }} value={m.qty} onChange={(e) => { const c = [...meds]; c[idx].qty = e.target.value; setMeds(c); }} placeholder="Qty" />
                                        <select className="form-input" style={{ flex: 1 }} value={m.course} onChange={(e) => { const c = [...meds]; c[idx].course = e.target.value; setMeds(c); }}>
                                            <option>3 Days</option><option>5 Days</option><option>7 Days</option><option>14 Days</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                        {['morning', 'afternoon', 'evening'].map(time => (
                                            <button key={time} className={`btn ${m.times[time] ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1, padding: '8px' }} onClick={() => { const c = [...meds]; c[idx].times[time] = !c[idx].times[time]; setMeds(c); }}>
                                                {m.times[time] ? '✓' : ''} {time.charAt(0).toUpperCase() + time.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => { const c = [...meds]; c.splice(idx, 1); setMeds(c.length ? c : [{ name: '', qty: '1', course: '3 Days', times: { morning: false, afternoon: false, evening: false } }]); }}>🗑 Remove</button>
                                        <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => { const c = [...meds]; c.splice(idx + 1, 0, { name: '', qty: '1', course: '3 Days', times: { morning: false, afternoon: false, evening: false } }); setMeds(c); }}>+ Add Need</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Additional Notes</label>
                            <textarea className="form-input" style={{ minHeight: '100px', resize: 'vertical' }} value={prescriptionText} onChange={(e) => setPrescriptionText(e.target.value)} placeholder="Additional instructions and follow-up..."></textarea>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '20px' }}>
                            <button className="btn btn-outline" onClick={() => setShowPrescriptionModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={submitPrescription}>Save Prescription</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
