import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { createServer } from 'http'; // Native HTTP wrapper for WebSocket hooks
import { Server } from 'socket.io';  // Low-latency synchronization engine
import mysql from 'mysql2/promise'; // Bluehost MySQL database driver

const app = express();

// 📍 PRODUCTION PORT BINDING: Accepts dynamic hosting server ports or defaults to 5000 locally
const PORT = process.env.PORT; 

// --- PACKET ROUTING PIPELINE MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// Bind the Express engine into an HTTP server instance node
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173", 
      "https://jpwillenborg.com",       // 👈 Put your main Bluehost domain link here!
      "https://www.jpwillenborg.com"    // 👈 Include the www version just in case
    ], 
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// 🔌 BLUEHOST SQL POOL INTERFACE (Verified configuration parameters matrix)
const db = mysql.createPool({
  host: process.env.DB_HOST,               
  user: process.env.DB_USER,         
  password: process.env.DB_PASSWORD,  
  database: process.env.DB_DATABASE,   
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize relational database schema tables automatically on system boots
async function initializeDatabaseSchema() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        db_id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(100),
        customer_phone VARCHAR(50),
        customer_address TEXT,
        status VARCHAR(50) DEFAULT 'Received',
        total_bill VARCHAR(20),
        timestamp VARCHAR(50),
        items_json TEXT NOT NULL
      )
    `);
    console.log('💾 Remote Bluehost SQL Database Grid Synced: SUCCESS');
  } catch (err) {
    console.error('❌ Bluehost Connection Initialization Failure:', err.message);
  }
}
initializeDatabaseSchema();

// 📍 INVENTORY SYNC: Updated 7-item menu categories, short codes, and validation pricing matrices
const DATASTORE_MENU = {
  basePrices: { small: 6.50, medium: 8.00, large: 10.50 },
  toppings: [
    { id: 'pepperoni', name: 'Pepperoni', price: 1.00, category: 'meat', code: 'PEP' },
    { id: 'sausage', name: 'Sausage', price: 1.00, category: 'meat', code: 'SSG' },
    { id: 'bacon', name: 'Bacon', price: 1.50, category: 'meat', code: 'BCN' },
    { id: 'red_peppers', name: 'Red Peppers', price: 0.75, category: 'veggie', code: 'PEP' },
    { id: 'pineapple', name: 'Pineapple', price: 0.75, category: 'veggie', code: 'PIN' },
    { id: 'onions', name: 'Onions', price: 0.50, category: 'veggie', code: 'ONN' },
    { id: 'extra_cheese', name: 'Extra Cheese', price: 1.00, category: 'cheese', code: 'CHS' }
  ]
};

const STATUS_STAGES = ['Received', 'Preparing', 'Baking', 'Out for Delivery', 'Delivered'];

// Helper function to transform SQL record rows and stream them globally over WebSockets
async function broadcastUpdatedHistory() {
  try {
    const [rows] = await db.query('SELECT * FROM orders ORDER BY db_id DESC');
    
    const formattedHistory = rows.map(row => ({
      id: row.order_id,
      status: row.status,
      totalBill: row.total_bill,
      timestamp: row.timestamp,
      customer: { name: row.customer_name, phone: row.customer_phone, address: row.customer_address },
      items: JSON.parse(row.items_json)
    }));
    
    io.emit('history_updated', formattedHistory);
  } catch (err) {
    console.error('Socket system broadcast sync failed:', err.message);
  }
}

// --- REST API ENDPOINTS ---

app.get('/api/menu', (req, res) => {
  res.status(200).json(DATASTORE_MENU);
});

app.get('/api/orders/history', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM orders ORDER BY db_id DESC');
    const history = rows.map(row => ({
      id: row.order_id, status: row.status, totalBill: row.total_bill, timestamp: row.timestamp,
      customer: { name: row.customer_name, phone: row.customer_phone, address: row.customer_address },
      items: JSON.parse(row.items_json)
    }));
    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  const { items, customer } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ message: 'Cart is empty.' });

  try {
    const sanitizeInput = (str) => {
      if (typeof str !== 'string') return '';
      return str
        .replace(/<[^>]*>/g, '') // Strips HTML to prevent XSS
        .replace(/['"`;\-]/g, '') // Strips raw quotation marks and semicolons
        .trim();
    };

    // 🔒 INPUT DEFAULT SHIELD: Strips data, then evaluates if it should use generic fallbacks
    const rawName = sanitizeInput(customer?.name);
    const rawPhone = sanitizeInput(customer?.phone?.replace(/[^0-9+\-\s()]/g, ''));
    const rawAddress = sanitizeInput(customer?.address);

    // 📍 THE FIX: If the field is empty after sanitization, populate it with generic placeholder strings
    const sanitizedCustomer = {
      name: rawName || 'Guest Customer',
      phone: rawPhone || '000-000-0000',
      address: rawAddress || 'Store Pick-up / No Address'
    };

    let grandTotal = 0;
    const validatedItems = items.map((clientItem) => {
      const base = DATASTORE_MENU.basePrices[clientItem.size];
      let toppingsTotal = 0;
      clientItem.toppings.forEach(id => {
        const topping = DATASTORE_MENU.toppings.find(t => t.id === id);
        if (topping) toppingsTotal += topping.price;
      });
      grandTotal += (base + toppingsTotal);
      return { size: clientItem.size, toppings: clientItem.toppings, verifiedPrice: base + toppingsTotal };
    });

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    
    // 📍 FIXED US CENTRAL TIME TIMESTAMP: Bypasses the server's default timezone clock completely
    const timestamp = new Date().toLocaleTimeString('en-US', {
      timeZone: 'America/Chicago', // 🌟 Explicit IANA key for US Central Time (Handles daylight savings automatically)
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    // Parameterized Query: Securely binds variables to your MySQL database pool rows
    const query = `
      INSERT INTO orders (order_id, customer_name, customer_phone, customer_address, total_bill, timestamp, items_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await db.query(query, [
      orderId, sanitizedCustomer.name, sanitizedCustomer.phone, sanitizedCustomer.address, 
      grandTotal.toFixed(2), timestamp, JSON.stringify(validatedItems)
    ]);

    console.log(`🔒 Secure Data Block Logged: ${orderId} - Fields defaulted if blank.`);
    
    io.emit('order_status_changed', { id: orderId, status: 'Received' });
    await broadcastUpdatedHistory();

    res.status(201).json({ message: 'Authorized and securely logged to remote hosting database.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/track', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT status FROM orders ORDER BY db_id DESC LIMIT 1');
    if (rows.length === 0) return res.status(404).json({ status: 'No Active Orders' });
    res.json({ status: rows.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📍 REFACTORED ID-BASED STATUS LOOKUP ROUTE: Overwrites specific order rows independently
app.put('/api/orders/status', async (req, res) => {
  const { id, status } = req.body; 

  if (!id) {
    return res.status(400).json({ message: 'Missing target order ID parameter.' });
  }
  if (!STATUS_STAGES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status stage token submitted.' });
  }

  try {
    // 🔒 Parameterized Query: Targets the exact matching unique order record row
    const [result] = await db.query(
      'UPDATE orders SET status = ? WHERE order_id = ?', 
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: `No active transaction records found matching: ${id}` });
    }

    console.log(`🛠️ State mutation committed: Order row ${id} successfully shifted to "${status}"`);

    // Broadcast individual status switches and complete historical syncing models across WebSockets
    io.emit('order_status_changed', { id: id, status: status });
    await broadcastUpdatedHistory();

    res.status(200).json({ message: 'Remote database status row successfully updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/orders/history', async (req, res) => {
  try {
    await db.query('TRUNCATE TABLE orders'); 
    console.log('🧹 Remote hosting data cleared cleanly.');
    
    io.emit('history_updated', []);
    io.emit('order_status_changed', { status: 'No Active Orders' });
    
    res.status(200).json({ message: 'Archive successfully scrubbed.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SOCKET CONNECTIONS INITIAL HANDSHAKES ---
io.on('connection', async (socket) => {
  console.log(`... WebSocket linked: ${socket.id}`);
  try {
    const [rows] = await db.query('SELECT status FROM orders ORDER BY db_id DESC LIMIT 1');
    if (rows.length > 0) socket.emit('order_status_changed', { status: rows.status });
    
    const [allRows] = await db.query('SELECT * FROM orders ORDER BY db_id DESC');
    const history = allRows.map(row => ({
      id: row.order_id, status: row.status, totalBill: row.total_bill, timestamp: row.timestamp,
      customer: { name: row.customer_name, phone: row.customer_phone, address: row.customer_address },
      items: JSON.parse(row.items_json)
    }));
    
    socket.emit('history_updated', history);
  } catch (err) {
    console.error('Socket init database handshake sync drop:', err.message);
  }

  socket.on('disconnect', () => {
    console.log(`... Client disconnected: ${socket.id}`);
  });
});

// Start listening through your WebSocket server wrapper instance node
httpServer.listen(PORT, () => {
  console.log(`🚀 Hybrid Production API Server listening safely on port ${PORT}`);
});
