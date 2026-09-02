import express from 'express';
import cors from 'cors';
import { createServer } from 'http'; // Native HTTP wrapper for WebSocket hooks
import { Server } from 'socket.io';  // Low-latency synchronization engine
import mysql from 'mysql2/promise'; // Bluehost MySQL database driver

const app = express();

// 📍 PRODUCTION PORT BINDING: Accepts dynamic hosting server ports or defaults to 5000 locally
const PORT = process.env.PORT || 5000; 

// --- PACKET ROUTING PIPELINE MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// Bind the Express engine into an HTTP server instance node
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Permits secure local preview previews
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// 🔌 BLUEHOST SQL POOL INTERFACE (Verified configuration parameters matrix)
const db = mysql.createPool({
  host: 'jpwillenborg.com',               // Your Bluehost Shared IP or active domain name
  user: 'jpwillen_jpwillenborg',         // Your cPanel Database Username
  password: 'Pass8417WORD~!@',  // Your cPanel Database Password
  database: 'jpwillen_pizza_db',   // Your cPanel Database Name
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

const DATASTORE_MENU = {
  basePrices: { small: 8.00, medium: 11.00, large: 14.00 },
  toppings: [
    { id: 'pepperoni', name: 'Pepperoni', price: 1.50, category: 'meat', code: 'PEP' },
    { id: 'mushrooms', name: 'Mushrooms', price: 1.00, category: 'veggie', code: 'MSH' },
    { id: 'onions', name: 'Onions', price: 0.75, category: 'veggie', code: 'ONN' },
    { id: 'peppers', name: 'Green Peppers', price: 0.75, category: 'veggie', code: 'GPR' },
    { id: 'extra_cheese', name: 'Extra Mozzarella', price: 1.25, category: 'cheese', code: 'CHZ' }
  ]
};

const STATUS_STAGES = ['Received', 'Preparing', 'Baking', 'Out for Delivery', 'Delivered'];

// Helper helper function to transform SQL records row structures and stream over WebSockets
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
    let grandTotal = 0;
    
    // 🔒 SECURITY AUDIT: Independently calculate bills to block client adjustments
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
    const timestamp = new Date().toLocaleTimeString();

    const query = `
      INSERT INTO orders (order_id, customer_name, customer_phone, customer_address, total_bill, timestamp, items_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await db.query(query, [
      orderId, customer.name, customer.phone, customer.address, 
      grandTotal.toFixed(2), timestamp, JSON.stringify(validatedItems)
    ]);

    console.log(`🔒 Remote Data Block Logged: ${orderId} - Total Bill: $${grandTotal.toFixed(2)}`);
    
    io.emit('order_status_changed', { status: 'Received' });
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
    res.json({ status: rows[0].status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/status', async (req, res) => {
  const { status } = req.body;
  if (!STATUS_STAGES.includes(status)) return res.status(400).json({ message: 'Invalid status stage.' });

  try {
    const [rows] = await db.query('SELECT order_id FROM orders ORDER BY db_id DESC LIMIT 1');
    if (rows.length === 0) return res.status(404).json({ message: 'No orders found to mutate.' });

    await db.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, rows[0].order_id]);
    console.log(`🛠️ State mutation committed: Latest order row updated to "${status}"`);

    io.emit('order_status_changed', { status: status });
    await broadcastUpdatedHistory();

    res.status(200).json({ message: 'Remote status row metrics overwritten.' });
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
  console.log(`📡 WebSocket linked: ${socket.id}`);
  try {
    const [rows] = await db.query('SELECT status FROM orders ORDER BY db_id DESC LIMIT 1');
    if (rows.length > 0) socket.emit('order_status_changed', { status: rows[0].status });
    
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
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Start listening through your WebSocket server wrapper instance node
httpServer.listen(PORT, () => {
  console.log(`🚀 Hybrid Production API Server listening safely on port ${PORT}`);
});
