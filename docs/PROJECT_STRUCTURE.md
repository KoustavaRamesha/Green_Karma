# 📁 Green Karma - Project Structure

```
green-karma/
│
├── 📄 README.md                    # Main project documentation
├── 📄 SETUP_GUIDE.md              # Quick start guide
├── 📄 package.json                # Root package.json for scripts
├── 📄 .gitignore                  # Git ignore rules
│
├── 📂 blockchain/                 # Smart Contracts & Hardhat
│   ├── 📂 contracts/              # Solidity smart contracts
│   │   ├── IdentityContract.sol  # User & verifier registration
│   │   ├── RecycleRecordContract.sol  # Recycling records
│   │   ├── CarbonToken.sol        # ERC-20 token
│   │   └── RewardEngine.sol       # Token reward distribution
│   │
│   ├── 📂 scripts/                # Deployment scripts
│   │   └── deploy.js              # Main deployment script
│   │
│   ├── 📂 test/                   # Contract tests (to be added)
│   ├── 📂 deployments/            # Deployed contract addresses
│   │   └── contracts.json         # Auto-generated after deployment
│   │
│   ├── hardhat.config.js          # Hardhat configuration
│   ├── package.json               # Blockchain dependencies
│   └── .env.example               # Environment template
│
├── 📂 backend/                    # Node.js Express API
│   ├── 📂 models/                 # MongoDB models
│   │   ├── User.js                # User model
│   │   └── WasteSubmission.js     # Waste submission model
│   │
│   ├── 📂 routes/                 # API routes
│   │   ├── auth.js                # Authentication routes
│   │   ├── user.js                # User routes
│   │   ├── waste.js               # Waste submission routes
│   │   └── verifier.js            # Verifier routes
│   │
│   ├── 📂 middleware/             # Express middleware
│   │   └── auth.js                # JWT authentication
│   │
│   ├── 📂 utils/                  # Utility functions
│   │   ├── blockchain.js          # Blockchain interactions
│   │   └── ipfs.js                # IPFS/Pinata integration
│   │
│   ├── server.js                  # Main server file
│   ├── package.json               # Backend dependencies
│   └── .env.example               # Environment template
│
├── 📂 frontend/                   # Next.js React Application
│   ├── 📂 pages/                  # Next.js pages
│   │   ├── _app.js                # App wrapper
│   │   ├── _document.js           # Document structure
│   │   ├── index.js               # Landing page
│   │   ├── login.js               # Login page
│   │   ├── register.js            # Registration page
│   │   ├── dashboard.js           # User dashboard
│   │   └── verifier.js            # Verifier portal
│   │
│   ├── 📂 components/             # React components (to be added)
│   ├── 📂 lib/                    # Utilities
│   │   └── api.js                 # API client
│   │
│   ├── 📂 providers/              # Context providers
│   │   └── Web3Provider.js        # Web3/Wagmi provider
│   │
│   ├── 📂 styles/                 # CSS styles
│   │   └── globals.css            # Global styles
│   │
│   ├── 📂 public/                 # Static assets
│   ├── next.config.js             # Next.js configuration
│   ├── tailwind.config.js         # Tailwind CSS config
│   ├── package.json               # Frontend dependencies
│   └── .env.local.example         # Environment template
│
└── 📂 docs/                       # Documentation
    ├── API.md                     # API documentation
    └── DEPLOYMENT.md              # Deployment guide
```

## 🔑 Key Files Explained

### Blockchain

- **IdentityContract.sol**: Manages user and verifier registration with role-based access
- **RecycleRecordContract.sol**: Records recycling events with verifier validation
- **CarbonToken.sol**: ERC-20 token for rewards
- **RewardEngine.sol**: Calculates and mints rewards based on waste type and weight
- **deploy.js**: Deploys all contracts and saves addresses

### Backend

- **server.js**: Express server setup with middleware and routes
- **User.js**: User model with wallet address and statistics
- **WasteSubmission.js**: Waste submission model with verification status
- **auth.js** (routes): Registration and login endpoints
- **user.js** (routes): User profile, history, and dashboard
- **waste.js** (routes): Waste submission endpoints
- **verifier.js** (routes): Verification and QR scanning
- **blockchain.js**: Ethers.js integration for smart contract calls
- **ipfs.js**: Pinata integration for image storage

### Frontend

