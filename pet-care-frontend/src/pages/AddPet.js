import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddPet = () => {
    const [petData, setPetData] = useState({ name: '', species: '', breed: '', age: '', weight: '' });
    const navigate = useNavigate();
    const userEmail = localStorage.getItem("userEmail");
    const [hoveredBtn, setHoveredBtn] = useState(null);
    const [hoveredInput, setHoveredInput] = useState(null);

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

            <h2 style={{ textAlign: 'center', fontWeight: 'bold' }}>Register New Pet</h2>

            <form onSubmit={handleSubmit} style={formStyle}>
                <label style={{ fontWeight: '600', color: '#333', marginTop: '8px' }}>Pet Name</label>
                <input
                    type="text"
                    placeholder="Enter your pet's name"
                    style={{ ...inputStyle, ...(hoveredInput === 'name' ? { border: '2px solid #1DB954', boxShadow: '0 0 0 3px rgba(29, 185, 84, 0.1)' } : {}) }}
                    onMouseEnter={() => setHoveredInput('name')}
                    onMouseLeave={() => setHoveredInput(null)}
                    onChange={(e) => setPetData({...petData, name: e.target.value})}
                    required
                />
                <label style={{ fontWeight: '600', color: '#333', marginTop: '8px' }}>Species</label>
                <input
                    type="text"
                    placeholder="e.g., Dog, Cat, Bird"
                    style={{ ...inputStyle, ...(hoveredInput === 'species' ? { border: '2px solid #1DB954', boxShadow: '0 0 0 3px rgba(29, 185, 84, 0.1)' } : {}) }}
                    onMouseEnter={() => setHoveredInput('species')}
                    onMouseLeave={() => setHoveredInput(null)}
                    onChange={(e) => setPetData({...petData, species: e.target.value})}
                    required
                />
                <label style={{ fontWeight: '600', color: '#333', marginTop: '8px' }}>Breed</label>
                <input
                    type="text"
                    placeholder="Enter breed info"
                    style={{ ...inputStyle, ...(hoveredInput === 'breed' ? { border: '2px solid #1DB954', boxShadow: '0 0 0 3px rgba(29, 185, 84, 0.1)' } : {}) }}
                    onMouseEnter={() => setHoveredInput('breed')}
                    onMouseLeave={() => setHoveredInput(null)}
                    onChange={(e) => setPetData({...petData, breed: e.target.value})}
                />
                <label style={{ fontWeight: '600', color: '#333', marginTop: '8px' }}>Age</label>
                <input
                    type="number"
                    placeholder="Age in years"
                    style={{ ...inputStyle, ...(hoveredInput === 'age' ? { border: '2px solid #1DB954', boxShadow: '0 0 0 3px rgba(29, 185, 84, 0.1)' } : {}) }}
                    onMouseEnter={() => setHoveredInput('age')}
                    onMouseLeave={() => setHoveredInput(null)}
                    onChange={(e) => setPetData({...petData, age: e.target.value})}
                />
                <label style={{ fontWeight: '600', color: '#333', marginTop: '8px' }}>Weight</label>
                <input
                    type="number"
                    step="0.1"
                    placeholder="Weight in kg"
                    style={{ ...inputStyle, ...(hoveredInput === 'weight' ? { border: '2px solid #1DB954', boxShadow: '0 0 0 3px rgba(29, 185, 84, 0.1)' } : {}) }}
                    onMouseEnter={() => setHoveredInput('weight')}
                    onMouseLeave={() => setHoveredInput(null)}
                    onChange={(e) => setPetData({...petData, weight: e.target.value})}
                />
                <button 
                    type="submit" 
                    onMouseEnter={() => setHoveredBtn('save')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{ ...btnSave, ...(hoveredBtn === 'save' ? { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(29, 185, 84, 0.3)', backgroundColor: '#17a342' } : {}) }}>
                    Save Pet
                </button>
            </form>
        </div>
    );
};

// --- STYLES (Matching AddHealthRecord.js) ---
const containerStyle = { maxWidth: '500px', margin: '40px auto', padding: '32px', border: '2px solid #f0f0f0', borderRadius: '14px', backgroundColor: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', transition: 'all 0.3s ease' };
const navContainer = { display: 'flex', justifyContent: 'space-between', marginBottom: '24px', gap: '10px' };
const btnNav = { backgroundColor: '#f5f5f5', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease', fontSize: '0.95rem' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '12px' };
const inputStyle = { padding: '13px 14px', borderRadius: '10px', border: '2px solid #e0e0e0', marginBottom: '8px', width: '100%', boxSizing: 'border-box', fontSize: '0.95rem', fontFamily: 'inherit', transition: 'all 0.3s ease' };
const btnSave = { marginTop: '16px', padding: '13px', backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', transition: 'all 0.3s ease' };

export default AddPet;