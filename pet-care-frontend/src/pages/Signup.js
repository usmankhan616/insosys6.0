import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Added this

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
        <div style={containerStyle}>
            <h2>Create an Account</h2>
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
            <p style={{marginTop: '20px'}}>
                Already have an account?
                <span onClick={() => navigate('/login')} style={{color: '#1DB954', cursor: 'pointer', fontWeight: 'bold'}}> Login</span>
            </p>
        </div>
    );
};

const containerStyle = { maxWidth: '400px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' };
const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' };
const buttonStyle = { width: '100%', padding: '12px', backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' };

export default Signup;