- **index.js**: Beautiful landing page with features and stats
- **login.js**: Login form with role-based redirection
- **register.js**: Registration with wallet connection
- **dashboard.js**: User dashboard with stats, charts, and submission form
- **verifier.js**: Verifier portal with QR scanning and verification
- **Web3Provider.js**: RainbowKit and Wagmi configuration
- **api.js**: Axios client for backend API calls
- **globals.css**: Tailwind CSS with custom green theme

## 🎨 Design System

### Colors

- **Primary Green**: #10b981 (Emerald 500)
- **Secondary Green**: #059669 (Emerald 600)
- **Light Green**: #d1fae5 (Emerald 100)
- **Background**: Gradient from green-50 to emerald-50

### Components

- **Buttons**: Gradient backgrounds with hover effects
- **Cards**: White with shadow and rounded corners
- **Stats Cards**: Gradient backgrounds with icons
- **Badges**: Color-coded status indicators
- **Forms**: Clean inputs with focus states

## 🔄 Data Flow

### User Recycling Flow

1. User submits waste via frontend
2. Frontend uploads image to IPFS (Pinata)
3. Backend creates submission in MongoDB
4. Backend generates QR code
5. Verifier scans QR code
6. Verifier approves/rejects
7. Backend calls smart contract to record on blockchain
8. Smart contract emits event
9. RewardEngine mints tokens to user
10. Frontend displays updated balance

### Authentication Flow

1. User registers with email, password, and wallet
2. Backend hashes password and stores user
3. Backend calls IdentityContract to register on blockchain
4. Backend returns JWT token
5. Frontend stores token in localStorage
6. All subsequent requests include token in Authorization header

## 🔐 Security Layers

1. **JWT Authentication**: Secure API access
2. **Role-Based Access**: User vs Verifier permissions
3. **Blockchain Verification**: Immutable record of transactions
4. **IPFS Storage**: Decentralized image storage
5. **Input Validation**: Express-validator on all endpoints
6. **Helmet**: Security headers on all responses

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  walletAddress: String (unique),
  identityHash: String,
  role: String (user/verifier/admin),
  organization: String,
  totalRecycled: Number,
  totalTokensEarned: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### WasteSubmissions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  userWallet: String,
  category: String (Plastic/Paper/Metal/EWaste/Organic),
  weight: Number,
  ipfsHash: String,
  imageUrl: String,
  qrCode: String (base64),
  status: String (pending/verified/rejected),
  verifierId: ObjectId (ref: User),
  verifierWallet: String,
  actualWeight: Number,
  blockchainRecordId: Number,
  rewardAmount: Number,
  rewardClaimed: Boolean,
  verifiedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🌐 API Endpoints Summary

- **POST** `/api/auth/register` - Register user
- **POST** `/api/auth/login` - Login user
- **GET** `/api/user/profile` - Get profile
- **GET** `/api/user/dashboard` - Get dashboard stats
- **GET** `/api/user/history` - Get recycling history
- **GET** `/api/user/token-balance` - Get token balance
- **POST** `/api/waste/submit` - Submit waste
- **GET** `/api/waste/submissions` - Get submissions
- **GET** `/api/verifier/pending` - Get pending verifications
- **POST** `/api/verifier/verify/:id` - Verify submission
- **POST** `/api/verifier/scan-qr` - Scan QR code
- **GET** `/api/verifier/history` - Get verification history

## 🎯 Smart Contract Functions

### IdentityContract
- `registerUser(hash, wallet)` - Register new user
- `registerVerifier(wallet, org)` - Register verifier
- `isUser(address)` - Check if user
- `isVerifier(address)` - Check if verifier

### RecycleRecordContract
- `recordRecycling(user, verifier, category, weight, ipfsHash)` - Record recycling
- `verifyRecycling(recordId)` - Mark as verified
- `getRecord(recordId)` - Get record details
- `getUserRecords(user)` - Get user's records

### CarbonToken
- `mint(to, amount)` - Mint tokens (RewardEngine only)
- `burn(amount)` - Burn tokens
- `balanceOf(address)` - Get balance

### RewardEngine
- `processReward(recordId)` - Calculate and mint reward
- `calculateReward(category, weight)` - Calculate reward amount
- `getRewardRates()` - Get all reward rates

---

**This structure ensures scalability, maintainability, and security! 🚀**
