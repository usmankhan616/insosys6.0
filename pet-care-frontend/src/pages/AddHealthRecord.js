import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const AddHealthRecord = () => {
    const { petId } = useParams();
    const navigate = useNavigate();
    const doctorEmail = localStorage.getItem("userEmail");

    // State to hold multiple medications
    const [medications, setMedications] = useState([
        { name: '', quantity: '1', course: '3 Days', morning: false, afternoon: false, evening: false }
    ]);
    const [hoveredBtn, setHoveredBtn] = useState(null);

    const addMedicineField = () => {
        setMedications([...medications, { name: '', quantity: '1', course: '3 Days', morning: false, afternoon: false, evening: false }]);
    };

    const handleInputChange = (index, field, value) => {
        const updatedMedications = [...medications];
        updatedMedications[index][field] = value;
        setMedications(updatedMedications);
    };

    const savePrescription = async () => {
        // Format all medicines into a single string for the 'details' field
        const formattedDetails = medications.map(m =>
            `${m.name} (Qty: ${m.quantity}, Course: ${m.course}) [${m.morning ? 'M' : ''}${m.afternoon ? 'A' : ''}${m.evening ? 'E' : ''}]`
        ).join(' | ');

        try {
            await axios.post('http://localhost:8080/api/health/add-prescription', {
                petId: petId, // Use ID for better accuracy
                details: formattedDetails,
                doctorEmail: doctorEmail
            });
            alert("Prescription saved for all medications.");
            navigate('/vet-appointments');
        } catch (err) { console.error(err); }
    };

    return (
        <div style={containerStyle}>
            <h2 style={{ color: '#1DB954', textAlign: 'center', marginTop: 0 }}>💊 Add Clinical Record</h2>

            {medications.map((med, index) => (
                <div key={index} style={medicationCard}>
                    <label style={{ fontWeight: '600', color: '#333', marginBottom: '8px', display: 'block' }}>Medication Name {index + 1}</label>
                    <input
                        style={inputStyle}
                        placeholder="e.g., Amoxicillin"
                        value={med.name}
                        onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                    />

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontWeight: '600', color: '#333', fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>Quantity</label>
                            <input 
                                type="number" 
                                style={inputStyle} 
                                value={med.quantity} 
                                onChange={(e) => handleInputChange(index, 'quantity', e.target.value)} 
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontWeight: '600', color: '#333', fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>Course Duration</label>
                            <select 
                                style={inputStyle} 
                                value={med.course} 
                                onChange={(e) => handleInputChange(index, 'course', e.target.value)}>
                                <option>3 Days</option>
                                <option>5 Days</option>
                                <option>1 Week</option>
                            </select>
                        </div>
                    </div>

                    <label style={{ fontWeight: '600', color: '#333', marginBottom: '12px', marginTop: '12px', display: 'block' }}>Dosage Schedule</label>
                    <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', backgroundColor: '#f5f9f7', padding: '12px 14px', borderRadius: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
                            <input type="checkbox" checked={med.morning} onChange={(e) => handleInputChange(index, 'morning', e.target.checked)} />
                            🌅 Morning
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
                            <input type="checkbox" checked={med.afternoon} onChange={(e) => handleInputChange(index, 'afternoon', e.target.checked)} />
                            ☀️ Afternoon
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
                            <input type="checkbox" checked={med.evening} onChange={(e) => handleInputChange(index, 'evening', e.target.checked)} />
                            🌙 Evening
                        </label>
                    </div>
                    <hr style={{ borderColor: '#e0e0e0', marginTop: '16px', marginBottom: '16px' }} />
                </div>
            ))}

            <button 
                onClick={addMedicineField} 
                onMouseEnter={() => setHoveredBtn('add')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{ ...btnAdd, ...(hoveredBtn === 'add' ? { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', backgroundColor: '#e8e8e8' } : {}) }}>
                ➕ Add Another Medicine
            </button>
            <button 
                onClick={savePrescription} 
                onMouseEnter={() => setHoveredBtn('save')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{ ...btnSave, ...(hoveredBtn === 'save' ? { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(29, 185, 84, 0.3)', backgroundColor: '#17a342' } : {}) }}>
                Save Clinical Record
            </button>
        </div>
    );
};

// Styles
const containerStyle = { maxWidth: '520px', margin: '32px auto', padding: '32px', border: '2px solid #f0f0f0', borderRadius: '14px', backgroundColor: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', transition: 'all 0.3s ease' };
const medicationCard = { marginBottom: '24px', padding: '18px', backgroundColor: '#f9f9f9', borderRadius: '10px', border: '2px solid #f0f0f0', transition: 'all 0.3s ease' };
const inputStyle = { width: '100%', padding: '12px 14px', margin: '8px 0', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '0.95rem', fontFamily: 'inherit', transition: 'all 0.3s ease', boxSizing: 'border-box' };
const btnAdd = { width: '100%', padding: '12px 16px', marginBottom: '12px', backgroundColor: '#f5f5f5', border: '2px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease', fontSize: '0.95rem' };
const btnSave = { width: '100%', padding: '13px 16px', backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease', fontSize: '0.95rem' };

export default AddHealthRecord;