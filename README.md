# 🌱 Green Karma - Blockchain Recycling Rewards

A blockchain-based platform that rewards users with Carbon Tokens for verified recycling.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MetaMask wallet

### Install
```bash
npm run install:all
```

### Run (4 Terminals)

**Terminal 1 - Blockchain:**
```bash
cd blockchain && npx hardhat node
```

**Terminal 2 - Deploy Contracts** (wait for Terminal 1):
```bash
cd blockchain && npx hardhat run scripts/deploy.js --network localhost
```

**Terminal 3 - Backend:**
```bash
cd backend && npm run dev
```

**Terminal 4 - Frontend:**
```bash
cd frontend && npm run dev
```

### Access
- **App**: http://localhost:3000
- **API**: http://localhost:5000

## 📁 Project Structure
```
├── blockchain/    # Smart contracts (Hardhat + Solidity)
├── backend/       # API server (Express + Firebase)
├── frontend/      # Web app (Next.js + React)
└── docs/          # API & deployment docs
```

## 🎯 Features

**Users:**
- Google Sign-In + MetaMask wallet
- Submit recycling with photos
- Earn Carbon Tokens

**Verifiers:**
- QR code scanning
- Verify submissions
- Trigger blockchain rewards

## 💰 Reward Rates (tokens/kg)
| Waste Type | Tokens |
|------------|--------|
| Plastic    | 5      |
| Paper      | 3      |
| Metal      | 4      |
| E-waste    | 12     |
| Organic    | 1      |

## 🔗 Smart Contracts
- **IdentityContract** - User/Verifier registration
- **RecycleRecordContract** - Recycling records
- **CarbonToken** - ERC-20 rewards
- **RewardEngine** - Automated token distribution

## 📚 Docs
- `docs/API.md` - API reference
- `docs/DEPLOYMENT.md` - Production deployment

## 🔑 Test Account
```
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

---
**Built with 💚 for a sustainable future**
