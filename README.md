# 🍕 Full-Stack Real-Time Pizza Customizer Platform

A high-performance, event-driven e-commerce platform featuring an interactive customizer portal for clients and a real-time analytics dashboard for operations. This hybrid system architecture pairs a static, highly optimized frontend canvas with a secure, decoupled cloud runtime environment backed by a persistent relational database.

🔗 **Live Client Application:** [https://jpwillenborg.com/projects/pizza/](https://jpwillenborg.com/projects/pizza/)  
🔗 **API Server Instance:** [https://full-stack-pizza.onrender.com](https://full-stack-pizza.onrender.com)

---

## 🛠️ Core Engineering Architecture & Tech Stack

The application relies on a decoupled, asynchronous multi-cloud architecture optimized for low-latency state changes and strict boundary isolation.

### 🌐 Frontend (Client Workspace Engine)
* **React 18 & Vite:** Leveraged for fast, declarative component synchronization, lightning-quick HMR, and ultra-lean production bundle compiling.
* **Component-Driven Styling (index.css):** Standard compliant, responsive CSS grids and structural flex boxes engineered for hardware-relative device scaling.
* **Dynamic Client-Side Math:** High-fidelity pricing engines that calculate bill summaries instantly on the client layout container before checkout deployment.

### ⚡ Backend (Express API & Event Dispatcher)
* **Node.js & Express:** Modular RESTful interface routes payload transfers safely across secure network protocols.
* **Socket.io (WebSockets):** Low-latency, full-duplex TCP communication channels that stream active system event broadcasts to all live client portals simultaneously.
* **Independent ID-Based Lookup Routing:** Optimized relational query logic designed to update individual database rows selectively by unique transaction keys (`ORD-XXXXXX`).

### 💾 Datastore & Security Layer (MySQL & Data Masking)
* **Bluehost Shared MySQL Pool:** High-throughput, parameterized connection pooling structured to persist relational transaction states safely.
* **Server-Side Financial Verification:** Independent server-side billing calculation safeguards built inside Node to eliminate malicious frontend parameter tampering.
* **Dotenv Environment Encryption:** Decoupled config modules (`process.env`) and rigorous `.gitignore` filters built to completely block database credentials from public version control.

---

## 📊 Architectural Flow Diagram

```text
 [ E-Commerce Client View ]      ↔ (WebSockets) ↔      [ Render Cloud Node Server ]
   • Customizes Ingredients                              • Loads Dotenv Secrets Vault
   • Triggers "Place Order"                              • Audits Client Price Logic
              ↓                                          • Broadcasts Stage Changes
        (HTTP POST API)                                              ↓
              ↳ ↳ ↳ ↳ ↳ ↳ ↳ ↳ ↳ ↳ ↳ ↳ ↳ ↳ ↳ ↳ ↳ ↳ ↳ ↳ ↳ ↳ ↳  [ Bluehost MySQL Pool ]
                                                            • Logs Relational Receipts
                                                            • Overwrites Unique IDs
```

---

## 🌟 Key Engineering Features Implemented

1. **Anti-Tampering Security Audits:** Frontend configurations submit raw item manifests, while the Node runtime recalculated prices directly using localized database values. This completely neutralizes client-side payload manipulation.
2. **Full-Width Granular Operational Grid:** The admin console drops redundant switchboards to expose an expanded data workspace table that tiles order cards into an accessible responsive grid.
3. **Hardware Viewport Handshake:** Integrated explicit hardware `<meta>` instructions alongside relative viewport typography calculations to force physical phone devices (e.g., Google Pixel 10) to scale and stack components uniformly.
4. **ID-Based Status Matrix Toggle:** Refactored architecture away from basic indices to key-value status lookups. Staff can use localized dropdown selects on individual ticket cards to alter any past transaction instantly over real-time pipelines.
5. **Vite Cache-Busting Compilation:** Integrated dedicated asset naming conventions inside `vite.config.js` to output static production paths (`app-style.css`), combining query parameters (`?v=999`) to break aggressive proxy memory layers on shared servers.

---

## ⚙️ Local Installation & Development Launch

To launch this full-stack project locally on your machine, clone the repository and initialize the isolated environments:

### 1. Set Up the Backend API Node
```bash
cd pizza-server
npm install

# Create a local .env file in the root of /pizza-server and configure:
# DB_HOST=your_host
# DB_USER=your_user
# DB_PASSWORD=your_password
# DB_DATABASE=your_db
# PORT=5000

node server.js
```

### 2. Set Up the Frontend Engine
```bash
cd ../pizza-client
npm install
npm run dev
```
*Open your browser and point your workspace path link straight to `http://localhost:5173` to interact with your system instance.*

---

## 🔒 Production Deployment Procedures

### Frontend Compilation
1. Execute `npm run build -- --force` locally to wipe out standard Vite development caches and bundle compressed assets.
2. Hard-code your cash-buster version tag inside your generated landing index file (`dist/index.html`).
3. Purge older directory assets completely inside your destination subfolder on your Bluehost File Manager before uploading and extracting the fresh distribution zip.

### Backend Continuous Integration
1. Sync files over source boundaries using **GitHub Desktop**.
2. Render triggers continuous integration hooks automatically to redeploy active containers.
3. Secrets remain protected by embedding database connection pools directly inside Render's secure **Environment Variables Dashboard**.
