import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Antigravity from '../components/Antigravity';

const Signup = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'PET_OWNER'
    });
    const navigate = useNavigate(); // Added this

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8080/api/auth/signup", formData);
            alert("Account created successfully!");
            navigate('/login'); // Now this will work!
        } catch (error) {
            alert("Signup failed. Email might already be in use.");
        }
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#060010' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                <Antigravity
                    count={300}
                    magnetRadius={21}
                    ringRadius={10}
                    waveSpeed={0.4}
                    waveAmplitude={1}
                    particleSize={1.2}
                    lerpSpeed={0.1}
                    color="#1DB954"
                    autoAnimate={false}
                    particleVariance={1}
                    rotationSpeed={0}
                    depthFactor={1}
                    pulseSpeed={3}
                    particleShape="sphere"
                    fieldStrength={10}
                />
            </div>
            <div style={containerStyle}>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>Create an Account</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} required style={inputStyle} />
                    <input type="email" name="email" placeholder="Email" onChange={handleChange} required style={inputStyle} />
                    <input type="password" name="password" placeholder="Password" onChange={handleChange} required style={inputStyle} />
                    <select name="role" onChange={handleChange} style={inputStyle}>
                        <option value="PET_OWNER">Pet Owner</option>
                        <option value="DOCTOR">Doctor</option>
                    </select>
                    <button type="submit" style={buttonStyle}>Sign Up</button>
                </form>
                <p style={{ marginTop: '20px', color: '#555' }}>
                    Already have an account?
                    <span onClick={() => navigate('/login')} style={{ color: '#1DB954', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}>Login</span>
                </p>
            </div>
        </div>
    );
};

const containerStyle = { position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px', padding: '40px', backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '16px', textAlign: 'center', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)' };
const inputStyle = { width: '100%', padding: '14px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', backgroundColor: 'rgba(255,255,255,0.9)', outline: 'none', transition: 'border 0.2s', color: '#333' };
const buttonStyle = { width: '100%', padding: '14px', backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', marginTop: '10px' };

export default Signup;