# 🚀 Green Karma - Quick Start Guide

This guide will help you set up and run the complete Green Karma application.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **MongoDB** ([Download](https://www.mongodb.com/try/download/community))
- **MetaMask** browser extension ([Install](https://metamask.io/))
- **Git** (optional, for version control)

## 🛠️ Installation

### Step 1: Install All Dependencies

Open a terminal in the project root directory and run:

```bash
npm run install:all
```

This will install dependencies for blockchain, backend, and frontend.

### Step 2: Configure Environment Variables

#### Blockchain Configuration

1. Navigate to `blockchain/` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cp blockchain/.env.example blockchain/.env
   ```
3. Edit `blockchain/.env` (for local development, you can leave defaults)

#### Backend Configuration

1. Navigate to `backend/` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. Edit `backend/.env`:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/greenkarma
   JWT_SECRET=your_secure_random_string_here
   BLOCKCHAIN_RPC_URL=http://localhost:8545
   BLOCKCHAIN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
   
   **Note**: The private key above is from Hardhat's default accounts (for local development only).

#### Frontend Configuration

1. Navigate to `frontend/` directory
2. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp frontend/.env.local.example frontend/.env.local
   ```
3. Edit `frontend/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_CHAIN_ID=1337
   NEXT_PUBLIC_RPC_URL=http://localhost:8545
   ```

### Step 3: Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows (if installed as service)
net start MongoDB

# macOS (using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

## 🚀 Running the Application

### Option 1: Run All Services Together (Recommended)

Open **3 separate terminal windows**:

#### Terminal 1: Start Blockchain

```bash
cd blockchain
npm run node
```

Keep this terminal running. You should see:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

#### Terminal 2: Deploy Smart Contracts

In a new terminal:

```bash
cd blockchain
npm run deploy:local
```

You should see contract addresses printed. Keep note of these.

#### Terminal 3: Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
✅ Blockchain connection initialized
🚀 Server running on port 5000
```

#### Terminal 4: Start Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000
```

### Option 2: Manual Step-by-Step

Follow the same steps as Option 1, but in sequence.

## 🌐 Access the Application

Once all services are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Blockchain**: http://localhost:8545

## 👤 Create Your First Account

1. Open http://localhost:3000
2. Click **"Get Started"** or **"Register"**
3. Click **"Connect Wallet"** and connect MetaMask
4. Fill in the registration form:
   - Name: Your Name
   - Email: your@email.com
   - Password: password123
   - Account Type: **User** (to recycle) or **Verifier** (to verify)
5. Click **"Create Account"**

## 🔧 Configure MetaMask for Local Blockchain

1. Open MetaMask
2. Click the network dropdown (top center)
3. Click **"Add Network"** → **"Add a network manually"**
4. Enter the following:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`
5. Click **"Save"**

### Import Test Account

To get test ETH for transactions:

1. In MetaMask, click your account icon → **"Import Account"**
2. Paste this private key (Hardhat's first test account):
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
3. You should now have 10,000 ETH for testing

## 📝 Using the Application

### As a User:

1. **Login** at http://localhost:3000/login
2. Go to **Dashboard**
3. Click **"Submit Waste"**
4. Select waste category, enter weight, optionally upload photo
5. Click **"Submit Waste"**
6. A QR code will be generated - save or screenshot it
7. Wait for a verifier to scan and verify

### As a Verifier:

1. **Register** with Account Type: **Verifier**
2. **Login** and you'll be redirected to the Verifier Portal
3. Click **"Scan QR Code"**
4. Paste the QR data from a user's submission
5. Review the submission details
6. Enter actual weight and click **"Approve"** or **"Reject"**
7. The blockchain will record the verification and mint tokens

## 🎯 Testing the Full Flow

### Complete End-to-End Test:

1. **Create User Account**
   - Register as a user
   - Connect wallet

2. **Create Verifier Account**
   - Use a different email
   - Register as a verifier
   - Connect a different wallet address

3. **Submit Waste (as User)**
   - Login as user
   - Submit waste (e.g., 2kg of Plastic)
   - Copy the QR code data

4. **Verify Waste (as Verifier)**
   - Login as verifier
   - Scan the QR code
   - Approve the submission

5. **Check Rewards (as User)**
   - Login as user
   - Check dashboard
   - You should see: 10 Carbon Tokens (2kg × 5 tokens/kg)

## 🐛 Troubleshooting

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**: Make sure MongoDB is running:
```bash
# Check if MongoDB is running
mongosh

# If not, start it
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
net start MongoDB                      # Windows
```

### Blockchain Connection Error

```
Error: could not detect network
```

**Solution**: 
1. Make sure Hardhat node is running: `cd blockchain && npm run node`
2. Check that RPC URL is `http://localhost:8545` in all `.env` files

### Contract Not Deployed

```
Error: Contract deployment file not found
```

**Solution**: Deploy contracts:
```bash
cd blockchain
npm run deploy:local
```

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**: Kill the process using that port:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### MetaMask Transaction Errors

**Solution**: Reset MetaMask account:
1. MetaMask → Settings → Advanced
2. Click **"Reset Account"**
3. This clears transaction history

## 📊 Reward Rates

| Waste Type | Tokens per KG |
|------------|---------------|
| Plastic    | 5 CARB        |
| Paper      | 3 CARB        |
| Metal      | 4 CARB        |
| E-waste    | 12 CARB       |
| Organic    | 1 CARB        |

## 🔐 Security Notes

⚠️ **IMPORTANT**: The configuration provided is for **LOCAL DEVELOPMENT ONLY**.

For production deployment:
- Generate secure random strings for `JWT_SECRET`
- Never commit private keys to version control
- Use environment-specific `.env` files
- Enable HTTPS
- Use production MongoDB instance
- Deploy to Polygon Mumbai testnet or mainnet

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User Endpoints

- `GET /api/user/profile` - Get user profile
- `GET /api/user/dashboard` - Get dashboard stats
- `GET /api/user/history` - Get recycling history
- `GET /api/user/token-balance` - Get token balance

### Waste Endpoints

- `POST /api/waste/submit` - Submit waste
- `GET /api/waste/submissions` - Get user submissions

### Verifier Endpoints

- `GET /api/verifier/pending` - Get pending verifications
- `POST /api/verifier/verify/:id` - Verify submission
- `POST /api/verifier/scan-qr` - Scan QR code
- `GET /api/verifier/history` - Get verification history

## 🎉 Success!

If you've followed all steps, you should now have:

✅ Local blockchain running with deployed smart contracts
✅ Backend API server connected to MongoDB and blockchain
✅ Frontend web application accessible at localhost:3000
✅ Ability to create users and verifiers
✅ Complete recycling submission and verification flow
✅ Carbon Token rewards minted on blockchain

## 🆘 Need Help?

If you encounter any issues:

1. Check the terminal logs for error messages
2. Verify all services are running
3. Ensure environment variables are set correctly
4. Try restarting all services
5. Check the Troubleshooting section above

## 🚀 Next Steps

- Explore the dashboard and submit waste
- Check blockchain transactions in MetaMask
- View token balance in your wallet
- Test the verifier portal
- Customize the UI/UX
- Deploy to testnet (Polygon Mumbai)

---

**Happy Recycling! 🌱♻️**
