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
            <h2 style={{ color: '#1DB954', textAlign: 'center' }}>Add Clinical Record</h2>

            {medications.map((med, index) => (
                <div key={index} style={medicationCard}>
                    <label>Medication Name {index + 1}</label>
                    <input
                        style={inputStyle}
                        placeholder="e.g. Amoxicillin"
                        value={med.name}
                        onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                    />

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 1 }}>
                            <label>Quantity</label>
                            <input type="number" style={inputStyle} value={med.quantity} onChange={(e) => handleInputChange(index, 'quantity', e.target.value)} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Course</label>
                            <select style={inputStyle} value={med.course} onChange={(e) => handleInputChange(index, 'course', e.target.value)}>
                                <option>3 Days</option>
                                <option>5 Days</option>
                                <option>1 Week</option>
                            </select>
                        </div>
                    </div>

                    <label>Schedule</label>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                        <label><input type="checkbox" checked={med.morning} onChange={(e) => handleInputChange(index, 'morning', e.target.checked)} /> Morning</label>
                        <label><input type="checkbox" checked={med.afternoon} onChange={(e) => handleInputChange(index, 'afternoon', e.target.checked)} /> Afternoon</label>
                        <label><input type="checkbox" checked={med.evening} onChange={(e) => handleInputChange(index, 'evening', e.target.checked)} /> Evening</label>
                    </div>
                    <hr />
                </div>
            ))}

            <button onClick={addMedicineField} style={btnAdd}>➕ Add Another Medicine</button>
            <button onClick={savePrescription} style={btnSave}>Save Clinical Record</button>
        </div>
    );
};

// Styles
const containerStyle = { maxWidth: '500px', margin: '20px auto', padding: '25px', border: '1px solid #ddd', borderRadius: '15px', backgroundColor: '#fff' };
const medicationCard = { marginBottom: '20px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '10px' };
const inputStyle = { width: '100%', padding: '10px', margin: '8px 0', border: '1px solid #ccc', borderRadius: '8px' };
const btnAdd = { width: '100%', padding: '10px', marginBottom: '10px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer' };
const btnSave = { width: '100%', padding: '15px', backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };

export default AddHealthRecord;