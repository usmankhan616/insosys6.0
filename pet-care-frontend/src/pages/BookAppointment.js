import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BookAppointment = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [date, setDate] = useState('');
    const [type, setType] = useState('OFFLINE');
    const [busySlots, setBusySlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [availableDates, setAvailableDates] = useState([]);

    const allSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

    useEffect(() => {
        // 1. Generate 7-day range for the dropdown
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            dates.push(d.toISOString().split('T')[0]);
        }
        setAvailableDates(dates);

        // 2. Fetch Online Doctors
        axios.get('http://localhost:8080/api/auth/doctors')
            .then(res => setDoctors(res.data.filter(doc => doc.isAvailable === 1)))
            .catch(err => console.error(err));
    }, []);

    const fetchSlots = async (docId, selectedDate) => {
        if (!docId || !selectedDate) return;
        try {
            // Fetch busy/blocked slots for the chosen day
            const res = await axios.get(`http://localhost:8080/api/appointments/busy-slots?doctorId=${docId}&date=${selectedDate}`);
            setBusySlots(res.data);
        } catch (err) { console.error(err); }
    };

    const handleBooking = async () => {
        const appointmentTime = `${date}T${selectedSlot}:00`;
        const payload = {
            appointmentTime,
            type,
            doctor: { id: selectedDoctor },
            status: "PENDING"
        };
        await axios.post(`http://localhost:8080/api/appointments/book?ownerEmail=${localStorage.getItem("userEmail")}`, payload);
        alert("Booking Confirmed!");
        navigate('/dashboard');
    };

    return (
        <div style={containerStyle}>
            <div style={navHeader}>
                <button onClick={() => navigate(-1)} style={btnNav}>← Back</button>
                <button onClick={() => navigate('/dashboard')} style={btnNav}>🏠 Home</button>
            </div>

            <h2 style={{ textAlign: 'center' }}>📅 Book Consultation</h2>

            <div style={cardStyle}>
                <label>Select Doctor</label>
                <select style={inputStyle} onChange={(e) => { setSelectedDoctor(e.target.value); if(date) fetchSlots(e.target.value, date); }}>
                    <option value="">Choose a Vet</option>
                    {doctors.map(doc => <option key={doc.id} value={doc.id}>{doc.fullName}</option>)}
                </select>

                <label>Appointment Date (Next 7 Days Only)</label>
                <select style={inputStyle} value={date} onChange={(e) => { setDate(e.target.value); fetchSlots(selectedDoctor, e.target.value); }}>
                    <option value="">Select a Day</option>
                    {availableDates.map(d => (
                        <option key={d} value={d}>
                            {new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </option>
                    ))}
                </select>

                <label>Meeting Mode</label>
                <div style={radioGroup}>
                    <label><input type="radio" checked={type === 'OFFLINE'} onChange={() => setType('OFFLINE')} /> Offline</label>
                    <label><input type="radio" checked={type === 'ONLINE'} onChange={() => setType('ONLINE')} /> Online</label>
                </div>

                {selectedDoctor && date && (
                    <div style={{ marginTop: '20px' }}>
                        <label>Select a Vacant Slot</label>
                        <div style={slotGrid}>
                            {allSlots.map(slot => (
                                <button
                                    key={slot}
                                    disabled={busySlots.includes(slot)}
                                    onClick={() => setSelectedSlot(slot)}
                                    style={busySlots.includes(slot) ? blockedBtn : (selectedSlot === slot ? activeBtn : slotBtn)}>
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <button disabled={!selectedSlot} onClick={handleBooking} style={btnSubmit}>Confirm Booking</button>
            </div>
        </div>
    );
};

// Styles (Maintain consistency with previous updates)
const containerStyle = { maxWidth: '600px', margin: '40px auto', padding: '20px' };
const navHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' };
const cardStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '15px', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const slotGrid = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '10px' };
const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ccc' };
const radioGroup = { display: 'flex', gap: '20px', marginBottom: '15px' };
const btnNav = { padding: '8px 15px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer' };
const slotBtn = { padding: '10px', border: '1px solid #1DB954', background: 'none', borderRadius: '8px', cursor: 'pointer' };
const activeBtn = { padding: '10px', backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' };
const blockedBtn = { padding: '10px', backgroundColor: '#f0f0f0', color: '#ccc', border: '1px solid #ddd', borderRadius: '8px', cursor: 'not-allowed' };
const btnSubmit = { width: '100%', marginTop: '20px', padding: '15px', backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };

export default BookAppointment;