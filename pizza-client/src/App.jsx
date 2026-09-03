import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './index.css';

// 📍 TUNNEL TUNING: Direct WebSocket channel pointing to your active cloud server
const socket = io('https://full-stack-pizza.onrender.com');

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
    fetch('https://full-stack-pizza.onrender.com/api/menu')
      .then(res => res.json())
      .then(data => { 
        setMenu(data); 
        setLoading(false); 
      })
      .catch(err => console.error("Critical Error: API master menu data stream offline", err));
  }, []);

  // 📡 HOOK 2: Event-Driven WebSocket Pipelines
  useEffect(() => {
    // Catch immediate status dispatch modifications from your Node instance
    socket.on('order_status_changed', (data) => {
      setOrderStatus(data.status);
    });

    // Synchronize full relational log arrays from SQL datasets
    socket.on('history_updated', (historyLogs) => {
      setOrderHistory(historyLogs);
    });

    // Clean up connections upon structural components unmounting
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

  // 📍 UPDATED FRONTEND CHECKOUT: Fields are now completely optional
  const handleCheckout = () => {
    setOrderStatus('Received'); 

    // Sends the text inputs directly. If blank, our backend configuration handles the substitution safely.
    fetch('https://full-stack-pizza.onrender.com/api/orders', {
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
        setCustomerInfo({ name: '', phone: '', address: '' }); // Reset text fields upon clear success
      } 
    })
    .catch(err => console.error("Checkout data transfer failure link down", err));
  };


  // 📍 REPAIRED APEX DISPATCH HANDLER: Safely extracts index 0 with clean array bracket notation
  const handleAdminUpdate = (newStatus) => {
    // Structural safety guard: Prevent network execution if the database logs are blank
    if (!orderHistory || orderHistory.length === 0) {
      alert("No active transaction records found inside database memory grids yet.");
      return;
    }

    // 🔥 FIX: Added [0] brackets to explicitly point to the very newest ticket card at the top of your array list
    const latestOrder = orderHistory[0];

    // Verification check: Stop execution if the first array object is malformed
    if (!latestOrder || !latestOrder.id) {
      console.error("Critical tracking fault: Failed to extract a valid ID string from index 0.");
      return;
    }

    // Pushes the exact key matching your backend app.put('/api/orders/status') endpoint route
    fetch('https://full-stack-pizza.onrender.com/api/orders/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: latestOrder.id, 
        status: newStatus 
      })
    })
    .catch(err => console.error("Global admin broadcast mutation dropped", err));
  };




  // 📍 FIXED INLINE OVERRIDE: Centers and scales loading elements dynamically based on screen bounds
  if (loading) {
    const isMobile = window.innerWidth <= 480;

    return (
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '80vh',
          width: '100%',
          boxSizing: 'border-box',
          // Adds custom horizontal padding to prevent text lines from clipping the mobile bezel edge walls
          padding: isMobile ? '0 1.5rem' : '0' 
        }}
      >
        <h2 
          style={{ 
            color: '#df3337',
            textAlign: 'center', // 🌟 Guarantees text blocks align dead center on all form factors
            margin: 0,
            fontFamily: "'Poppins', sans-serif",
            fontWeight: '700',
            // 🌟 The Magic Line: Scales text down to a compact 1.25rem on smartphones, stays 1.85rem on desktops
            fontSize: isMobile ? '1.25rem' : '1.85rem',
            lineHeight: '1.4',
            letterSpacing: '-0.25px'
          }}
        >
          🍕 Syncing Data Pipeline Node...
        </h2>
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
      {view === 'tracking' && (() => {
        // 📍 FIXED HOOK: Added [0] to correctly extract the live status string from your newest active database order card
        const activeTrackingStatus = (orderHistory && orderHistory.length > 0)
          ? orderHistory[0].status
          : 'Received';

        // Evaluates if the active database ticket has been completed
        const isDelivered = activeTrackingStatus === 'Delivered';

        return (
          <div style={{ padding: '3rem 1.5rem', background: '#fff', border: '1px solid #edf2f7', borderRadius: '16px', textAlign: 'center', maxWidth: '480px', margin: '3rem auto', boxShadow: '0 10px 30px rgba(15,23,42,0.04)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>📦 Order Progress</h3>
            <p style={{ color: '#64748b', marginTop: 0 }}>Your receipt has been committed to database memory logs.</p>
            
            {/* DYNAMIC THEME ENGINE: Conditionally toggles background colors and border outlines */}
            <div style={{ 
              background: isDelivered ? '#dcfce7' : '#fef2f2', 
              padding: '1.75rem', 
              borderRadius: '12px', 
              margin: '2rem 0', 
              border: isDelivered ? '1px solid #bbf7d0' : '1px solid #fee2e2',
              transition: 'all 0.2s ease'
            }}>
              <span style={{ 
                fontSize: '0.85rem', 
                color: isDelivered ? '#16a34a' : '#df3337', 
                fontWeight: '800', 
                letterSpacing: '1px', 
                display: 'block', 
                textTransform: 'uppercase' 
              }}>
                Current Tracker State
              </span>
              
              {/* 📍 SUCCESS RESTORED: This will now cleanly print "Received", "Baking", or "Delivered" */}
              <strong style={{ 
                fontSize: '2.25rem', 
                color: isDelivered ? '#15803d' : '#b91c1c', 
                display: 'block', 
                marginTop: '0.5rem', 
                letterSpacing: '-0.5px',
                textTransform: 'capitalize'
              }}>
                {activeTrackingStatus}
              </strong>
            </div>
            
            <button className="btn-primary" onClick={() => { setView('dashboard'); setIsTracking(false); }}>
              Return & Reset Dashboard
            </button>
          </div>
        );
      })()}




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
              <div className="form-card" style={{ flex: '1 1 180px', margin: 0, padding: '1.25rem', borderLeft: '4px solid #df3337', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {/* 📍 UPDATED TEXT LABELS */}
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⏳ Orders in Progress</span>
                <strong style={{ fontSize: '1.85rem', color: '#df3337', letterSpacing: '-0.5px' }}>{activeOrdersCount} {activeOrdersCount === 1 ? 'Order' : 'Orders'}</strong>
              </div>
              <div className="form-card" style={{ flex: '1 1 180px', margin: 0, padding: '1.25rem', borderLeft: '4px solid #df3337', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🍕 Cumulative Volume</span>
                <strong style={{ fontSize: '1.85rem', color: '#df3337', letterSpacing: '-0.5px' }}>{aggregatePizzas} {aggregatePizzas === 1 ? 'Pizza' : 'Pizzas'}</strong>
              </div>
              <div className="form-card" style={{ flex: '1 1 180px', margin: 0, padding: '1.25rem', borderLeft: '4px solid #df3337', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📊 Avg. Ticket Value</span>
                <strong style={{ fontSize: '1.85rem', color: '#df3337', letterSpacing: '-0.5px' }}>${averageReceiptBill.toFixed(2)}</strong>
              </div>
              
              <div className="form-card" style={{ flex: '1 1 180px', margin: 0, padding: '1.25rem', borderLeft: '4px solid #df3337', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {/* 📍 UPDATED TEXT LABELS */}
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📈 Total Earnings</span>
                <strong style={{ fontSize: '1.85rem', color: '#df3337', letterSpacing: '-0.5px' }}>${lifetimeRevenue.toFixed(2)}</strong>
              </div>
              
              
              
            </div>
                        {/* MASTER KITCHEN CONTROLLER GRID */}
            <div className="responsive-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', width: '100%', boxSizing: 'border-box', marginTop: '1rem' }}>
              
            
                          {/* COLUMN 1: LEFT-HAND KITCHEN DISPATCH BOARD */}
              {(() => {
                // 📍 FIXED HOOK: Explicitly looks up index 0 of your array logs to read the live status string
                const latestOrderActiveStatus = (orderHistory && orderHistory.length > 0) 
                  ? orderHistory[0].status 
                  : 'Received';

                return (
                  <div className="responsive-column" style={{ flex: '1 1 300px', minWidth: '280px' }}>
                    <div className="form-card" style={{ margin: 0 }}>
                      <h3 style={{ marginTop: 0 }}>🛠️ Kitchen Dispatch</h3>
                      <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                        Broadcast live status parameters across real-time sockets.
                      </p>
                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', borderLeft: '4px solid #df3337' }}>
                        <strong>Active Broadcaster (Newest Order):</strong> 
                        <span style={{ color: '#df3337', fontWeight: '800', marginLeft: '0.5rem' }}>
                          {latestOrderActiveStatus}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {['Received', 'Preparing', 'Baking', 'Out for Delivery', 'Delivered'].map((stage) => {
                          const isActive = latestOrderActiveStatus === stage;
                          return (
                            <button 
                              key={stage} 
                              onClick={() => handleAdminUpdate(stage)} 
                              style={{ 
                                padding: '1rem', 
                                fontSize: '1rem', 
                                fontWeight: '700', 
                                cursor: 'pointer', 
                                textAlign: 'left', 
                                borderRadius: '8px', 
                                border: '1px solid #e2e8f0', 
                                // 📍 RESTORED LIGHTS: Safely highlights using the matching index string
                                backgroundColor: isActive ? '#048659' : '#fff', 
                                color: isActive ? '#fff' : '#0f172a', 
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <span style={{ 
                                fontSize: '1.7rem', 
                                marginRight: '0.6rem', 
                                lineHeight: '1',
                                display: 'inline-block',
                                transform: 'translateY(-1px)'
                              }}>
                                {isActive ? '●' : '○'}
                              </span>
                              
                              <span>
                                {isActive ? 'Active Step:' : 'Deploy Step:'} {stage}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}



              {/* COLUMN 2: RIGHT-HAND HISTORICAL RECEIPT LOGS ARCHIVE */}
              <div className="responsive-column" style={{ flex: '1 2 480px', minWidth: '280px' }}>
                <div className="form-card" style={{ margin: 0 }}>
                  
                  {/* 📍 FIXED INLINE OVERRIDE: Dynamically switches layout style based on mobile device dimensions */}
                  <div 
                    style={{ 
                      display: 'flex', 
                      // 🌟 The Magic Line: If the screen is mobile-sized, force column layout; otherwise, stay side-by-side row
                      flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
                      justifyContent: 'space-between', 
                      alignItems: window.innerWidth <= 480 ? 'flex-start' : 'center', 
                      marginBottom: '1.25rem', 
                      gap: '0.75rem', 
                      flexWrap: 'wrap' 
                    }}
                  >
                    <h3 style={{ margin: 0, whiteSpace: 'nowrap' }}>📁 Order History</h3>
                    {orderHistory.length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm("Are you certain you want to permanently erase all archived checkout data logs?")) {
                            fetch('https://full-stack-pizza.onrender.com/api/orders/history', { method: 'DELETE' })
                              .catch(err => console.error("Archive purge command dropped", err));
                          }
                        }}
                        style={{ 
                          padding: '0.45rem 0.85rem', 
                          fontSize: '0.85rem', 
                          fontWeight: '700', 
                          fontFamily: 'Poppins, sans-serif', 
                          color: '#ef4444', 
                          background: '#fef2f2', 
                          border: '1px solid #fee2e2', 
                          borderRadius: '6px', 
                          cursor: 'pointer', 
                          transition: 'all 0.15s ease', 
                          whiteSpace: 'nowrap',
                          // 🌟 Ensures the button sits cleanly flush against the left wall on phones
                          alignSelf: 'flex-start'
                        }}
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                      {orderHistory.map((receipt) => (
                        <div key={receipt.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxSizing: 'border-box' }}>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <strong style={{ color: '#0f172a', fontSize: '1.1rem' }}>{receipt.id}</strong>
                                
                                <select
                                  value={receipt.status}
                                  onChange={(e) => {
                                    fetch('https://full-stack-pizza.onrender.com/api/orders/status', {
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
            
            {/* 📍 OPTIONAL PREVIEW ENHANCEMENT: Injects basePrices dynamically inside Part 5 */}
<div className="form-card">
  <h4>Select Base Size</h4>
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
    {Object.keys(menu.basePrices).map((s) => {
      const isSelected = size === s;
      const basePrice = menu.basePrices[s]; // Pulls the raw numerical value from your database state
      
      return (
        <label 
          key={s} 
          className="selection-label" 
          onClick={() => setSize(s)} 
          style={{ 
            flex: '1 1 130px', 
            justifyContent: 'center', 
            flexDirection: 'column', // Stacks the size name and price neatly vertically
            gap: '0.25rem',
            background: isSelected ? '#df3337' : '#fef2f2', 
            color: isSelected ? '#ffffff' : '#df3337',
            border: isSelected ? '1px solid #df3337' : '1px solid #fca5a5', 
            outline: 'none',
            cursor: 'pointer',
            padding: '0.65rem 1rem',
            boxSizing: 'border-box',
            transition: 'all 0.15s ease',
            textAlign: 'center'
          }}
        >
          <span style={{ textTransform: 'capitalize', fontWeight: isSelected ? '800' : '600', fontSize: '1rem' }}>
            {s}
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: '500', opacity: isSelected ? 0.9 : 0.75 }}>
            (${basePrice.toFixed(2)}) {/* 🍕 Displays ($8.00), ($11.00), etc. */}
          </span>
        </label>
      );
    })}
  </div>
</div>

            <div className="form-card">
              <h4>Select Ingredients</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* 📍 COMPONENT SHIELD AUDIT: Ensure the loop label inside App.jsx looks exactly like this */}
{menu.toppings.map((t) => {
  const isChecked = selectedToppings.includes(t.id);
  return (
    <label 
      key={t.id} 
      className="selection-label" 
      // 🔥 Keep only conditional background and borders inline—remove custom heights/paddings here
      style={{ 
        background: isChecked ? '#fef2f2' : '#ffffff', 
        borderColor: isChecked ? '#fca5a5' : '#e2e8f0' 
      }}
    >
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
              {/* 📍 CUSTOM COPY UPDATE */}
              <button className="btn-primary" onClick={() => { setCart([...cart, { id: Date.now(), size, toppings: [...selectedToppings], price: getPizzaPrice(size, selectedToppings) }]); setSelectedToppings([]); }}>
                Add Pizza to Order
              </button>
            </div>
          </div>

          {/* Active Order Cart Queue Column */}
          <div className="responsive-column cart-border-left" style={{ flex: '1 1 320px', minWidth: '280px' }}>
            {/* 📍 CUSTOM COPY UPDATE */}
            <h3 style={{ margin: '0 0 1.25rem 0' }}>2. Your Cart</h3>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '2px dashed #e2e8f0', borderRadius: '12px', background: '#fff' }}>
                <p style={{ color: '#64748b', margin: 0, fontStyle: 'italic' }}>Your cart is empty. Build a pizza and add it to your cart to begin.</p>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                  {cart.map((item) => (
                    <div key={item.id} className="form-card" style={{ margin: 0, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ textTransform: 'capitalize', fontWeight: '700', fontSize: '1.05rem' }}>{item.size} Size Pizza</span>
                        {/* 📍 CUSTOM COPY UPDATE */}
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                          Toppings: {item.toppings.length === 0 ? 'None' : item.toppings.map(tId => menu.toppings.find(t => t.id === tId)?.code).join(', ')}
                        </div>
                      </div>
                      <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>${item.price.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>

                {/* Customer Details Form Element */}
                <div className="form-card" style={{ background: '#ffffff', padding: '1.25rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Delivery Information</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <input 
                      type="text" 
                      placeholder="Your Full Name"
                      value={customerInfo.name}
                      // 📍 FRONTEND STRIP: Block angle brackets instantly to prevent user tag inputs
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value.replace(/[<>]/g, '') })}
                      style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'Poppins, sans-serif' }}
                    />
                    <input 
                      type="tel" 
                      placeholder="Phone Number"
                      value={customerInfo.phone}
                      // 📍 FRONTEND STRIP: Enforces strict numerical configurations for phone field entries
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value.replace(/[^0-9+\-\s()]/g, '') })}
                      style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'Poppins, sans-serif' }}
                    />
                    <input 
                      type="text" 
                      placeholder="Delivery Address"
                      value={customerInfo.address}
                      // 📍 FRONTEND STRIP: Block angle brackets instantly to prevent user tag inputs
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value.replace(/[<>]/g, '') })}
                      style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'Poppins, sans-serif' }}
                    />
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '12px' }}>
                  {/* 📍 CUSTOM COPY UPDATE */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem', color: '#0f172a' }}>
                    <span>Order Total:</span>
                    <span>${cart.reduce((sum, i) => sum + i.price, 0).toFixed(2)}</span>
                  </div>
                  {/* 📍 CUSTOM COPY UPDATE */}
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
