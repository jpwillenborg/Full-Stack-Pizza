import express from 'express';
import cors from 'cors';
import { createServer } from 'http'; // Native HTTP wrapper for WebSocket hooks
import { Server } from 'socket.io';  // Low-latency synchronization engine

const app = express();
const PORT = 5000;

// --- PACKET ROUTING PIPELINE MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// Instantiate native server channels to coordinate data streams
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Permits secure handshakes from your Vite port
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// --- GLOBAL STORAGE REGISTRIES (DATABASE IN-MEMORY CACHE) ---
const DATABASE_ORDERS = []; // Holds persistent full transaction blueprints securely
let activeOrderIndex = -1;  // Tracks index pointer locations for customer status loops

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

// --- REST API ENDPOINTS ---

// 📍 GET ROUTE: Exposes current master ingredient definitions to client views
app.get('/api/menu', (req, res) => {
  res.status(200).json(DATASTORE_MENU);
});

// 📍 GET ROUTE: Fetches entire log archive history for administration elements
app.get('/api/orders/history', (req, res) => {
  res.status(200).json(DATABASE_ORDERS);
});

// 📍 POST ROUTE: Captures incoming carts and validates prices strictly on the server-side
app.post('/api/orders', (req, res) => {
  const { items, customer } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Cannot process an empty order databundle.' });
  }

  let serverCalculatedGrandTotal = 0;

  // 🔒 SECURITY CHECK: Recalculate totals natively to block client console overrides
  const validatedItems = items.map((clientItem) => {
    const serverBasePrice = DATASTORE_MENU.basePrices[clientItem.size];
    if (serverBasePrice === undefined) {
      return res.status(400).json({ message: `Invalid pizza size validation failure: ${clientItem.size}` });
    }

    let serverToppingsTotal = 0;
    clientItem.toppings.forEach((toppingId) => {
      const serverToppingRecord = DATASTORE_MENU.toppings.find(t => t.id === toppingId);
      if (serverToppingRecord) {
        serverToppingsTotal += serverToppingRecord.price;
      }
    });

    const itemTotal = serverBasePrice + serverToppingsTotal;
    serverCalculatedGrandTotal += itemTotal;

    return {
      size: clientItem.size,
      toppings: clientItem.toppings,
      verifiedPrice: itemTotal
    };
  });

  // Construct a clean, unique data structural manifest receipt record
  const newOrder = {
    id: `ORD-${Date.now().toString().slice(-6)}`,
    items: validatedItems,
    customer: customer, // Attaches verified Name, Phone, and Address tracking parameters
    status: 'Received',
    totalBill: serverCalculatedGrandTotal.toFixed(2),
    timestamp: new Date().toLocaleTimeString()
  };

  DATABASE_ORDERS.push(newOrder);
  activeOrderIndex = DATABASE_ORDERS.length - 1; // Explicitly map index path tracking pointers

  console.log(`🔒 Security Audit passed! Saved receipt ${newOrder.id} with secure total of $${newOrder.totalBill}`);

  // 📡 Broadcast live alerts down to tracking clients immediately
  io.emit('order_status_changed', { status: 'Received' });
  io.emit('history_updated', DATABASE_ORDERS); 

  res.status(201).json({ message: 'Transaction authorized and price securely validated.' });
});

// 📍 GET ROUTE: Exposes tracking variable parameters for poller fallback loops
app.get('/api/orders/track', (req, res) => {
  if (activeOrderIndex === -1 || !DATABASE_ORDERS[activeOrderIndex]) {
    return res.status(404).json({ status: 'No Active Orders' });
  }
  res.json({ status: DATABASE_ORDERS[activeOrderIndex].status });
});

// 📍 PUT ROUTE: Allows manual administration status updates via control panel clicks
app.put('/api/orders/status', (req, res) => {
  const { status } = req.body;
  
  if (activeOrderIndex === -1 || !DATABASE_ORDERS[activeOrderIndex]) {
    return res.status(404).json({ message: 'No active orders found to update.' });
  }
  if (!STATUS_STAGES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status stage token submitted.' });
  }

  DATABASE_ORDERS[activeOrderIndex].status = status;
  console.log(`🛠️ Admin manually changed tracking flag status directly to: ${status}`);

  // 📡 Push updated metadata payloads instantly across sockets
  io.emit('order_status_changed', { status: status });
  io.emit('history_updated', DATABASE_ORDERS);

  res.status(200).json({ message: 'Status updated successfully.' });
});

// 📍 DELETE ROUTE: Cleans and wipes out log histories entirely on manual requests
app.delete('/api/orders/history', (req, res) => {
  DATABASE_ORDERS.length = 0; // Wipes array references cleanly
  activeOrderIndex = -1;      // Forces tracker pointers back to default settings

  console.log('🧹 Admin triggered full cache wipe. Historical logs array scrubbed.');

  // 📡 Alert running app panels to refresh and clear out metrics layout tables immediately
  io.emit('history_updated', DATABASE_ORDERS);
  io.emit('order_status_changed', { status: 'No Active Orders' });

  res.status(200).json({ message: 'Datastore archive successfully scrubbed.' });
});

// --- SOCKET.IO REAL-TIME ROUTINES ---
io.on('connection', (socket) => {
  console.log(`📡 New WebSocket tunnel link established from client: ${socket.id}`);
  
  // Synchronize new elements mounts with exact active configuration matrices instantly
  if (activeOrderIndex !== -1 && DATABASE_ORDERS[activeOrderIndex]) {
    socket.emit('order_status_changed', { status: DATABASE_ORDERS[activeOrderIndex].status });
  }
  socket.emit('history_updated', DATABASE_ORDERS);

  socket.on('disconnect', () => {
    console.log(`🔌 Client tunnel disconnected: ${socket.id}`);
  });
});

// Fire up our custom HTTP wrapping cluster configuration
httpServer.listen(PORT, () => {
  console.log(`🚀 Real-Time Full-Stack Server initialized securely at http://localhost:${PORT}`);
});
