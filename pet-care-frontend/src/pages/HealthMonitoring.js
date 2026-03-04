import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Simulated health monitoring data (in production, this would come from IoT devices or manual entries)
const generateHealthData = () => {
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
    return months.map(month => ({
        month,
        stressLevel: Math.floor(Math.random() * 5) + 2,
        pulse: Math.floor(Math.random() * 30) + 70,
        temperature: (Math.random() * 2 + 37.5).toFixed(1),
        caloriesBurned: Math.floor(Math.random() * 300) + 200,
    }));
};

const HealthMonitoring = () => {
    const navigate = useNavigate();
    const userEmail = localStorage.getItem("userEmail");
    const [pets, setPets] = useState([]);
    const [selectedPet, setSelectedPet] = useState('');
    const [activeTab, setActiveTab] = useState('stressLevel');
    const [healthData] = useState(generateHealthData());
    const [timeRange, setTimeRange] = useState('Monthly');
    const [hoveredBtn, setHoveredBtn] = useState(null);
    const [hoveredRing, setHoveredRing] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:8080/api/pets/owner?email=${userEmail}`)
            .then(res => { setPets(res.data); if (res.data.length > 0) setSelectedPet(res.data[0].id); })
            .catch(err => console.error(err));
    }, [userEmail]);

    const tabs = [
        { key: 'stressLevel', label: '😰 Stress Level', color: '#8884d8' },
        { key: 'pulse', label: '💓 Pulse', color: '#e91e63' },
        { key: 'temperature', label: '🌡️ Temperature', color: '#ff9800' },
        { key: 'caloriesBurned', label: '🔥 Calories Burned', color: '#4caf50' },
    ];

    const activityData = { activity: 25, sleep: 79, wellness: 52 };

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

            <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>📊 Health Monitoring</h2>

            {/* Pet Selector */}
            <div style={cardStyle}>
                <select style={selectStyle} value={selectedPet} onChange={(e) => setSelectedPet(e.target.value)}>
                    {pets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.species})</option>)}
                </select>
            </div>

            {/* Activity Rings Section */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
                {[
                    { label: 'ACTIVITY', value: activityData.activity, color: '#f44336', period: 'Daily' },
                    { label: 'SLEEP', value: activityData.sleep, color: '#4caf50', period: 'Weekly' },
                    { label: 'WELLNESS', value: activityData.wellness, color: '#2196f3', period: 'Weekly' },
                ].map(ring => (
                    <div 
                        key={ring.label} 
                        onMouseEnter={() => setHoveredRing(ring.label)}
                        onMouseLeave={() => setHoveredRing(null)}
                        style={{ ...ringCard, ...(hoveredRing === ring.label ? { transform: 'translateY(-4px)', boxShadow: '0 8px 20px rgba(0,0,0,0.12)' } : {}) }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 'bold', letterSpacing: '1px' }}>{ring.label}</span>
                            <span style={{ fontSize: '0.75rem', color: '#aaa' }}>{ring.period}</span>
                        </div>
                        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto' }}>
                            <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none" stroke="#eee" strokeWidth="3" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none" stroke={ring.color} strokeWidth="3"
                                    strokeDasharray={`${ring.value}, 100`} />
                            </svg>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.8rem', fontWeight: 'bold' }}>
                                {ring.value}%
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Health Monitoring Chart */}
            <div style={{ ...cardStyle, marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>HEALTH MONITORING</h3>
                    <select style={{ padding: '6px 12px', borderRadius: '5px', border: '1px solid #ccc' }} value={timeRange} onChange={e => setTimeRange(e.target.value)}>
                        <option>Monthly</option>
                        <option>Weekly</option>
                    </select>
                </div>

                {/* Tab Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {tabs.map(tab => (
                        <button 
                            key={tab.key} 
                            onClick={() => setActiveTab(tab.key)}
                            onMouseEnter={() => setHoveredBtn(tab.key)}
                            onMouseLeave={() => setHoveredBtn(null)}
                            style={activeTab === tab.key ? { ...tabBtn, backgroundColor: tab.color, color: 'white', boxShadow: `0 4px 12px ${tab.color}40` } : 
                            { ...tabBtn, ...(hoveredBtn === tab.key ? { backgroundColor: `${tab.color}10`, border: `2px solid ${tab.color}`, transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${tab.color}20` } : {}) }}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Chart */}
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={healthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey={activeTab} stroke={tabs.find(t => t.key === activeTab)?.color}
                            strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Calories Bar Chart */}
            <div style={{ ...cardStyle, marginTop: '20px' }}>
                <h3>🔥 Calories Burned Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={healthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="caloriesBurned" fill="#4caf50" radius={[5, 5, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const containerStyle = { maxWidth: '1000px', margin: '30px auto', padding: '20px' };
const navHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '25px', gap: '10px' };
const cardStyle = { backgroundColor: '#fff', padding: '28px', borderRadius: '14px', border: '2px solid #f0f0f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', transition: 'all 0.3s ease' };
const ringCard = { flex: '1 1 200px', backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '2px solid #f0f0f0', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', transition: 'all 0.3s ease' };
const selectStyle = { width: '100%', padding: '12px 14px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '0.95rem', fontFamily: 'inherit', transition: 'all 0.3s ease' };
const tabBtn = { padding: '10px 18px', borderRadius: '20px', border: '2px solid #ddd', backgroundColor: '#f9f9f9', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', transition: 'all 0.3s ease' };
const btnNav = { padding: '10px 16px', backgroundColor: '#f5f5f5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease', fontSize: '0.95rem' };

export default HealthMonitoring;
