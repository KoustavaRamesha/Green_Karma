# Certificate Tamper-Proof Verification Guide

## Is the Certificate Really Tamper-Proof?

**Short Answer**: Yes, when stored on the blockchain. No, when stored only in Firestore.

### Two Types of Certificates:

1. **Blockchain Certificates (ERC-721 NFT)**: ✅ **FULLY TAMPER-PROOF**
   - Stored permanently on Ethereum blockchain
   - Immutable - data cannot be changed
   - Cryptographically secured
   - Verifiable by anyone

2. **Firestore Fallback Certificates**: ⚠️ **NOT TAMPER-PROOF**
   - Stored in database (can be modified)
   - Created when blockchain is unavailable
   - Should be migrated to blockchain when possible

## How to Verify if a Certificate is Tamper-Proof

### Method 1: Using the Verification Page

1. Go to the certificate verification page: `/verify/[tokenId]`
2. The page will automatically check the blockchain
3. Look for these indicators:
   - ✅ **Green "Certificate Verified"** = Tamper-Proof (on blockchain)
   - ⚠️ **Yellow "Certificate Found"** = Not yet on blockchain

### Method 2: Verify on Blockchain Explorer

1. Get the certificate Token ID from the certificate
2. Get the contract address: `0x610178dA211FEF7D417bC0e6FeD39F05609AD788` (or check deployments)
3. Visit blockchain explorer (Etherscan for mainnet, Sepolia Etherscan for testnet)
4. Search for the contract address
5. Go to "Read Contract" tab
6. Call `getCertificate(tokenId)` function
7. Verify the data matches the certificate

### Method 3: Using Web3 Tools

```javascript
// Using ethers.js or web3.js
const certificateContract = new ethers.Contract(
  '0x610178dA211FEF7D417bC0e6FeD39F05609AD788', // Contract address
  certificateABI,
  provider
);

const cert = await certificateContract.getCertificate(tokenId);
const owner = await certificateContract.ownerOf(tokenId);

// Verify:
// - cert.recipient matches the wallet address
// - cert.totalWeight matches the weight claimed
// - cert.certificateType matches the tier
// - owner matches the recipient address
```

### Method 4: API Endpoint

```bash
GET /api/verify/certificate/{tokenId}
```

Response includes:
- `tamperProof`: `true` if on blockchain, `false` otherwise
- `verified`: Certificate exists and data is valid
- `blockchainProof`: On-chain verification details

## What Makes It Tamper-Proof?

### Blockchain Properties:

1. **Immutability**: Once written to blockchain, data cannot be changed
2. **Cryptographic Hash**: Each block contains hash of previous block
3. **Distributed Ledger**: Data replicated across thousands of nodes
4. **ERC-721 NFT Standard**: Certificate is a non-fungible token
5. **Smart Contract**: Certificate logic enforced by code, not humans

### Security Features:

- **Contract Address**: Fixed address cannot be changed
- **Token ID**: Unique identifier permanently linked to certificate data
- **Block Number**: Immutable timestamp of when certificate was created
- **Transaction Hash**: Cryptographic proof of certificate creation
- **Owner Verification**: NFT ownership proves authenticity

## Verification Checklist

To verify a certificate is tamper-proof, check:

- [ ] Certificate exists on blockchain (not just in database)
- [ ] Token ID exists and has valid data
- [ ] Recipient address matches certificate owner
- [ ] Weight and category match the claim
- [ ] Certificate type (Bronze/Silver/Gold/Platinum) matches weight
- [ ] Transaction hash points to valid blockchain transaction
- [ ] Block number indicates when certificate was created
- [ ] All data matches between database and blockchain

## Why Some Certificates Aren't Tamper-Proof

If blockchain minting fails (e.g., node unavailable), a fallback certificate is created in Firestore. This ensures:
- Users still see their certificate
- System continues to work
- But certificate is NOT tamper-proof

These certificates should be:
- Clearly marked as "Pending Blockchain Verification"
- Migrated to blockchain when possible
- Not considered as final proof

## Example: Verifying Certificate #123

1. **Check on verification page**: `/verify/123`
2. **See status**: "Certificate Verified ✓ Tamper-Proof"
3. **View blockchain proof**:
   - Contract: `0x610178dA211FEF7D417bC0e6FeD39F05609AD788`
   - Token ID: `123`
   - Owner: `0x...` (recipient wallet)
   - TX Hash: `0x...`
   - Block: `12345678`
4. **Verify on Etherscan**: Contract → Read Contract → `getCertificate(123)`
5. **Compare data**: All fields match = ✅ Tamper-Proof

## Technical Details

### Smart Contract Function

```solidity
function getCertificate(uint256 tokenId) external view returns (Certificate memory) {
    require(tokenId < _tokenIdCounter, "Certificate does not exist");
    return certificates[tokenId];
}
```

### Certificate Structure (On-Chain)

```solidity
struct Certificate {
    uint256 tokenId;
    address recipient;        // Cannot be changed
    string recipientName;
    uint256 totalWeight;      // Cannot be changed
    string category;          // Cannot be changed
    uint256 issuedAt;         // Timestamp (immutable)
    string certificateType;   // BRONZE/SILVER/GOLD/PLATINUM
    string ipfsMetadataHash;
}
```

All data is stored permanently on-chain and cannot be modified after minting.

## Conclusion

**Certificates stored on blockchain ARE tamper-proof**. They cannot be:
- Altered
- Forged
- Deleted
- Falsified

**Certificates stored only in Firestore are NOT tamper-proof**. They can be:
- Modified by database admins
- Deleted
- Changed

**Always verify certificates on the blockchain** to ensure they are tamper-proof!

