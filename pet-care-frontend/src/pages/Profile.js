import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState({ fullName: '', email: '', role: '' });
    const [showPassFields, setShowPassFields] = useState(false);
    const [passwords, setPasswords] = useState({ newPass: '', confirmPass: '' });
    const navigate = useNavigate();
    const email = localStorage.getItem("userEmail");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/auth/profile?email=${email}`);
                setUser(response.data);
            } catch (error) {
                console.error("Error fetching profile", error);
            }
        };
        if (email) fetchProfile();
    }, [email]);

    const handlePasswordChange = async () => {
        if (passwords.newPass !== passwords.confirmPass) {
            alert("Passwords do not match!");
            return;
        }
        try {
            await axios.put(`http://localhost:8080/api/auth/change-password?email=${email}&newPassword=${passwords.newPass}`);
            alert("Password updated successfully!");
            setShowPassFields(false);
            setPasswords({ newPass: '', confirmPass: '' });
        } catch (error) {
            alert("Failed to update password.");
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
            try {
                await axios.delete(`http://localhost:8080/api/auth/delete?email=${email}`);
                alert("Account deleted successfully.");
                localStorage.clear();
                navigate('/signup');
            } catch (error) {
                alert("Delete failed.");
            }
        }
    };

    return (
        <div style={containerStyle}>
            <h2 style={{ borderBottom: '2px solid #1DB954', paddingBottom: '10px' }}>User Profile</h2>

            <div style={infoBox}>
                <p><strong>Name:</strong> {user.fullName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
            </div>

            <div style={actionArea}>
                {!showPassFields ? (
                    <button onClick={() => setShowPassFields(true)} style={btnBlue}>Change Password</button>
                ) : (
                    <div style={passwordForm}>
                        <input type="password" placeholder="New Password" style={inputStyle}
                               onChange={(e) => setPasswords({...passwords, newPass: e.target.value})} />
                        <input type="password" placeholder="Confirm Password" style={inputStyle}
                               onChange={(e) => setPasswords({...passwords, confirmPass: e.target.value})} />
                        <button onClick={handlePasswordChange} style={btnGreen}>Update Password</button>
                        <button onClick={() => setShowPassFields(false)} style={btnCancel}>Cancel</button>
                    </div>
                )}

                <button onClick={handleDeleteAccount} style={btnRed}>Delete My Profile</button>
            </div>

            <button onClick={() => navigate('/dashboard')} style={btnBack}>Back to Dashboard</button>
        </div>
    );
};

const containerStyle = { maxWidth: '450px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' };
const infoBox = { textAlign: 'left', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', margin: '20px 0' };
const actionArea = { display: 'flex', flexDirection: 'column', gap: '10px' };
const passwordForm = { display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px', border: '1px solid #eee', borderRadius: '8px' };
const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ccc' };
const btnBlue = { padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const btnGreen = { padding: '12px', backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const btnCancel = { padding: '5px', background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '12px' };
const btnRed = { padding: '12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const btnBack = { marginTop: '20px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' };

export default Profile;