import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VaccinationSchedule = () => {
    const navigate = useNavigate();
    const userEmail = localStorage.getItem("userEmail");
    const [pets, setPets] = useState([]);
    const [selectedPet, setSelectedPet] = useState('');
    const [vaccinations, setVaccinations] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [hoveredBtn, setHoveredBtn] = useState(null);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [form, setForm] = useState({
        vaccineName: '', vaccineType: 'Core', dateAdministered: '', nextDueDate: '', veterinarianName: ''
    });

    useEffect(() => {
        axios.get(`http://localhost:8080/api/pets/owner?email=${userEmail}`)
            .then(res => setPets(res.data))
            .catch(err => console.error(err));
    }, [userEmail]);

    const fetchVaccinations = (petId) => {
        setSelectedPet(petId);
        axios.get(`http://localhost:8080/api/vaccinations/pet/${petId}`)
            .then(res => setVaccinations(res.data))
            .catch(err => console.error(err));
    };

    const toggleVaccinationCompleted = async (vaccId, current) => {
        try {
            const res = await axios.patch(`http://localhost:8080/api/vaccinations/complete/${vaccId}`, { completed: !current });
            // update local list
            setVaccinations(prev => prev.map(v => v.id === vaccId ? { ...v, isCompleted: res.data.isCompleted } : v));
        } catch (err) {
            console.error('Failed to update vaccination', err);
            alert('Failed to update vaccination status.');
        }
    };

    const handleAdd = async () => {
        // Validation
        if (!form.vaccineName.trim()) {
            alert("Please enter a vaccine name");
            return;
        }
        if (!form.dateAdministered) {
            alert("Please select the date administered");
            return;
        }
        if (!form.nextDueDate) {
            alert("Please select the next due date");
            return;
        }
        if (!form.veterinarianName.trim()) {
            alert("Please enter veterinarian name");
            return;
        }

        try {
            await axios.post('http://localhost:8080/api/vaccinations/add', {
                petId: selectedPet, ...form
            });
            alert("Vaccination record added successfully!");
            setShowForm(false);
            setForm({ vaccineName: '', vaccineType: 'Core', dateAdministered: '', nextDueDate: '', veterinarianName: '' });
            fetchVaccinations(selectedPet);
        } catch (err) {
            console.error(err);
            alert("Failed to add vaccination record. Please try again.");
        }
    };

    const getTypeBadge = (type) => {
        const colors = { Core: '#4CAF50', Noncore: '#FF9800', Overdue: '#f44336' };
        return { display: 'inline-block', padding: '3px 12px', borderRadius: '20px', backgroundColor: colors[type] || '#999', color: 'white', fontSize: '0.8rem', fontWeight: 'bold' };
    };

    const isOverdue = (nextDueDate) => new Date(nextDueDate) < new Date();

    return (
        <div style={containerStyle}>
        <div style={navHeader}>
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

            <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>💉 Vaccination Schedule</h2>

            <div style={cardStyle}>
                <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block', color: '#333' }}>Select Pet</label>
                <select 
                    onMouseEnter={() => setHoveredBtn('petSelect')}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{ 
                        ...inputStyle, 
                        ...(hoveredBtn === 'petSelect' ? { border: '2px solid #1DB954', boxShadow: '0 0 0 3px rgba(29, 185, 84, 0.1)' } : {})
                    }}
                    value={selectedPet} 
                    onChange={(e) => fetchVaccinations(e.target.value)}>
                    <option value="">Choose a Pet</option>
                    {pets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.species})</option>)}
                </select>
            </div>

            {selectedPet && (
                <>
                    {/* Vaccination Table */}
                    <div style={{ overflowX: 'auto', marginTop: '20px' }}>
                        <table style={tableStyle}>
                            <thead>
                                <tr style={{ backgroundColor: '#f5f5f5' }}>
                                    <th style={thStyle}>Name</th>
                                    <th style={thStyle}>Type</th>
                                    <th style={thStyle}>Date</th>
                                    <th style={thStyle}>Next Due</th>
                                    <th style={thStyle}>Veterinarian</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vaccinations.length === 0 ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No vaccination records found</td></tr>
                                ) : (
                                    vaccinations.map((v, idx) => (
                                        <tr 
                                            key={v.id} 
                                            onMouseEnter={() => setHoveredRow(idx)}
                                            onMouseLeave={() => setHoveredRow(null)}
                                            style={{ 
                                                borderBottom: '1px solid #eee',
                                                backgroundColor: hoveredRow === idx ? '#f0f8f4' : 'transparent',
                                                transition: 'all 0.2s ease'
                                            }}>
                                            <td style={tdStyle}><strong>{v.vaccineName}</strong></td>
                                            <td style={tdStyle}>
                                                <span style={getTypeBadge(v.isCompleted ? 'Core' : (isOverdue(v.nextDueDate) ? 'Overdue' : v.vaccineType))}>
                                                    {v.isCompleted ? '✓ Completed' : (isOverdue(v.nextDueDate) ? 'Overdue' : v.vaccineType)}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>{v.dateAdministered}</td>
                                            <td style={{ ...tdStyle, color: v.isCompleted ? '#4caf50' : (isOverdue(v.nextDueDate) ? '#f44336' : '#333'), fontWeight: v.isCompleted ? 'normal' : (isOverdue(v.nextDueDate) ? 'bold' : 'normal') }}>
                                                {v.nextDueDate} {!v.isCompleted && isOverdue(v.nextDueDate) && '⚠️'}
                                            </td>
                                            <td style={tdStyle}>{v.veterinarianName}</td>
                                            <td style={tdStyle}>
                                                <button
                                                    onClick={() => toggleVaccinationCompleted(v.id, v.isCompleted)}
                                                    style={{ ...vaccineActionBtn, ...(v.isCompleted ? vaccineActionDone : {}) }}
                                                >
                                                    {v.isCompleted ? '✓ Done' : 'Mark Done'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Add Vaccination Form */}
                    {!showForm ? (
                        <button 
                            onClick={() => setShowForm(true)} 
                            onMouseEnter={() => setHoveredBtn('addVacc')}
                            onMouseLeave={() => setHoveredBtn(null)}
                            style={{ ...btnPrimary, ...(hoveredBtn === 'addVacc' ? { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(29, 185, 84, 0.3)', backgroundColor: '#17a342' } : {}) }}>
                            + Add Vaccination Record
                        </button>
                    ) : (
                        <div style={{ ...cardStyle, marginTop: '20px' }}>
                            <h3 style={{ color: '#2c3e50', marginTop: '0' }}>New Vaccination Record</h3>
                            <input 
                                style={inputStyle} 
                                placeholder="Vaccine Name (e.g., Rabies)" 
                                value={form.vaccineName}
                                onChange={e => setForm({ ...form, vaccineName: e.target.value })} 
                            />
                            <label style={{ fontSize: '0.85rem', color: '#666', fontWeight: '600', marginBottom: '5px', display: 'block' }}>Type</label>
                            <select 
                                style={inputStyle} 
                                value={form.vaccineType}
                                onChange={e => setForm({ ...form, vaccineType: e.target.value })}>
                                <option value="Core">Core</option>
                                <option value="Noncore">Noncore</option>
                            </select>
                            <label style={{ fontSize: '0.85rem', color: '#666', fontWeight: '600', marginBottom: '5px', display: 'block' }}>Date Administered</label>
                            <input 
                                type="date" 
                                style={inputStyle} 
                                value={form.dateAdministered}
                                onChange={e => setForm({ ...form, dateAdministered: e.target.value })} 
                            />
                            <label style={{ fontSize: '0.85rem', color: '#666', fontWeight: '600', marginBottom: '5px', display: 'block' }}>Next Due Date</label>
                            <input 
                                type="date" 
                                style={inputStyle} 
                                value={form.nextDueDate}
                                onChange={e => setForm({ ...form, nextDueDate: e.target.value })} 
                            />
                            <input 
                                style={inputStyle} 
                                placeholder="Veterinarian Name" 
                                value={form.veterinarianName}
                                onChange={e => setForm({ ...form, veterinarianName: e.target.value })} 
                            />
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button 
                                    onClick={handleAdd}
                                    disabled={!form.vaccineName.trim() || !form.dateAdministered || !form.nextDueDate || !form.veterinarianName.trim()}
                                    onMouseEnter={() => setHoveredBtn('save')}
                                    onMouseLeave={() => setHoveredBtn(null)}
                                    style={{ ...btnPrimary, flex: 1, marginTop: '4px', ...(form.vaccineName.trim() && form.dateAdministered && form.nextDueDate && form.veterinarianName.trim() ? (hoveredBtn === 'save' ? { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(29, 185, 84, 0.3)', backgroundColor: '#17a342' } : {}) : { opacity: 0.5, cursor: 'not-allowed' }) }}>
                                    Save
                                </button>
                                <button 
                                    onClick={() => setShowForm(false)}
                                    onMouseEnter={() => setHoveredBtn('cancel')}
                                    onMouseLeave={() => setHoveredBtn(null)}
                                    style={{ ...btnCancel, flex: 1, marginTop: '4px', ...(hoveredBtn === 'cancel' ? { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', backgroundColor: '#efefef' } : {}) }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// responsive container
const isMobileVS = typeof window !== 'undefined' && window.innerWidth < 768;
const containerStyle = { maxWidth: isMobileVS ? '100%' : '900px', margin: isMobileVS ? '20px auto' : '40px auto', padding: isMobileVS ? '12px' : '20px', boxSizing: 'border-box' };
const navHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '25px', gap: '10px' };
const cardStyle = { backgroundColor: '#fff', padding: '28px', borderRadius: '14px', border: '2px solid #f0f0f0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', marginBottom: '20px', transition: 'all 0.3s ease' };
const inputStyle = { width: '100%', padding: '13px 14px', marginBottom: '12px', borderRadius: '10px', border: '2px solid #e0e0e0', fontSize: '0.95rem', fontFamily: 'inherit', transition: 'all 0.3s ease', boxSizing: 'border-box' };
const btnNav = { padding: '10px 16px', backgroundColor: '#f5f5f5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease', fontSize: '0.95rem' };
const btnPrimary = { marginTop: '15px', padding: '13px 24px', backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', width: '100%', transition: 'all 0.3s ease' };
const btnCancel = { marginTop: '15px', padding: '13px 24px', backgroundColor: '#f5f5f5', color: '#333', border: '2px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', width: '100%', fontWeight: '600', transition: 'all 0.3s ease' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', borderRadius: '10px', overflow: 'hidden', border: '2px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' };
const thStyle = { padding: '16px 14px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', color: '#555', backgroundColor: '#f8f8f8', borderBottom: '2px solid #e0e0e0' };
const tdStyle = { padding: '14px', fontSize: '0.9rem', color: '#333' };
const vaccineActionBtn = { padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: '#1976d2', color: 'white', fontWeight: '600', transition: 'all 0.2s ease' };
const vaccineActionDone = { backgroundColor: '#4caf50', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' };

export default VaccinationSchedule;
