# 🌱 Green Karma - Blockchain Recycling Rewards Platform

<p align="center">
  <img src="https://img.shields.io/badge/Solidity-0.8.20-blue?logo=solidity" alt="Solidity"/>
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Node.js-18+-green?logo=node.js" alt="Node.js"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License"/>
</p>

> **Turn Waste into Wealth, One Token at a Time** 🌍💰

A decentralized Web3 platform that incentivizes recycling by rewarding verified waste submissions with **CARB (Carbon) tokens**. Built with blockchain transparency, human verification, and tamper-proof certificates.

---

## ✨ Key Features

### For Users

- 🔐 **Secure Authentication** - Google Sign-In + MetaMask wallet connection
- 📸 **Easy Submissions** - Upload photos of recyclable waste
- 💎 **Earn CARB Tokens** - Automatic rewards based on waste category & weight
- 🏆 **Achievement Certificates** - Tamper-proof blockchain certificates for 40kg+ submissions
- 📊 **Track Progress** - Dashboard with statistics, history, and leaderboards
- 🎁 **Redeem Rewards** - Exchange tokens for eco-products and discounts

### For Verifiers

- 📱 **QR Code Scanning** - Quickly find and verify submissions
- ✅ **Approve/Reject** - Validate waste with actual weight input
- 📋 **Verification History** - Track all verified submissions
- 🔒 **Role-Based Access** - Only registered verifiers can approve

### Blockchain Features

- 🔗 **5 Smart Contracts** - Identity, Records, Token, Rewards, Certificates
- 🛡️ **Tamper-Proof** - All records immutably stored on-chain
- 📜 **Verifiable Certificates** - SHA-256 hash verification
- ⚡ **Automated Rewards** - Smart contracts mint tokens instantly

---

## 💰 Token Economics (CARB)

| Waste Category | Tokens/kg | Rationale                              |
| -------------- | --------- | -------------------------------------- |
| 🔌 E-Waste     | 12 CARB   | Rare metals, high environmental impact |
| 🥤 Plastic     | 5 CARB    | Ocean pollution prevention             |
| 🥫 Metal       | 4 CARB    | Energy-intensive production            |
| 📄 Paper       | 3 CARB    | Deforestation prevention               |
| 🌿 Organic     | 1 CARB    | Composting value                       |

---

## 🏗️ Tech Stack

| Layer          | Technologies                                     |
| -------------- | ------------------------------------------------ |
| **Blockchain** | Ethereum, Hardhat, Solidity 0.8.20, OpenZeppelin |
| **Backend**    | Node.js, Express.js, Firebase/Firestore          |
| **Frontend**   | Next.js 14, React, TailwindCSS, Framer Motion    |
| **Web3**       | ethers.js, RainbowKit, WalletConnect             |
| **Storage**    | IPFS (Pinata), Firebase Storage                  |
| **Auth**       | JWT, Google OAuth, Wallet-based                  |

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- MetaMask browser extension
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/KoustavaRamesha/Green_Karma.git
cd Green_Karma

# Install all dependencies
npm run install:all
```

### Running the Application

**Option 1: Using Start Script (Windows)**

```bash
start.bat
```

**Option 2: Manual Setup (4 Terminals)**

```bash
# Terminal 1 - Start local blockchain
cd blockchain && npx hardhat node

# Terminal 2 - Deploy smart contracts (wait for Terminal 1)
cd blockchain && npx hardhat run scripts/deploy.js --network localhost

# Terminal 3 - Start backend server
cd backend && npm run dev

