import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PetProfile = () => {
    const { petId } = useParams();
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/health/pet/${petId}`);
                setRecords(res.data);
            } catch (err) {
                console.error("Error fetching records", err);
            }
        };
        fetchRecords();
    }, [petId]);

    return (
        <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
            {/* Dual Navigation Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button onClick={() => navigate(-1)} style={btnNav}>← Back</button>
                <button onClick={() => navigate('/dashboard')} style={btnNav}>🏠 Home</button>
            </div>

            <h2 style={{ borderBottom: '2px solid #1DB954', paddingBottom: '10px' }}>🐾 Pet Health Portal</h2>

            {/* 1. CLINICAL MEDICAL RECORDS SECTION */}
            <div style={sectionStyle}>
                <h3 style={{ color: '#2c3e50' }}>📋 Clinical Encounters (Medical History)</h3>
                {records.filter(r => r.recordType === 'Medical History').length === 0 ? (
                    <p style={emptyText}>No clinical records found.</p>
                ) : (
                    records.filter(r => r.recordType === 'Medical History').map(rec => (
                        <div key={rec.id} style={medicalCard}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h4 style={{ margin: '0', color: '#1DB954' }}>Diagnosis: {rec.description}</h4>
                                <span style={dateTag}>{rec.date}</span>
                            </div>
                            <p style={{ margin: '10px 0 5px 0' }}><strong>Clinical Findings:</strong> Standard check-up and assessment completed.</p>
                            <p style={{ margin: 0 }}><strong>Attending Veterinarian:</strong> {rec.veterinarianName}</p>
                        </div>
                    ))
                )}
            </div>

            {/* 2. VACCINATION SECTION */}
            <div style={sectionStyle}>
                <h3 style={{ color: '#2c3e50' }}>💉 Vaccination Status</h3>
                <div style={gridStyle}>
                    {records.filter(r => r.recordType === 'Vaccination').map(rec => (
                        <div key={rec.id} style={vaccineCard}>
                            <h4 style={{ margin: '0 0 10px 0' }}>{rec.description}</h4>
                            <p><strong>Date Administered:</strong> {rec.vaccinationDate}</p>
                            <p style={{ color: '#d9534f', fontWeight: 'bold' }}>📅 Next Booster: {rec.nextVaccinationDate}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. PRESCRIPTION SECTION */}
            <div style={sectionStyle}>
                <h3 style={{ color: '#2c3e50' }}>💊 Active Prescriptions</h3>
                {records.filter(r => r.recordType === 'Prescription').map(rec => (
                    <div key={rec.id} style={prescripCard}>
                        <h4>{rec.medicationName} ({rec.medicationType})</h4>
                        <p><strong>Dosage:</strong> {rec.quantity} unit(s) during {rec.timings}</p>
                        <p><strong>Duration:</strong> {rec.courseDuration}</p>
                        <p><strong>Follow-up:</strong> {rec.nextVisitDate || "N/A"}</p>
                    </div>
                ))}
            </div>

            <button onClick={() => navigate(`/add-health-record/${petId}`)} style={btnPrimary}>
                + Add New Health Record
            </button>
        </div>
    );
};

// Styles
const sectionStyle = { marginBottom: '30px' };
const emptyText = { fontStyle: 'italic', color: '#888' };
const medicalCard = { backgroundColor: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '15px', border: '1px solid #eee', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' };
const vaccineCard = { backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #1DB954' };
const prescripCard = { backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px' };
const dateTag = { backgroundColor: '#f0f0f0', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' };
const btnNav = { background: '#f0f0f0', border: '1px solid #ccc', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' };
const btnPrimary = { width: '100%', padding: '15px', backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

export default PetProfile;