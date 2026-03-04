import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Antigravity from '../components/Antigravity';

const Login = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const checkEmail = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get(`http://localhost:8080/api/auth/check-email?email=${email}`);
            if (response.data === true) {
                setStep(2);
            } else {
                alert("Account not found. Please sign up.");
            }
        } catch (error) {
            alert("Error checking email. Is the backend running?");
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "http://localhost:8080/api/auth/login",
                { email, password }
            );

            // ✅ Expecting object response from backend
            if (response.data.message === "Login Successful") {

                // store email
                localStorage.setItem("userEmail", email);

                // ✅ store role for RBAC
                localStorage.setItem("userRole", response.data.role);

                // navigate to dashboard
                navigate('/dashboard');

            } else {
                alert("Incorrect password.");
            }

        } catch (error) {
            alert("Login failed.");
            console.error(error);
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
                <div style={{ fontSize: '30px', marginBottom: '20px' }}>🐾</div>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>Welcome back</h1>

                {step === 1 ? (
                    <form onSubmit={checkEmail}>
                        <p style={{ textAlign: 'left', fontWeight: 'bold', marginBottom: '8px' }}>Email address</p>
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
                        <button type="submit" style={buttonStyle}>Next</button>
                    </form>
                ) : (
                    <form onSubmit={handleLogin}>
                        <p style={{ textAlign: 'left', marginBottom: '8px' }}>Password for <strong>{email}</strong></p>
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
                        <button type="submit" style={buttonStyle}>Login</button>
                        <button type="button" onClick={() => setStep(1)} style={{ backgroundColor: 'transparent', border: 'none', color: '#666', marginTop: '10px', cursor: 'pointer' }}>Edit email</button>
                    </form>
                )}

                <hr style={{ margin: '30px 0', border: '0.5px solid rgba(0,0,0,0.1)' }} />
                <p style={{ color: '#555' }}>Don't have an account?
                    <span onClick={() => navigate('/signup')} style={{ color: '#1DB954', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}>Sign up</span>
                </p>
            </div>
        </div>
    );
};

const containerStyle = { position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px', padding: '40px', backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '16px', textAlign: 'center', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)' };
const inputStyle = { width: '100%', padding: '14px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', backgroundColor: 'rgba(255,255,255,0.9)', outline: 'none', transition: 'border 0.2s', color: '#333' };
const buttonStyle = { width: '100%', padding: '14px', backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' };

export default Login;