# 📡 Green Karma API Documentation

Base URL: `http://localhost:5000/api`

All endpoints except authentication require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## 🔐 Authentication

### Register User

**POST** `/auth/register`

Register a new user or verifier.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "role": "user",
  "organization": "Government Agency"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "name": "John Doe",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "role": "user"
  }
}
```

### Login

**POST** `/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "name": "John Doe",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "role": "user",
    "totalTokensEarned": 150.5
  }
}
```

## 👤 User Endpoints

### Get Profile

**GET** `/user/profile`

Get current user's profile.

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "name": "John Doe",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "role": "user",
    "totalRecycled": 45.5,
    "totalTokensEarned": 150.5,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Dashboard Stats

**GET** `/user/dashboard`

Get dashboard statistics for the current user.

**Response:**
```json
{
  "stats": {
    "totalTokens": 150.5,
    "totalRecycled": 45.5,
    "totalSubmissions": 15,
    "verifiedSubmissions": 12,
    "pendingSubmissions": 3,
    "categoryBreakdown": {
      "Plastic": 20.5,
      "Paper": 15.0,
      "Metal": 5.0,
      "EWaste": 3.0,
      "Organic": 2.0
    },
    "recentActivity": [
      {
        "id": "507f1f77bcf86cd799439012",
        "category": "Plastic",
        "weight": 2.5,
        "status": "verified",
        "reward": 12.5,
        "date": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### Get Recycling History

**GET** `/user/history`

Get user's complete recycling history.

**Response:**
```json
{
  "history": [
    {
      "id": "507f1f77bcf86cd799439012",
      "category": "Plastic",
      "weight": 2.5,
      "actualWeight": 2.3,
      "status": "verified",
      "rewardAmount": 11.5,
      "imageUrl": "https://gateway.pinata.cloud/ipfs/Qm...",
      "verifier": {
        "name": "Jane Verifier",
        "organization": "City Council"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "verifiedAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "stats": {
    "totalSubmissions": 15,
    "verified": 12,
    "pending": 3,
    "rejected": 0,
    "totalWeight": 45.5,
    "totalRewards": 150.5
  }
}
```

### Get Token Balance

**GET** `/user/token-balance`

Get user's Carbon Token balance from blockchain.

**Response:**
```json
{
  "balance": 150.5,
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

### Redeem Rewards

**POST** `/user/redeem`

Redeem Carbon Tokens for rewards (placeholder).

**Request Body:**
```json
{
  "amount": 100,
  "rewardType": "voucher"
}
```

**Response:**
```json
{
  "message": "Redemption feature coming soon",
  "amount": 100,
  "rewardType": "voucher"
}
```

## ♻️ Waste Submission Endpoints

### Submit Waste

**POST** `/waste/submit`

Submit recycling waste for verification.

**Content-Type:** `multipart/form-data`

**Request Body:**
- `category` (string): Waste category (Plastic, Paper, Metal, EWaste, Organic)
- `weight` (number): Weight in kilograms
- `image` (file): Photo of waste (optional)

**Response:**
```json
{
  "message": "Waste submission created successfully",
  "submission": {
    "id": "507f1f77bcf86cd799439012",
    "category": "Plastic",
    "weight": 2.5,
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "status": "pending",
    "ipfsHash": "QmX7M8RVK...",
    "imageUrl": "https://gateway.pinata.cloud/ipfs/QmX7M8RVK..."
  }
}
```

### Get User Submissions

**GET** `/waste/submissions`

Get all submissions by the current user.

**Response:**
```json
{
  "submissions": [
    {
      "id": "507f1f77bcf86cd799439012",
      "category": "Plastic",
      "weight": 2.5,
      "status": "verified",
      "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "imageUrl": "https://gateway.pinata.cloud/ipfs/QmX7M8RVK...",
      "rewardAmount": 12.5,
      "rewardClaimed": true,
      "verifier": {
        "name": "Jane Verifier",
        "organization": "City Council"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "verifiedAt": "2024-01-15T11:00:00.000Z"
    }
  ]
}
```

### Get Submission by ID

**GET** `/waste/submission/:id`

Get details of a specific submission.

**Response:**
```json
{
  "submission": {
    "id": "507f1f77bcf86cd799439012",
    "userId": {
      "name": "John Doe",
      "email": "john@example.com",
      "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
    },
    "category": "Plastic",
    "weight": 2.5,
    "actualWeight": 2.3,
    "status": "verified",
    "imageUrl": "https://gateway.pinata.cloud/ipfs/QmX7M8RVK...",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "blockchainRecordId": 42,
    "rewardAmount": 11.5,
    "verifierId": {
      "name": "Jane Verifier",
      "organization": "City Council"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "verifiedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

## ✅ Verifier Endpoints

### Get Pending Verifications

**GET** `/verifier/pending`

Get all pending waste submissions (verifier only).

**Response:**
```json
{
  "submissions": [
    {
      "id": "507f1f77bcf86cd799439012",
      "user": {
        "name": "John Doe",
        "email": "john@example.com",
        "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
      },
      "category": "Plastic",
      "weight": 2.5,
      "imageUrl": "https://gateway.pinata.cloud/ipfs/QmX7M8RVK...",
      "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Verify Submission

**POST** `/verifier/verify/:submissionId`

Verify or reject a waste submission (verifier only).

**Request Body:**
```json
{
  "approved": true,
  "actualWeight": 2.3
}
```

**Response:**
```json
{
  "message": "Submission verified successfully",
  "submission": {
    "id": "507f1f77bcf86cd799439012",
    "status": "verified",
    "actualWeight": 2.3,
    "blockchainRecordId": 42,
    "rewardAmount": 11.5
  }
}
```

### Scan QR Code

**POST** `/verifier/scan-qr`

Scan and decode a QR code from a submission (verifier only).

**Request Body:**
```json
{
  "qrData": "{\"submissionId\":\"507f1f77bcf86cd799439012\",\"userId\":\"507f1f77bcf86cd799439011\",\"category\":\"Plastic\",\"weight\":2.5,\"timestamp\":1705315800000}"
}
```

**Response:**
```json
{
  "submission": {
    "id": "507f1f77bcf86cd799439012",
    "user": {
      "name": "John Doe",
      "email": "john@example.com",
      "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
    },
    "category": "Plastic",
    "weight": 2.5,
    "imageUrl": "https://gateway.pinata.cloud/ipfs/QmX7M8RVK...",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Verification History

**GET** `/verifier/history`

Get verifier's verification history (verifier only).

**Response:**
```json
{
  "verifications": [
    {
      "id": "507f1f77bcf86cd799439012",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "category": "Plastic",
      "weight": 2.5,
      "actualWeight": 2.3,
      "status": "verified",
      "rewardAmount": 11.5,
      "verifiedAt": "2024-01-15T11:00:00.000Z"
    }
  ]
}
```

## 🔄 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🛡️ Error Response Format

```json
{
  "error": "Error message description"
}
```

## 📝 Notes

- All timestamps are in ISO 8601 format
- Weights are in kilograms
- Token amounts are in CARB (Carbon Tokens)
- QR codes are base64-encoded PNG images
- IPFS hashes use Pinata gateway

---

**For more information, see the main README.md**
