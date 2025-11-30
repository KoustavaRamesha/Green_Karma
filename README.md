# 🌱 Green Karma - Blockchain-Based Recycling Rewards Platform

Green Karma is a full-stack web application that rewards users with blockchain-based Carbon Tokens for verified recycling. Government officials act as validators to ensure the integrity of the recycling process.

## 🎯 Features

- **User Portal**: Submit recycling waste, earn Carbon Tokens, view history
- **Verifier Portal**: Government officials verify recycling via QR code scanning
- **Blockchain Integration**: Smart contracts on Polygon/Hardhat for transparent verification
- **Token Rewards**: ERC-20 Carbon Tokens based on waste type and weight
- **IPFS Storage**: Decentralized storage for waste photos
- **Real-time Dashboard**: Track tokens, history, and rewards

## 🏗️ Architecture

```
green-karma/
├── blockchain/          # Smart contracts (Hardhat + Solidity)
├── backend/            # API server (Node.js + Express + MongoDB)
├── frontend/           # Web app (Next.js + React + Tailwind)
├── docs/               # Documentation
└── README.md
```

## 📋 Prerequisites

- Node.js v18+ and npm
- MongoDB (local or Atlas)
- MetaMask wallet
- Git

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Install all dependencies
npm run install:all
```

### 2. Environment Setup

Create `.env` files in each directory:

**blockchain/.env**
```
PRIVATE_KEY=your_wallet_private_key
POLYGON_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_key
```

**backend/.env**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/greenkarma
JWT_SECRET=your_jwt_secret_key
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
BLOCKCHAIN_RPC_URL=http://localhost:8545
CONTRACT_ADDRESSES_PATH=../blockchain/deployments/contracts.json
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_CHAIN_ID=80001
NEXT_PUBLIC_RPC_URL=http://localhost:8545
```

### 3. Start Local Blockchain

```bash
cd blockchain
npm run node
```

### 4. Deploy Smart Contracts

In a new terminal:
```bash
cd blockchain
npm run deploy:local
```

### 5. Start Backend

```bash
cd backend
npm run dev
```

### 6. Start Frontend

```bash
cd frontend
npm run dev
```

### 7. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Blockchain**: http://localhost:8545

## 🔗 Smart Contracts

### IdentityContract
- Register users and verifiers
- Role-based access control
- Wallet address management

### RecycleRecordContract
- Record recycling events
- Link users with verifiers
- Emit verification events

### CarbonToken (ERC-20)
- Mintable token standard
- Controlled by RewardEngine

### RewardEngine
- Calculate rewards based on waste type:
  - Plastic: 5 tokens/kg
  - Paper: 3 tokens/kg
  - Metal: 4 tokens/kg
  - E-waste: 12 tokens/kg
  - Organic: 1 token/kg
- Mint tokens to users

## 🎨 Reward Rates

| Waste Type | Tokens per KG |
|------------|---------------|
| Plastic    | 5             |
| Paper      | 3             |
| Metal      | 4             |
| E-waste    | 12            |
| Organic    | 1             |

## 🔐 Security Features

- JWT authentication
- Role-based access control
- Wallet signature verification
- IPFS for decentralized storage
- On-chain verification records

## 📱 User Flow

1. **Sign Up**: Create account and connect wallet
2. **Submit Waste**: Select type, upload photo, enter weight
3. **Generate QR**: System creates QR code for verification
4. **Verification**: Government official scans and verifies
5. **Earn Tokens**: Smart contract mints Carbon Tokens
6. **Redeem**: Use tokens for rewards

## 🏛️ Verifier Flow

1. **Login**: Government official authentication
2. **Scan QR**: Use built-in scanner
3. **Verify**: Enter actual weight and waste type
4. **Submit**: Trigger blockchain verification
5. **Track**: View verification logs

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Waste Management
- `POST /api/submit-waste` - Submit recycling waste
- `POST /api/generate-qr` - Generate QR code
- `POST /api/verify-waste` - Verify waste (verifier only)

### User Data
- `GET /api/history/:userId` - Get recycling history
- `GET /api/token-balance/:address` - Get token balance
- `POST /api/redeem` - Redeem rewards

## 🛠️ Technology Stack

### Frontend
- Next.js 14
- React 18
- Tailwind CSS
- Wagmi/Web3Modal
- QR Code Generator/Scanner

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- IPFS (Pinata)

### Blockchain
- Solidity ^0.8.20
- Hardhat
- OpenZeppelin Contracts
- Ethers.js v6

## 📦 Deployment

### Deploy to Polygon Mumbai Testnet

```bash
cd blockchain
npm run deploy:mumbai
```

### Deploy Backend (Heroku/Railway)

```bash
cd backend
# Follow platform-specific deployment guide
```

### Deploy Frontend (Vercel)

```bash
cd frontend
vercel deploy
```

## 🧪 Testing

```bash
# Test smart contracts
cd blockchain
npm test

# Test backend
cd backend
npm test

# Test frontend
cd frontend
npm test
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

## 📄 License

MIT License

## 🌍 Environmental Impact

Every kilogram of waste recycled through Green Karma contributes to:
- Reduced landfill waste
- Lower carbon emissions
- Circular economy promotion
- Community engagement

---

**Built with 💚 for a sustainable future**
