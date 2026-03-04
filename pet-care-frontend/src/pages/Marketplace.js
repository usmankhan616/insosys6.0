import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Marketplace = () => {
    const navigate = useNavigate();
    const userEmail = localStorage.getItem("userEmail");

    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [category, setCategory] = useState('All');
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [shippingAddress, setShippingAddress] = useState('');
    const [orderPlaced, setOrderPlaced] = useState(false);

    // Dummy Payment States
    const [showPayment, setShowPayment] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const categories = ['All', 'Food', 'Medicine', 'Accessories', 'Grooming'];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/products');
            setProducts(res.data);
            setFiltered(res.data);
        } catch (err) { console.error("Error fetching products:", err); }
    };

    useEffect(() => {
        let result = products;
        if (category !== 'All') {
            result = result.filter(p => p.category === category);
        }
        if (search.trim()) {
            result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        }
        setFiltered(result);
    }, [category, search, products]);

    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(cart.map(item => {
            if (item.id === productId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleCheckout = () => {
        if (!shippingAddress.trim()) { alert("Please enter a shipping address."); return; }
        setShowPayment(true);
    };

    const confirmPaymentAndPlaceOrder = async () => {
        setIsProcessing(true);
        // Simulate payment gateway delay
        setTimeout(async () => {
            setIsProcessing(false);
            setPaymentSuccess(true);

            try {
                const payload = {
                    email: userEmail,
                    shippingAddress,
                    items: cart.map(item => ({ productId: item.id, quantity: item.quantity }))
                };
                await axios.post('http://localhost:8080/api/orders/place', payload);

                setTimeout(() => {
                    setShowPayment(false);
                    setPaymentSuccess(false);
                    setOrderPlaced(true);
                    setCart([]);
                    fetchProducts(); // refresh stock
                    setTimeout(() => {
                        setOrderPlaced(false);
                        setShowCheckout(false);
                        setShowCart(false);
                        setShippingAddress('');
                    }, 3000);
                }, 1500); // Show success checkmark for 1.5s
            } catch (err) {
                console.error(err);
                alert("Order failed. Please try again.");
                setShowPayment(false);
            }
        }, 2000);
    };

    // --- CART SIDEBAR ---
    const renderCart = () => (
        <div style={cartOverlay}>
            <div style={cartPanel}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>🛒 Shopping Cart</h2>
                    <button onClick={() => { setShowCart(false); setShowCheckout(false); }} style={btnClose}>✕</button>
                </div>

                {orderPlaced ? (
                    <div style={successBox}>
                        <h3>✅ Order Placed Successfully!</h3>
                        <p>Your order is being processed. Track it from Order History.</p>
                        <button onClick={() => navigate('/order-tracking')} style={btnPrimary}>View Orders</button>
                    </div>
                ) : !showCheckout ? (
                    <>
                        {cart.length === 0 ? (
                            <p style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>Your cart is empty</p>
                        ) : (
                            <>
                                {cart.map(item => (
                                    <div key={item.id} style={cartItem}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 5px 0' }}>{item.name}</h4>
                                            <p style={{ margin: 0, color: '#888', fontSize: '0.85rem' }}>${item.price.toFixed(2)} each</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <button onClick={() => updateQuantity(item.id, -1)} style={qtyBtn}>−</button>
                                            <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} style={qtyBtn}>+</button>
                                            <button onClick={() => removeFromCart(item.id)} style={btnRemove}>🗑️</button>
                                        </div>
                                    </div>
                                ))}
                                <div style={totalBar}>
                                    <strong>Total: ${cartTotal.toFixed(2)}</strong>
                                </div>
                                <button onClick={() => setShowCheckout(true)} style={btnPrimary}>Proceed to Checkout</button>
                            </>
                        )}
                    </>
                ) : (
                    <div>
                        <h3>📦 Checkout</h3>
                        <div style={{ marginBottom: '15px' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Order Summary:</p>
                            {cart.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0f0' }}>
                                    <span>{item.name} × {item.quantity}</span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div style={{ ...totalBar, marginTop: '10px' }}><strong>Total: ${cartTotal.toFixed(2)}</strong></div>
                        </div>

                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Shipping Address</label>
                        <textarea
                            style={textAreaStyle}
                            placeholder="Enter your full shipping address..."
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            rows={3}
                        />

                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                            <button onClick={() => setShowCheckout(false)} style={btnSecondary}>← Back</button>
                            <button onClick={handleCheckout} style={btnPrimary}>Proceed to Payment</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Dummy Payment Modal */}
            {showPayment && (
                <div style={modalOverlayStyle} onClick={() => !isProcessing && setShowPayment(false)}>
                    <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#2c3e50' }}>Secure Payment</h3>

                        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', border: '1px solid #c8e6c9', color: '#2e7d32' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>Cart Total:</span>
                                <strong>${cartTotal.toFixed(2)}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', opacity: 0.8 }}>
                                <span>Shipping:</span>
                                <span>$5.00</span>
                            </div>
                            <hr style={{ borderColor: '#c8e6c9', opacity: 0.5, margin: '10px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                                <strong>Total Amount:</strong>
                                <strong>${(cartTotal + 5).toFixed(2)}</strong>
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontWeight: '500', display: 'block', marginBottom: '8px', color: '#2c3e50' }}>Payment Method</label>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <button
                                    className={`btn ${paymentMethod === 'card' ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => setPaymentMethod('card')}
                                    style={{ flex: 1, padding: '10px', border: paymentMethod === 'card' ? 'none' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', backgroundColor: paymentMethod === 'card' ? '#1DB954' : '#fff', color: paymentMethod === 'card' ? '#fff' : '#333' }}
                                >
                                    Credit Card
                                </button>
                                <button
                                    className={`btn ${paymentMethod === 'upi' ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => setPaymentMethod('upi')}
                                    style={{ flex: 1, padding: '10px', border: paymentMethod === 'upi' ? 'none' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', backgroundColor: paymentMethod === 'upi' ? '#1DB954' : '#fff', color: paymentMethod === 'upi' ? '#fff' : '#333' }}
                                >
                                    UPI
                                </button>
                            </div>
                        </div>

                        {paymentSuccess ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#1DB954' }}>
                                <div style={{ fontSize: '48px', marginBottom: '10px' }}>✓</div>
                                <h3 style={{ margin: 0 }}>Payment Successful!</h3>
                                <p style={{ color: '#666', marginTop: '10px' }}>Redirecting...</p>
                            </div>
                        ) : (
                            <button
                                onClick={confirmPaymentAndPlaceOrder}
                                disabled={isProcessing}
                                style={{ ...btnPrimary, position: 'relative' }}
                            >
                                {isProcessing ? 'Processing Payment...' : `Pay $${(cartTotal + 5).toFixed(2)}`}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div style={containerStyle}>
            {/* Navigation */}
            <nav style={navStyle}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button onClick={() => navigate('/dashboard')} style={btnNav}>🏠 Home</button>
                    <h1 style={{ margin: 0 }}>🛍️ Pet Marketplace</h1>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button onClick={() => navigate('/order-tracking')} style={btnNav}>📦 My Orders</button>
                    <button onClick={() => setShowCart(true)} style={cartBtnStyle}>
                        🛒 Cart {cartCount > 0 && <span style={badge}>{cartCount}</span>}
                    </button>
                    <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={btnLogout}>Logout</button>
                </div>
            </nav>

            {/* Search & Filter Bar */}
            <div style={filterBar}>
                <input
                    type="text"
                    placeholder="🔍 Search products..."
                    style={searchInput}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div style={categoryBar}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            style={category === cat ? activeCatBtn : catBtn}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div style={productGrid}>
                {filtered.length === 0 ? (
                    <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', padding: '40px' }}>
                        No products found.
                    </p>
                ) : (
                    filtered.map(product => (
                        <div key={product.id} style={productCard}>
                            <div style={imageContainer}>
                                <img src={product.imageUrl} alt={product.name} style={productImage}
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Pet+Product'; }} />
                                <span style={categoryTag}>{product.category}</span>
                            </div>
                            <div style={productInfo}>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem' }}>{product.name}</h3>
                                <p style={{ margin: '0 0 8px 0', color: '#888', fontSize: '0.85rem' }}>{product.description}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={priceTag}>${product.price.toFixed(2)}</span>
                                    <span style={{ color: product.stock > 0 ? '#4caf50' : '#f44336', fontSize: '0.8rem' }}>
                                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock === 0}
                                    style={product.stock === 0 ? btnDisabled : btnAddCart}
                                >
                                    {product.stock === 0 ? 'Sold Out' : '🛒 Add to Cart'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Cart Sidebar */}
            {showCart && renderCart()}
        </div>
    );
};

// --- STYLES ---
const containerStyle = { padding: '20px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#fafafa', minHeight: '100vh' };
const navStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' };
const btnNav = { padding: '8px 15px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const btnLogout = { padding: '8px 15px', backgroundColor: '#ff4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const cartBtnStyle = { padding: '8px 18px', backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', position: 'relative' };
const badge = { position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ff4444', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' };

const filterBar = { marginBottom: '25px' };
const searchInput = { width: '100%', padding: '14px 20px', borderRadius: '30px', border: '1px solid #ddd', fontSize: '1rem', marginBottom: '15px', boxSizing: 'border-box', outline: 'none' };
const categoryBar = { display: 'flex', gap: '10px', flexWrap: 'wrap' };
const catBtn = { padding: '8px 20px', borderRadius: '25px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' };
const activeCatBtn = { ...catBtn, backgroundColor: '#1DB954', color: 'white', border: '1px solid #1DB954' };

const productGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' };
const productCard = { backgroundColor: '#fff', borderRadius: '15px', overflow: 'hidden', border: '1px solid #eee', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', transition: '0.3s' };
const imageContainer = { position: 'relative', height: '180px', overflow: 'hidden', backgroundColor: '#f5f5f5' };
const productImage = { width: '100%', height: '100%', objectFit: 'cover' };
const categoryTag = { position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' };
const productInfo = { padding: '15px' };
const priceTag = { fontSize: '1.2rem', fontWeight: 'bold', color: '#1DB954' };
const btnAddCart = { width: '100%', marginTop: '12px', padding: '10px', backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' };
const btnDisabled = { ...btnAddCart, backgroundColor: '#ccc', cursor: 'not-allowed' };

// Cart styles
const cartOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' };
const cartPanel = { width: '420px', maxWidth: '90vw', backgroundColor: '#fff', height: '100vh', padding: '25px', overflowY: 'auto', boxShadow: '-5px 0 20px rgba(0,0,0,0.15)' };
const btnClose = { backgroundColor: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '5px' };
const cartItem = { display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' };
const qtyBtn = { width: '30px', height: '30px', border: '1px solid #ccc', borderRadius: '50%', backgroundColor: '#f9f9f9', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' };
const btnRemove = { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' };
const totalBar = { padding: '15px 0', textAlign: 'right', fontSize: '1.1rem', borderTop: '2px solid #eee' };
const btnPrimary = { width: '100%', padding: '14px', backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' };
const btnSecondary = { flex: 1, padding: '14px', backgroundColor: '#f0f0f0', color: '#333', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const textAreaStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '0.95rem', resize: 'vertical' };
const successBox = { textAlign: 'center', padding: '40px 20px', backgroundColor: '#e8f5e9', borderRadius: '15px', marginTop: '30px' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
const modalContentStyle = { backgroundColor: '#fff', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' };

export default Marketplace;
