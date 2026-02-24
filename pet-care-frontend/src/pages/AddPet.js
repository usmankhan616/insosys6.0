import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddPet = () => {
    const [petData, setPetData] = useState({ name: '', species: '', breed: '', age: '', weight: '' });
    const navigate = useNavigate();
    const userEmail = localStorage.getItem("userEmail");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Links the pet to the logged-in user email
            await axios.post(`http://localhost:8080/api/pets/add?email=${userEmail}`, petData);
            alert("Pet Registered Successfully!");
            navigate('/health-management'); // Redirect back to pet list
        } catch (error) {
            console.error(error);
            alert("Failed to register pet. Check if backend is running.");
        }
    };

    return (
        <div style={containerStyle}>
            {/* --- DUAL NAVIGATION HEADER --- */}
            <div style={navContainer}>
                <button onClick={() => navigate(-1)} style={btnNav}>← Back</button>
                <button onClick={() => navigate('/dashboard')} style={btnNav}>🏠 Home</button>
            </div>

            <h2 style={{ textAlign: 'center', fontWeight: 'bold' }}>Register New Pet</h2>

            <form onSubmit={handleSubmit} style={formStyle}>
                <input
                    type="text"
                    placeholder="Pet Name"
                    style={inputStyle}
                    onChange={(e) => setPetData({...petData, name: e.target.value})}
                    required
                />
                <input
                    type="text"
                    placeholder="Species (e.g. Dog)"
                    style={inputStyle}
                    onChange={(e) => setPetData({...petData, species: e.target.value})}
                    required
                />
                <input
                    type="text"
                    placeholder="Breed"
                    style={inputStyle}
                    onChange={(e) => setPetData({...petData, breed: e.target.value})}
                />
                <input
                    type="number"
                    placeholder="Age"
                    style={inputStyle}
                    onChange={(e) => setPetData({...petData, age: e.target.value})}
                />
                <input
                    type="number"
                    step="0.1"
                    placeholder="Weight (kg)"
                    style={inputStyle}
                    onChange={(e) => setPetData({...petData, weight: e.target.value})}
                />
                <button type="submit" style={btnSave}>Save Pet</button>
            </form>
        </div>
    );
};

// --- STYLES (Matching AddHealthRecord.js) ---
const containerStyle = { maxWidth: '500px', margin: '40px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '15px', backgroundColor: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };
const navContainer = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' };
const btnNav = { background: '#f0f0f0', border: '1px solid #ccc', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: '500' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '10px', width: '100%', boxSizing: 'border-box' };
const btnSave = { padding: '15px', backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' };

export default AddPet;