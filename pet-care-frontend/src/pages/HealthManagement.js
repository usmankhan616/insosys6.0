import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const HealthManagement = () => {
    const [pets, setPets] = useState([]);
    const navigate = useNavigate();
    const userEmail = localStorage.getItem("userEmail");

    useEffect(() => {
        const fetchPets = async () => {
            try {
                // Fetching pets belonging to the logged-in user
                const response = await axios.get(`http://localhost:8080/api/pets/owner?email=${userEmail}`);
                setPets(response.data);
            } catch (error) {
                console.error("Error fetching pets:", error);
            }
        };
        if (userEmail) fetchPets();
    }, [userEmail]);

    return (
        <div style={{ padding: '20px' }}>
            {/* NEW: Navigation Header with Home Button */}
            <nav style={navStyle}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button onClick={() => navigate('/dashboard')} style={btnNav}>🏠 Home</button>
                    <h1 style={{ margin: 0 }}>My Pets</h1>
                </div>
                <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={btnLogout}>Logout</button>
            </nav>

            <p style={{ marginTop: '10px' }}>Managing pets for: <strong>{userEmail}</strong></p>

            <div style={gridStyle}>
                {pets.length === 0 ? (
                    <div style={emptyState}>
                        <p>No pets found. Register your first pet to start tracking health!</p>
                    </div>
                ) : (
                    pets.map(pet => (
                        <div key={pet.id} style={cardStyle}>
                            <h3 style={{ textTransform: 'capitalize' }}>{pet.name}</h3>
                            <p>{pet.species} | {pet.breed}</p>
                            <button
                                onClick={() => navigate(`/pet-profile/${pet.id}`)}
                                style={btnAction}
                            >
                                View Health Records
                            </button>
                        </div>
                    ))
                )}
            </div>

            <button onClick={() => navigate('/add-pet')} style={btnPrimary}>
                + Register New Pet
            </button>
        </div>
    );
};

// --- STYLES ---
const navStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px' };
const btnNav = { padding: '8px 15px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const btnLogout = { padding: '8px 15px', backgroundColor: '#ff4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' };
const cardStyle = { padding: '25px', border: '1px solid #ddd', borderRadius: '15px', textAlign: 'center', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };
const emptyState = { gridColumn: '1/-1', padding: '40px', textAlign: 'center', color: '#666', border: '2px dashed #ccc', borderRadius: '10px' };
const btnPrimary = { marginTop: '30px', padding: '12px 24px', backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' };
const btnAction = { marginTop: '10px', padding: '8px 16px', border: '1px solid #1DB954', color: '#1DB954', background: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '500' };

export default HealthManagement;