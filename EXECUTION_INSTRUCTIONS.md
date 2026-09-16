# EDUCATE Portal - Execution Instructions

This document provides a step-by-step guide to setting up and running the EDUCATE Portal project locally. The project consists of three main components: a local Ethereum blockchain (Hardhat), a Node.js backend, and a React frontend.

## Prerequisites

Before running the project, ensure you have the following installed on your system:
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Ensure the MongoDB service is running locally on the default port `27017`)
- **Git Bash / Terminal** 

---

## Step 1: Start the Local Blockchain (Hardhat)

The project uses a local Ethereum network to deploy smart contracts and interact with them without spending real gas.

1. Open a new terminal.
2. Navigate to the `ethereum` directory:
   ```bash
   cd ethereum
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the local Hardhat node:
   ```bash
   npx hardhat node
   ```
   *Keep this terminal running. It simulates the Ethereum blockchain on `http://127.0.0.1:8545` (or `7545` depending on your config).*

---

## Step 2: Deploy the Smart Contract

You need to deploy the certificate smart contract to your local blockchain network.

1. Open a **second** terminal.
2. Navigate to the `ethereum` directory:
   ```bash
   cd ethereum
   ```
3. Run the deployment script:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```
4. **Important**: The terminal will output the deployed contract address. Copy this address.
5. Open `backend/server.js` and locate the `contractAddress` variable (around line 38). Replace it with the newly deployed contract address:
   ```javascript
   const contractAddress = 'YOUR_NEW_CONTRACT_ADDRESS';
   ```

---

## Step 3: Start the Backend (Node.js/Express)

The backend interacts with the MongoDB database and the local blockchain.

1. Open a **third** terminal.
2. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Ensure your local MongoDB is running (`mongodb://127.0.0.1:27017/studentPortal`).
5. Start the server:
   ```bash
   npm start
   ```
   *(Alternatively, run `node server.js`)*
6. The backend server will start on port `5000`. 
   - *Note: The system automatically seeds a default Admin user (`username: saikat`, `password: Saikat@123`) when it starts up successfully.*

---

## Step 4: Start the Frontend (React/Vite)

The frontend provides the user interface for Candidates and Administrators.

1. Open a **fourth** terminal.
2. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. The terminal will display a local URL (e.g., `http://localhost:5173`). Open this URL in your browser to access the portal.

---

## Default Login Credentials

**Admin Dashboard**
- **Username:** `saikat`
- **Password:** `Saikat@123`

---

## Troubleshooting

- **MongoDB Connection Error:** Make sure the MongoDB service is running. You can check the services list on Windows or use `mongod` command to start it.
- **Contract Interaction Fails:** Ensure the `contractAddress` in `backend/server.js` exactly matches the one you deployed in Step 2. Also, ensure the Hardhat node (Step 1) is still running.
- **Port In Use:** If port `5000` or `5173` is in use, terminate the existing processes or change the default ports in the respective configurations.
