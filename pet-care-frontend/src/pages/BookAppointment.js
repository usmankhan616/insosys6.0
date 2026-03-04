import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../index.css';

const BookAppointment = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [date, setDate] = useState('');
    const [type, setType] = useState('OFFLINE');
    const [petName, setPetName] = useState('');
    const [pets, setPets] = useState([]);
    const [selectedPetId, setSelectedPetId] = useState('');
    const [busySlots, setBusySlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [availableDates, setAvailableDates] = useState([]);

    const [isProcessing, setIsProcessing] = useState(false);

    const allSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

    useEffect(() => {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            dates.push(d.toISOString().split('T')[0]);
        }
        setAvailableDates(dates);

        axios.get('http://localhost:8080/api/auth/doctors')
            .then(res => setDoctors(res.data || []))
            .catch(err => console.error("Error fetching doctors", err));

        const ownerEmail = localStorage.getItem('userEmail');
        if (ownerEmail) {
            axios.get(`http://localhost:8080/api/pets/owner?email=${ownerEmail}`)
                .then(res => {
                    setPets(res.data || []);
                    if (res.data && res.data.length > 0) {
                        setSelectedPetId(res.data[0].id);
                        setPetName(res.data[0].name || '');
                    }
                })
                .catch(err => console.error('Failed to load pets', err));
        }
    }, []);

    const fetchSlots = async (docId, selectedDate) => {
        if (!docId || !selectedDate) return;
        try {
            const res = await axios.get(`http://localhost:8080/api/appointments/busy-slots?doctorId=${docId}&date=${selectedDate}`);
            setBusySlots(res.data || []);
        } catch (err) { console.error(err); }
    };

    // Skip proceed to payment - book directly

    const handleBooking = async () => {
        setIsProcessing(true);
        try {
            const appointmentTime = `${date}T${selectedSlot}:00`;
            const payload = {
                appointmentTime,
                type,
                doctor: { id: selectedDoctor },
                status: "PENDING"
            };
            const ownerEmail = localStorage.getItem("userEmail");
            const url = `http://localhost:8080/api/appointments/book?ownerEmail=${ownerEmail}${selectedPetId ? `&petId=${selectedPetId}` : (petName ? `&petName=${encodeURIComponent(petName)}` : '')}`;

            if (selectedPetId) payload.petId = selectedPetId; else payload.petName = petName;

            // Direct booking
            await axios.post(url, payload);
            setIsProcessing(false);
            alert("Booking Confirmed! Your appointment is now PENDING doctor approval.");
            navigate('/meetings');
        } catch (error) {
            console.error("Booking error", error);
            setIsProcessing(false);
            alert("An error occurred while booking. Please try again.");
        }
    };

    return (
        <div className="container gradient-bg animate-fade-in" style={{ minHeight: '100vh', padding: '40px 20px' }}>
            <div className="card glass-panel" style={{ maxWidth: '650px', margin: '0 auto' }}>
                <div className="page-header" style={{ borderBottom: 'none', marginBottom: '15px' }}>
                    <button className="btn btn-outline" onClick={() => navigate(-1)}>← Back</button>
                    <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>📅 Book Consultation</h2>
                    <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>🏠 Home</button>
                </div>

                <div className="form-group">
                    <label className="form-label">Select Doctor</label>
                    <select
                        className="form-input"
                        value={selectedDoctor}
                        onChange={(e) => { setSelectedDoctor(e.target.value); if (date) fetchSlots(e.target.value, date); }}>
                        <option value="">Choose a Vet</option>
                        {doctors.map(doc => <option key={doc.id} value={doc.id}>{doc.fullName}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Appointment Date (Next 7 Days Only)</label>
                    <select
                        className="form-input"
                        value={date}
                        onChange={(e) => { setDate(e.target.value); fetchSlots(selectedDoctor, e.target.value); }}>
                        <option value="">Select a Day</option>
                        {availableDates.map(d => (
                            <option key={d} value={d}>
                                {new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Meeting Mode</label>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input type="radio" checked={type === 'OFFLINE'} onChange={() => setType('OFFLINE')} /> Offline (Clinic)
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input type="radio" checked={type === 'ONLINE'} onChange={() => setType('ONLINE')} /> Online (Video)
                        </label>
                    </div>
                </div>

                {selectedDoctor && date && (
                    <div className="animate-slide-up" style={{ marginTop: '20px' }}>
                        <div className="form-group">
                            <label className="form-label">Pet Name (required)</label>
                            {pets && pets.length > 0 ? (
                                <select
                                    className="form-input"
                                    value={selectedPetId}
                                    onChange={(e) => {
                                        const id = e.target.value;
                                        setSelectedPetId(id);
                                        const p = pets.find(x => String(x.id) === String(id));
                                        setPetName(p ? p.name : '');
                                    }}
                                >
                                    <option value="">Select a Pet</option>
                                    {pets.map(p => <option key={p.id} value={p.id}>{p.name} {p.species ? `(${p.species})` : ''}</option>)}
                                </select>
                            ) : (
                                <input
                                    className="form-input"
                                    value={petName}
                                    onChange={(e) => setPetName(e.target.value)}
                                    placeholder="Enter your pet's name"
                                />
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Select a Vacant Slot</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', marginTop: '12px' }}>
                                {allSlots.map(slot => {
                                    const isBusy = busySlots.includes(slot);
                                    const isSelected = selectedSlot === slot;
                                    return (
                                        <button
                                            key={slot}
                                            disabled={isBusy}
                                            onClick={() => setSelectedSlot(slot)}
                                            style={{
                                                padding: '12px',
                                                border: isSelected ? '2px solid var(--primary-color)' : '2px solid var(--border-color)',
                                                backgroundColor: isBusy ? '#f5f5f5' : (isSelected ? 'var(--primary-color)' : '#fff'),
                                                color: isBusy ? '#bbb' : (isSelected ? '#fff' : 'var(--text-dark)'),
                                                borderRadius: '8px',
                                                cursor: isBusy ? 'not-allowed' : 'pointer',
                                                fontWeight: '600',
                                                transition: 'all 0.2s ease',
                                                transform: isSelected ? 'scale(1.05)' : 'none',
                                                boxShadow: isSelected ? 'var(--shadow-md)' : 'none'
                                            }}
                                        >
                                            {slot}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '20px', padding: '15px', fontSize: '1.1rem' }}
                    disabled={!selectedSlot || !(selectedPetId || petName.trim())}
                    onClick={handleBooking}
                >
                    {isProcessing ? 'Confirming...' : 'Confirm Booking'}
                </button>
            </div>


        </div>
    );
};

export default BookAppointment;