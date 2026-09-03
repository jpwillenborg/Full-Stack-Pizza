# Full-Stack Real-Time Pizza Tracker

Full-Stack Real-Time Pizza Tracker is a high-performance pizza ordering and administrative application built with Node.js, Express, Socket.io, ReactJS, and MySQL. It provides a seamless platform for custom ingredient scaling, interactive cart checkouts, automated order status tracking, and unified historical metrics logging through an event-driven system architecture.

The application uses parameterized queries, rigorous input regex filtering, and server-side data sanitation shields to protect transactional workflows. The frontend communicates with the backend via low-latency RESTful APIs and full-duplex TCP WebSockets, while both modules are isolated and deployed to decoupled production web environments.

## How to Run

Clone the repository:

```bash
git clone https://github.com/jpwillenborg/Full-Stack-Pizza
cd full-stack-pizza
```

### Backend

```bash
cd pizza-server
npm install

# Create a local .env file in the /pizza-server root and configure:
# DB_HOST=your_host_url
# DB_USER=your_db_user
# DB_PASSWORD=your_secure_password
# DB_DATABASE=your_database_name
# PORT=5000

node server.js
```

Backend runs locally on port 5000 and interfaces dynamically with remote MySQL connection pools.

### Frontend

```bash
cd ../pizza-client
npm install
npm run dev
```

Frontend runs locally on port 5173 with automatic Hot Module Replacement (HMR).
