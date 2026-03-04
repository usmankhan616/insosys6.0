import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OrderTracking = () => {
    const navigate = useNavigate();
    const userEmail = localStorage.getItem("userEmail");
    const [orders, setOrders] = useState([]);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchOrders = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/orders/history?email=${userEmail}`);
            setOrders(res.data);
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const getStatusColor = (status) => {
        const colors = {
            'PLACED': '#2196F3',
            'SHIPPED': '#FF9800',
            'DELIVERED': '#4CAF50',
            'CANCELLED': '#f44336'
        };
        return colors[status] || '#999';
    };

    const getStatusIcon = (status) => {
        const icons = { 'PLACED': '📋', 'SHIPPED': '🚚', 'DELIVERED': '✅', 'CANCELLED': '❌' };
        return icons[status] || '📦';
    };

    const getProgressSteps = (status) => {
        const steps = ['PLACED', 'SHIPPED', 'DELIVERED'];
        if (status === 'CANCELLED') return { steps: ['PLACED', 'CANCELLED'], currentIndex: 1 };
        const currentIndex = steps.indexOf(status);
        return { steps, currentIndex: currentIndex >= 0 ? currentIndex : 0 };
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={containerStyle}>
            {/* Navigation */}
            <nav style={navStyle}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button onClick={() => navigate('/dashboard')} style={btnNav}>🏠 Home</button>
                    <h1 style={{ margin: 0 }}>📦 Order History</h1>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => navigate('/marketplace')} style={btnNav}>🛍️ Shop More</button>
                    <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={btnLogout}>Logout</button>
                </div>
            </nav>

            {loading ? (
                <p style={{ textAlign: 'center', color: '#888', marginTop: '60px' }}>Loading orders...</p>
            ) : orders.length === 0 ? (
                <div style={emptyState}>
                    <h3>No orders yet</h3>
                    <p>Browse our marketplace and place your first order!</p>
                    <button onClick={() => navigate('/marketplace')} style={btnPrimary}>Go to Marketplace</button>
                </div>
            ) : (
                <div style={ordersContainer}>
                    {orders.map(order => (
                        <div key={order.id} style={orderCard}>
                            {/* Order Header */}
                            <div style={orderHeader} onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                        <span style={{ fontSize: '1.2rem' }}>{getStatusIcon(order.status)}</span>
                                        <strong style={{ fontSize: '1.05rem' }}>Order #{order.id}</strong>
                                        <span style={{ ...statusBadge, backgroundColor: getStatusColor(order.status) }}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, color: '#888', fontSize: '0.85rem' }}>
                                        {formatDate(order.orderDate)} • {order.items?.length || 0} item(s)
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1DB954' }}>
                                        ${order.totalAmount?.toFixed(2)}
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
                                        {expandedOrder === order.id ? '▲ Hide' : '▼ Details'}
                                    </span>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedOrder === order.id && (
                                <div style={orderDetails}>
                                    {/* Progress Tracker */}
                                    <div style={progressContainer}>
                                        {(() => {
                                            const { steps, currentIndex } = getProgressSteps(order.status);
                                            return steps.map((step, idx) => (
                                                <div key={step} style={progressStep}>
                                                    <div style={{
                                                        ...progressDot,
                                                        backgroundColor: idx <= currentIndex ? getStatusColor(order.status) : '#ddd',
                                                    }}>
                                                        {idx <= currentIndex ? '✓' : idx + 1}
                                                    </div>
                                                    <span style={{
                                                        fontSize: '0.8rem',
                                                        color: idx <= currentIndex ? '#333' : '#aaa',
                                                        fontWeight: idx === currentIndex ? 'bold' : 'normal'
                                                    }}>{step}</span>
                                                    {idx < steps.length - 1 && (
                                                        <div style={{
                                                            ...progressLine,
                                                            backgroundColor: idx < currentIndex ? getStatusColor(order.status) : '#ddd'
                                                        }} />
                                                    )}
                                                </div>
                                            ));
                                        })()}
                                    </div>

                                    {/* Items List */}
                                    <div style={{ marginTop: '15px' }}>
                                        <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Items Ordered:</h4>
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} style={itemRow}>
                                                <div style={{ flex: 1 }}>
                                                    <strong>{item.product?.name || 'Product'}</strong>
                                                    <p style={{ margin: '2px 0 0 0', color: '#888', fontSize: '0.85rem' }}>
                                                        Qty: {item.quantity} × ${item.product?.price?.toFixed(2) || '0.00'}
                                                    </p>
                                                </div>
                                                <span style={{ fontWeight: 'bold' }}>${item.price?.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Shipping Address */}
                                    {order.shippingAddress && (
                                        <div style={addressBox}>
                                            <strong>📍 Shipping Address:</strong>
                                            <p style={{ margin: '5px 0 0 0', color: '#555' }}>{order.shippingAddress}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- STYLES ---
const containerStyle = { padding: '20px', maxWidth: '900px', margin: '0 auto', minHeight: '100vh' };
const navStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' };
const btnNav = { padding: '8px 15px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const btnLogout = { padding: '8px 15px', backgroundColor: '#ff4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const btnPrimary = { padding: '14px 30px', backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' };

const emptyState = { textAlign: 'center', padding: '60px 20px', backgroundColor: '#f9f9f9', borderRadius: '15px', border: '2px dashed #ddd', marginTop: '30px' };
const ordersContainer = { display: 'flex', flexDirection: 'column', gap: '15px' };
const orderCard = { backgroundColor: '#fff', borderRadius: '15px', border: '1px solid #eee', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
const orderHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', cursor: 'pointer' };
const statusBadge = { color: 'white', padding: '3px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' };
const orderDetails = { padding: '0 20px 20px 20px', borderTop: '1px solid #f0f0f0' };

const progressContainer = { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0', gap: '5px' };
const progressStep = { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' };
const progressDot = { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '5px' };
const progressLine = { position: 'absolute', top: '16px', left: '32px', width: '60px', height: '3px' };

const itemRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f5' };
const addressBox = { marginTop: '15px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' };

export default OrderTracking;
