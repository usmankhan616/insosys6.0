import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
        <div style={containerStyle}>
            <div style={{fontSize: '30px', marginBottom: '20px'}}>🐾</div>
            <h1 style={{fontSize: '32px', fontWeight: 'bold'}}>Welcome back</h1>

            {step === 1 ? (
                <form onSubmit={checkEmail}>
                    <p style={{textAlign: 'left', fontWeight: 'bold', marginBottom: '8px'}}>Email address</p>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
                    <button type="submit" style={buttonStyle}>Next</button>
                </form>
            ) : (
                <form onSubmit={handleLogin}>
                    <p style={{textAlign: 'left', marginBottom: '8px'}}>Password for <strong>{email}</strong></p>
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
                    <button type="submit" style={buttonStyle}>Login</button>
                    <button type="button" onClick={() => setStep(1)} style={{background: 'none', border: 'none', color: '#666', marginTop: '10px', cursor: 'pointer'}}>Edit email</button>
                </form>
            )}

            <hr style={{margin: '30px 0', border: '0.5px solid #eee'}} />
            <p style={{color: '#666'}}>Don't have an account?
                <span onClick={() => navigate('/signup')} style={{color: '#1DB954', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px'}}>Sign up</span>
            </p>
        </div>
    );
};

const containerStyle = { maxWidth: '400px', margin: '80px auto', padding: '40px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' };
const inputStyle = { width: '100%', padding: '14px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #181818', boxSizing: 'border-box' };
const buttonStyle = { width: '100%', padding: '14px', backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' };

export default Login;