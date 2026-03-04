import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const HealthManagement = () => {
    const [pets, setPets] = useState([]);
    const navigate = useNavigate();
    const userEmail = localStorage.getItem("userEmail");
    const [hoveredCard, setHoveredCard] = useState(null);
    const [hoveredBtn, setHoveredBtn] = useState(null);

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
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        onMouseEnter={() => setHoveredBtn('home')}
                        onMouseLeave={() => setHoveredBtn(null)}
                        style={{ ...btnNav, ...(hoveredBtn === 'home' ? { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', backgroundColor: '#e8e8e8' } : {}) }}>
                        🏠 Home
                    </button>
                    <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '1.8rem', fontWeight: '700' }}>My Pets</h1>
                </div>
                <button 
                    onClick={() => { localStorage.clear(); navigate('/login'); }} 
                    onMouseEnter={() => setHoveredBtn('logout')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{ ...btnLogout, ...(hoveredBtn === 'logout' ? { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(255, 68, 68, 0.3)', backgroundColor: '#d63939' } : {}) }}>
                    Logout
                </button>
            </nav>

            <p style={{ marginTop: '10px', color: '#666', fontSize: '0.95rem' }}>Managing pets for: <strong style={{ color: '#1DB954' }}>{userEmail}</strong></p>

            <div style={gridStyle}>
                {pets.length === 0 ? (
                    <div style={emptyState}>
                        <p>🐾 No pets found. Register your first pet to start tracking health!</p>
                    </div>
                ) : (
                    pets.map(pet => (
                        <div 
                            key={pet.id} 
                            onMouseEnter={() => setHoveredCard(pet.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            style={{ ...cardStyle, ...(hoveredCard === pet.id ? { transform: 'translateY(-6px)', boxShadow: '0 12px 28px rgba(29, 185, 84, 0.15)', border: '2px solid #1DB954' } : {}) }}>
                            <h3 style={{ textTransform: 'capitalize', margin: '0 0 8px 0', color: '#2c3e50', fontSize: '1.3rem', fontWeight: '700' }}>🐕 {pet.name}</h3>
                            <p style={{ margin: '8px 0', color: '#666', fontSize: '0.95rem' }}>
                                <strong>{pet.species}</strong> | {pet.breed || 'Unknown Breed'}
                            </p>
                            <button
                                onClick={() => navigate(`/pet-profile/${pet.id}`)}
                                onMouseEnter={() => setHoveredBtn(`view-${pet.id}`)}
                                onMouseLeave={() => setHoveredBtn(null)}
                                style={{ ...btnAction, ...(hoveredBtn === `view-${pet.id}` ? { backgroundColor: '#1DB954', color: 'white', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(29, 185, 84, 0.2)' } : {}) }}
                            >
                                📋 View Health Records
                            </button>
                        </div>
                    ))
                )}
            </div>

            <button 
                onClick={() => navigate('/add-pet')} 
                onMouseEnter={() => setHoveredBtn('addPet')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{ ...btnPrimary, ...(hoveredBtn === 'addPet' ? { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(29, 185, 84, 0.3)', backgroundColor: '#17a342' } : {}) }}>
                + Register New Pet
            </button>
        </div>
    );
};

// --- STYLES ---
const navStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f0f0f0', paddingBottom: '18px', marginBottom: '24px', gap: '20px' };
const btnNav = { padding: '10px 16px', backgroundColor: '#f5f5f5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease', fontSize: '0.95rem' };
const btnLogout = { padding: '10px 16px', backgroundColor: '#ff5252', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease', fontSize: '0.95rem' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '28px' };
const cardStyle = { padding: '28px', border: '2px solid #f0f0f0', borderRadius: '14px', textAlign: 'center', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' };
const emptyState = { gridColumn: '1/-1', padding: '48px 40px', textAlign: 'center', color: '#999', border: '2px dashed #ddd', borderRadius: '12px', backgroundColor: '#f9f9f9', fontSize: '1.05rem' };
const btnPrimary = { marginTop: '32px', padding: '13px 24px', backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', transition: 'all 0.3s ease', width: '100%' };
const btnAction = { marginTop: '12px', padding: '10px 16px', border: '2px solid #1DB954', color: '#1DB954', backgroundColor: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.3s ease' };

export default HealthManagement;