# Terminal 4 - Start frontend
cd frontend && npm run dev
```

### Access Points

| Service           | URL                   |
| ----------------- | --------------------- |
| 🌐 Frontend       | http://localhost:3000 |
| 🔌 Backend API    | http://localhost:5000 |
| ⛓️ Blockchain RPC | http://localhost:8545 |

---

## 📁 Project Structure

```
Green_Karma/
├── blockchain/           # Smart contracts & deployment
│   ├── contracts/        # Solidity contracts
│   │   ├── IdentityContract.sol
│   │   ├── RecycleRecordContract.sol
│   │   ├── CarbonToken.sol
│   │   ├── RewardEngine.sol
│   │   └── CertificateContract.sol
│   ├── scripts/          # Deployment scripts
│   └── hardhat.config.js
│
├── backend/              # Express.js API server
│   ├── routes/           # API endpoints
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── waste.js
│   │   ├── verifier.js
│   │   └── certificate.js
│   ├── middleware/       # Auth middleware
│   ├── utils/            # Blockchain & IPFS utilities
│   └── config/           # Firebase config
│
├── frontend/             # Next.js web application
│   ├── pages/            # Route pages
│   │   ├── index.js      # Landing page
│   │   ├── dashboard.js  # User dashboard
│   │   ├── verifier.js   # Verifier portal
│   │   ├── redeem.js     # Token redemption
│   │   └── login.js      # Authentication
│   ├── components/       # React components
│   ├── lib/              # API & Firebase utilities
│   └── styles/           # Global CSS
│
└── docs/                 # Documentation
    ├── API.md
    ├── DEPLOYMENT.md
    └── INVESTOR_PITCH.md
```

---

## 🔗 Smart Contracts

| Contract                  | Purpose                      | Key Functions                                                      |
| ------------------------- | ---------------------------- | ------------------------------------------------------------------ |
| **IdentityContract**      | User & Verifier registration | `registerUser()`, `registerVerifier()`, `isUser()`, `isVerifier()` |
| **RecycleRecordContract** | Immutable recycling records  | `recordRecycling()`, `getRecord()`, `getUserRecords()`             |
| **CarbonToken**           | ERC-20 reward token          | `mint()`, `burn()`, `balanceOf()`                                  |
| **RewardEngine**          | Automated reward calculation | `calculateReward()`, `processReward()`                             |
| **CertificateContract**   | Achievement certificates     | `issueCertificate()`, `verifyCertificate()`                        |

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
JWT_SECRET=your_jwt_secret
FIREBASE_PROJECT_ID=your_project_id
PRIVATE_KEY=your_blockchain_private_key
CONTRACT_IDENTITY=0x...
CONTRACT_RECYCLE=0x...
CONTRACT_TOKEN=0x...
CONTRACT_REWARD=0x...
CONTRACT_CERTIFICATE=0x...
PINATA_API_KEY=your_pinata_key (optional)
PINATA_SECRET_KEY=your_pinata_secret (optional)
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

---

## 🧪 Test Account (Local Development)

```
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

> ⚠️ This is a Hardhat test account. Never use in production!

---

## 📖 API Documentation

See [docs/API.md](docs/API.md) for complete API reference.

### Key Endpoints

| Method | Endpoint                            | Description                |
| ------ | ----------------------------------- | -------------------------- |
| POST   | `/api/auth/register`                | Register new user          |
| POST   | `/api/auth/login`                   | User login                 |
| POST   | `/api/waste/submit`                 | Submit waste for recycling |
| GET    | `/api/waste/history`                | Get submission history     |
| GET    | `/api/verifier/pending`             | Get pending verifications  |
| POST   | `/api/verifier/verify/:id`          | Verify a submission        |
| GET    | `/api/certificates/my-certificates` | Get user certificates      |

---

## 🚢 Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment guide.

### Quick Deploy Checklist

- [ ] Deploy contracts to Polygon/Ethereum mainnet
- [ ] Update contract addresses in backend
- [ ] Set up Firebase production project
- [ ] Configure environment variables
- [ ] Deploy backend to cloud (Railway/Render)
- [ ] Deploy frontend to Vercel

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Pranav R H** -Team Head
- **K P nihal** -Member 1
- **Koustava Ramesha** -Member 2
- **Chandan KV** -Member 3
- **Rethash Reddy** -Member 4

---

## 📞 Contact

- **GitHub**: [@KoustavaRamesha](https://github.com/KoustavaRamesha)
- **Email**: [pranavrh260@example.com]

---

<p align="center">
  <b>Built with 💚 for a sustainable future By Team Data_Dawgs</b>
  <br/>
  <i>Every piece of recycled waste counts!</i>
</p>
