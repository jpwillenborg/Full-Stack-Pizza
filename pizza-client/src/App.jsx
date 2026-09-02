import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './index.css';

// 📍 TARGET TUNNEL CONNECTION: Direct WebSocket pipeline pointing to your active Render URL
const socket = io('https://onrender.com');

export default function App() {
  // --- DATABASE DATA HOOKS (API FETCH STORAGE BUCKETS) ---
  const [menu, setMenu] = useState({ toppings: [], basePrices: {} });
  const [loading, setLoading] = useState(true);
  const [orderHistory, setOrderHistory] = useState([]);

  // --- REACTIVE INTERACTIVE DATA FIELD STATES ---
  const [size, setSize] = useState('medium');
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [cart, setCart] = useState([]);

  // --- CUSTOMER DELIVERY INFORMATION FORM STATES ---
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });

  // --- COMPONENT ROUTING MODULE FLAGS ---
  const [view, setView] = useState('dashboard'); // 'dashboard', 'tracking', or 'admin'
  const [isTracking, setIsTracking] = useState(false);
  const [orderStatus, setOrderStatus] = useState('Received');

  // 📡 HOOK 1: Initial Menu REST Handshake (Fires once on website boot)
  useEffect(() => {
    fetch('https://onrender.com/api/menu')
      .then(res => res.json())
      .then(data => { 
        setMenu(data); 
        setLoading(false); 
      })
      .catch(err => console.error("Critical Error: API master menu data stream offline", err));
  }, []);

  // 📡 HOOK 2: Low-Latency Event-Driven WebSocket Pipelines
  useEffect(() => {
    // Catch immediate dispatch status updates pushed from the Express cluster
    socket.on('order_status_changed', (data) => {
      setOrderStatus(data.status);
    });

    // Synchronize full administrative archive streams dynamically from memory log files
    socket.on('history_updated', (historyLogs) => {
      setOrderHistory(historyLogs);
    });

    // Clean up subscriber registries safely upon component unmounting lifecycles
    return () => {
      socket.off('order_status_changed');
      socket.off('history_updated');
    };
  }, []);
  // --- INTERACTIVE BUSINESS CODE HANDLERS ---
  const handleToppingToggle = (id) => {
    selectedToppings.includes(id)
      ? setSelectedToppings(selectedToppings.filter(tId => tId !== id))
      : setSelectedToppings([...selectedToppings, id]);
  };

  const getPizzaPrice = (pSize, pToppings) => {
    if (loading) return 0;
    const base = menu.basePrices[pSize] || 0;
    const toppingsPrice = pToppings.reduce((sum, id) => {
      const match = menu.toppings.find(t => t.id === id);
      return sum + (match ? match.price : 0);
    }, 0);
    return base + toppingsPrice;
  };

  const handleCheckout = () => {
    // Client-side structural form field validation
    if (!customerInfo.name.trim() || !customerInfo.phone.trim() || !customerInfo.address.trim()) {
      alert("Please populate all shipping and identity fields before checkout transmission.");
      return;
    }

    setOrderStatus('Received'); 

    // 📍 PRODUCTION ENDPOINT: Correctly routes payloads with /api/orders
    fetch('https://onrender.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        items: cart,
        customer: customerInfo 
      })
    })
    .then(res => { 
      if (res.ok) { 
        setView('tracking'); 
        setIsTracking(true); 
        setCart([]); 
        setCustomerInfo({ name: '', phone: '', address: '' }); // Clear inputs on success
      } 
    })
    .catch(err => console.error("Checkout data transfer failure link down", err));
  };

  const handleAdminUpdate = (newStatus) => {
    fetch('https://onrender.com/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    .catch(err => console.error("Admin broadcast mutation dropped", err));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <h2 style={{ color: '#df3337' }}>🍕 Syncing Data Pipeline Node...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '950px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      {/* GLOBAL HEADER NAVBAR */}
      <header>
        <span className="navbar-brand">🍕 Full Stack Pizza</span>
        <div className="nav-button-group">
          <button 
            onClick={() => setView(isTracking ? 'tracking' : 'dashboard')} 
            style={{ 
              background: view === 'dashboard' || view === 'tracking' ? '#048659' : 'transparent', // 📍 EMERALD GREEN ACCENT
              color: view === 'dashboard' || view === 'tracking' ? '#fff' : '#0f172a' 
            }}
          >
            Customer Portal
          </button>
          <button 
            onClick={() => setView('admin')} 
            style={{ 
              background: view === 'admin' ? '#048659' : 'transparent', // 📍 EMERALD GREEN ACCENT
              color: view === 'admin' ? '#fff' : '#0f172a' 
            }}
          >
            Kitchen Admin
          </button>
        </div>
      </header>
      {/* VIEW A: REAL-TIME TRACKING DISPATCH CONSOLE */}
      {view === 'tracking' && (
        <div style={{ padding: '3rem 1.5rem', background: '#fff', border: '1px solid #edf2f7', borderRadius: '16px', textAlign: 'center', maxWidth: '480px', margin: '3rem auto', boxShadow: '0 10px 30px rgba(15,23,42,0.04)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>📦 Order Progress</h3>
          <p style={{ color: '#64748b', marginTop: 0 }}>Your receipt has been committed to database memory logs.</p>
          <div style={{ background: '#fef2f2', padding: '1.75rem', borderRadius: '12px', margin: '2rem 0', border: '1px solid #fee2e2' }}>
            <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: '800', letterSpacing: '1px', display: 'block', textTransform: 'uppercase' }}>Current Tracker State</span>
            <strong style={{ fontSize: '2.25rem', color: '#b91c1c', display: 'block', marginTop: '0.5rem', letterSpacing: '-0.5px' }}>{orderStatus}</strong>
          </div>
          <button className="btn-primary" onClick={() => { setView('dashboard'); setIsTracking(false); }}>
            Return & Reset Dashboard
          </button>
        </div>
      )}

      {/* VIEW B: KITCHEN ADMINISTRATION PANEL VIEW WITH LIVE METRICS DASHBOARD */}
      {view === 'admin' && (() => {
        // 📊 CLIENT-SIDE ANALYTICS GENERATOR ENGINE
        const lifetimeRevenue = orderHistory.reduce((sum, ord) => sum + parseFloat(ord.totalBill || 0), 0);
        const activeOrdersCount = orderHistory.filter(ord => ord.status !== 'Delivered').length;
        const aggregatePizzas = orderHistory.reduce((sum, ord) => sum + (ord.items ? ord.items.length : 0), 0);
        const averageReceiptBill = orderHistory.length > 0 ? (lifetimeRevenue / orderHistory.length) : 0;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', boxSizing: 'border-box' }}>
            
            {/* 📊 REAL-TIME METRICS DISPLAY BANNER */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
              <div className="form-card" style={{ flex: '1 1 180px', margin: 0, padding: '1.25rem', borderLeft: '4px solid #16a34a', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {/* 📍 REVISED LABEL COPY BLOCK */}
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📈 Total Earnings</span>
                <strong style={{ fontSize: '1.85rem', color: '#16a34a', letterSpacing: '-0.5px' }}>${lifetimeRevenue.toFixed(2)}</strong>
              </div>
              <div className="form-card" style={{ flex: '1 1 180px', margin: 0, padding: '1.25rem', borderLeft: '4px solid #ef4444', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {/* 📍 REVISED LABEL COPY BLOCK */}
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⏳ Active Orders</span>
                <strong style={{ fontSize: '1.85rem', color: '#ef4444', letterSpacing: '-0.5px' }}>{activeOrdersCount}</strong>
              </div>
              <div className="form-card" style={{ flex: '1 1 180px', margin: 0, padding: '1.25rem', borderLeft: '4px solid #0f172a', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🍕 Cumulative Volume</span>
                <strong style={{ fontSize: '1.85rem', color: '#0f172a', letterSpacing: '-0.5px' }}>{aggregatePizzas} {aggregatePizzas === 1 ? 'Pizza' : 'Pizzas'}</strong>
              </div>
              <div className="form-card" style={{ flex: '1 1 180px', margin: 0, padding: '1.25rem', borderLeft: '4px solid #2563eb', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📊 Avg. Ticket Value</span>
                <strong style={{ fontSize: '1.85rem', color: '#2563eb', letterSpacing: '-0.5px' }}>${averageReceiptBill.toFixed(2)}</strong>
              </div>
            </div>
            {/* MASTER KITCHEN CONTROLLER GRID */}
            <div className="responsive-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
              <div className="responsive-column" style={{ flex: '1 1 300px', minWidth: '280px' }}>
                <div className="form-card" style={{ margin: 0 }}>
                  <h3 style={{ marginTop: 0 }}>🛠️ Kitchen Controller Dispatch</h3>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Update live customer tracker parameters instantly below.</p>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', borderLeft: '4px solid #0f172a' }}>
                    <strong>Active Broadcaster:</strong> <span style={{ color: '#ef4444', fontWeight: '800', marginLeft: '0.5rem' }}>{orderStatus}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {['Received', 'Preparing', 'Baking', 'Out for Delivery', 'Delivered'].map((stage) => (
                      <button key={stage} onClick={() => handleAdminUpdate(stage)} style={{ padding: '1rem', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', textAlign: 'left', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: orderStatus === stage ? '#16a34a' : '#fff', color: orderStatus === stage ? '#fff' : '#0f172a', transition: 'all 0.15s ease' }}>
                        {orderStatus === stage ? '● Active Step: ' : '○ Deploy Step: '} {stage}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="responsive-column" style={{ flex: '1 1 450px', minWidth: '280px' }}>
                <div className="form-card" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0 }}>📁 Historical Receipt Logs Archive</h3>
                    {orderHistory.length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm("Are you certain you want to permanently erase all archived checkout data logs?")) {
                            fetch('https://onrender.com', { method: 'DELETE' })
                              .catch(err => console.error("Archive purge command dropped", err));
                          }
                        }}
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', fontWeight: '700', fontFamily: 'Poppins, sans-serif', color: '#ef4444', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s ease', whiteSpace: 'nowrap' }}
                        onMouseEnter={(e) => { e.target.style.background = '#fee2e2'; }}
                        onMouseLeave={(e) => { e.target.style.background = '#fef2f2'; }}
                      >
                        Wipe Logs
                      </button>
                    )}
                  </div>

                  {orderHistory.length === 0 ? (
                    <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.95rem', margin: 0 }}>No historical transactions captured in datastore cache yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                      {orderHistory.map((receipt) => (
                        <div key={receipt.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxSizing: 'border-box' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <strong style={{ color: '#0f172a', fontSize: '1.1rem' }}>{receipt.id}</strong>
                                
                                {/* 📍 ID-BASED STATUS DROPDOWN: Update previous orders independently */}
                                <select
                                  value={receipt.status}
                                  onChange={(e) => {
                                    fetch('https://onrender.com', {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ id: receipt.id, status: e.target.value })
                                    }).catch(err => console.error("Historical status mutation drop", err));
                                  }}
                                  style={{ padding: '4px 8px', fontSize: '0.8rem', fontWeight: '700', fontFamily: 'Poppins, sans-serif', border: '1px solid #e2e8f0', borderRadius: '6px', background: receipt.status === 'Delivered' ? '#dcfce7' : '#fef9c3', color: receipt.status === 'Delivered' ? '#15803d' : '#a16207', cursor: 'pointer', outline: 'none' }}
                                >
                                  {['Received', 'Preparing', 'Baking', 'Out for Delivery', 'Delivered'].map(stage => (
                                    <option key={stage} value={stage} style={{ background: '#fff', color: '#0f172a', fontWeight: 'normal' }}>
                                      {stage}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Logged: {receipt.timestamp}</span>
                            </div>
                            <div style={{ textAlign: 'right', fontWeight: '700', color: '#0f172a', fontSize: '1.1rem' }}>${receipt.totalBill}</div>
                          </div>

                          {receipt.customer ? (
                            <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #f1f5f9', color: '#334155' }}>
                              <div style={{ fontWeight: '700', marginBottom: '0.25rem', color: '#0f172a' }}>📋 Delivery Manifest:</div>
                              <div><strong>Name:</strong> {receipt.customer.name}</div>
                              <div><strong>Phone:</strong> {receipt.customer.phone}</div>
                              <div><strong>Address:</strong> {receipt.customer.address}</div>
                            </div>
                          ) : (
                            <div style={{ fontStyle: 'italic', fontSize: '0.85rem', color: '#94a3b8' }}>No delivery identity metadata tagged to this legacy checkout transaction node row.</div>
                          )}

                          <div style={{ fontSize: '0.85rem', color: '#64748b', borderTop: '1px dashed #e2e8f0', paddingTop: '0.5rem' }}>
                            <strong>Batch Content Details:</strong> {receipt.items.length} {receipt.items.length === 1 ? 'Pizza Configuration Record' : 'Pizza Configuration Records'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {/* VIEW C: E-COMMERCE CLIENT CONFIGURATION WORKSPACE */}
      {view === 'dashboard' && (
        <div className="responsive-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
          
          {/* Customizer Specification Column */}
          <div className="responsive-column" style={{ flex: '1 1 320px', minWidth: '280px' }}>
            <h3 style={{ margin: '0 0 1.25rem 0' }}>1. Build Your Pizza</h3>
            
            <div className="form-card">
              <h4>Select Base Size</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {Object.keys(menu.basePrices).map((s) => {
                  const isSelected = size === s;
                  return (
                    <label 
                      key={s} 
                      className="selection-label" 
                      onClick={() => setSize(s)} 
                      style={{ 
                        flex: '1 1 130px', 
                        justifyContent: 'center', 
                        // 📍 TEXT ONLY SIZE CARD: Radio inputs removed completely; color states handle selection feedback
                        background: isSelected ? '#df3337' : '#fef2f2', 
                        color: isSelected ? '#ffffff' : '#df3337',
                        border: isSelected ? '1px solid #df3337' : '1px solid #fca5a5', 
                        outline: 'none',
                        cursor: 'pointer',
                        padding: '0.85rem 1rem',
                        boxSizing: 'border-box',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ textTransform: 'capitalize', fontWeight: isSelected ? '800' : '600', letterSpacing: '0.25px' }}>
                        {s}
                      </span> 
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="form-card">
              <h4>Select Ingredients</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {menu.toppings.map((t) => {
                  const isChecked = selectedToppings.includes(t.id);
                  return (
                    <label key={t.id} className="selection-label" style={{ justifyContent: 'space-between', background: isChecked ? '#fef2f2' : '#ffffff', borderColor: isChecked ? '#fca5a5' : '#e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" checked={isChecked} onChange={() => handleToppingToggle(t.id)} style={{ accentColor: '#df3337' }} /> 
                        <strong style={{ color: '#df3337', fontSize: '0.85rem', marginRight: '0.25rem' }}>[{t.code}]</strong> 
                        <span>{t.name}</span>
                      </div>
                      <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>+${t.price.toFixed(2)}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="form-card" style={{ background: '#fef2f2', borderColor: '#fee2e2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontWeight: '600', color: '#334155' }}>Current Build Cost:</span>
                <strong style={{ fontSize: '1.35rem', color: '#b91c1c' }}>${getPizzaPrice(size, selectedToppings).toFixed(2)}</strong>
              </div>
              <button className="btn-primary" onClick={() => { setCart([...cart, { id: Date.now(), size, toppings: [...selectedToppings], price: getPizzaPrice(size, selectedToppings) }]); setSelectedToppings([]); }}>
                Add Pizza to Order
              </button>
            </div>
          </div>

          {/* Active Order Cart Queue Column */}
          <div className="responsive-column cart-border-left" style={{ flex: '1 1 320px', minWidth: '280px' }}>
            <h3 style={{ margin: '0 0 1.25rem 0' }}>2. Your Cart</h3>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '2px dashed #e2e8f0', borderRadius: '12px', background: '#fff' }}>
                <p style={{ color: '#64748b', margin: 0, fontStyle: 'italic' }}>Your basket is completely empty. Build a configuration to begin.</p>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                  {cart.map((item) => (
                    <div key={item.id} className="form-card" style={{ margin: 0, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ textTransform: 'capitalize', fontWeight: '700', fontSize: '1.05rem' }}>{item.size} Size Pizza</span>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                          Toppings: {item.toppings.length === 0 ? 'None' : item.toppings.map(tId => menu.toppings.find(t => t.id === tId)?.code).join(', ')}
                        </div>
                      </div>
                      <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>${item.price.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>

                {/* Customer Details Validation Form Element */}
                <div className="form-card" style={{ background: '#ffffff', padding: '1.25rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Delivery Information</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <input 
                      type="text" 
                      placeholder="Your Full Name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'Poppins, sans-serif' }}
                    />
                    <input 
                      type="tel" 
                      placeholder="Phone Number"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'Poppins, sans-serif' }}
                    />
                    <input 
                      type="text" 
                      placeholder="Delivery Address"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'Poppins, sans-serif' }}
                    />
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem', color: '#0f172a' }}>
                    <span>Order Total:</span>
                    <span>${cart.reduce((sum, i) => sum + i.price, 0).toFixed(2)}</span>
                  </div>
                  <button className="btn-primary" onClick={handleCheckout}>
                    Place Order
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
