// Contract ABIs and Addresses for Green Karma Blockchain Integration
// This file provides direct blockchain interaction capabilities

export const CHAIN_ID = 1337; // Hardhat local chain

// Contract Addresses (loaded from deployment or environment)
export const CONTRACT_ADDRESSES = {
    IdentityContract: process.env.NEXT_PUBLIC_IDENTITY_CONTRACT || '0x0165878A594ca255338adfa4d48449f69242Eb8F',
    RecycleRecordContract: process.env.NEXT_PUBLIC_RECYCLE_CONTRACT || '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
    CarbonToken: process.env.NEXT_PUBLIC_TOKEN_CONTRACT || '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
    RewardEngine: process.env.NEXT_PUBLIC_REWARD_CONTRACT || '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
    GreenCertificate: process.env.NEXT_PUBLIC_CERTIFICATE_CONTRACT || '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
};

// ABI fragments for the contracts (only the functions we use)
export const IDENTITY_ABI = [
    "function registerUser(bytes32 identityHash, address walletAddress) external",
    "function registerVerifier(address walletAddress, string memory organization) external",
    "function isUser(address userAddress) external view returns (bool)",
    "function isVerifier(address verifierAddress) external view returns (bool)",
    "function getUser(address userAddress) external view returns (tuple(bytes32 identityHash, address walletAddress, bool isRegistered, uint256 registeredAt))",
    "function getVerifier(address verifierAddress) external view returns (tuple(address walletAddress, string organization, bool isActive, uint256 registeredAt))",
    "function getUserCount() external view returns (uint256)",
    "function getVerifierCount() external view returns (uint256)",
    "event UserRegistered(address indexed userAddress, bytes32 identityHash, uint256 timestamp)",
    "event VerifierRegistered(address indexed verifierAddress, string organization, uint256 timestamp)",
];

export const RECYCLE_RECORD_ABI = [
    "function recordRecycling(address user, address verifier, uint8 category, uint256 weight, string memory ipfsHash) external returns (uint256)",
    "function verifyRecycling(uint256 recordId) external",
    "function getRecord(uint256 recordId) external view returns (tuple(uint256 recordId, address user, address verifier, uint8 category, uint256 weight, string ipfsHash, uint256 timestamp, bool verified))",
    "function getUserRecords(address user) external view returns (uint256[] memory)",
    "function getVerifierRecords(address verifier) external view returns (uint256[] memory)",
    "function getTotalRecords() external view returns (uint256)",
    "event RecyclingRecorded(uint256 indexed recordId, address indexed user, address indexed verifier, uint8 category, uint256 weight, string ipfsHash, uint256 timestamp)",
    "event RecyclingVerified(uint256 indexed recordId, address indexed verifier, uint256 timestamp)",
];

export const CARBON_TOKEN_ABI = [
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "function decimals() external view returns (uint8)",
    "function totalSupply() external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
    "function burn(uint256 amount) external",
    "function balanceOfWithDecimals(address account) external view returns (uint256)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event TokensMinted(address indexed to, uint256 amount)",
    "event TokensBurned(address indexed from, uint256 amount)",
];

export const REWARD_ENGINE_ABI = [
    "function calculateReward(uint8 category, uint256 weightInGrams) external pure returns (uint256)",
    "function processReward(uint256 recordId) external",
    "function getRewardAmount(uint256 recordId) external view returns (uint256)",
    "function isRewardClaimed(uint256 recordId) external view returns (bool)",
    "function getUserTotalRewards(address user) external view returns (uint256)",
    "function getRewardRates() external pure returns (uint256 plastic, uint256 paper, uint256 metal, uint256 ewaste, uint256 organic)",
    "function PLASTIC_RATE() external view returns (uint256)",
    "function PAPER_RATE() external view returns (uint256)",
    "function METAL_RATE() external view returns (uint256)",
    "function EWASTE_RATE() external view returns (uint256)",
    "function ORGANIC_RATE() external view returns (uint256)",
    "event RewardCalculated(uint256 indexed recordId, address indexed user, uint256 rewardAmount)",
    "event RewardMinted(uint256 indexed recordId, address indexed user, uint256 amount)",
];

export const GREEN_CERTIFICATE_ABI = [
    "function mintCertificate(address to, string memory recipientName, uint256 totalWeight, string memory category, string memory metadataURI) external returns (uint256)",
    "function getCertificate(uint256 tokenId) external view returns (tuple(uint256 tokenId, address recipient, string recipientName, uint256 totalWeight, string category, uint256 issuedAt, string certificateType, string ipfsMetadataHash))",
    "function getUserCertificates(address user) external view returns (uint256[] memory)",
    "function getTotalCertificates() external view returns (uint256)",
    "function checkCertificateEligibility(uint256 totalWeight) external pure returns (bool eligible, string memory certificateType)",
    "function BRONZE_THRESHOLD() external view returns (uint256)",
    "function SILVER_THRESHOLD() external view returns (uint256)",
    "function GOLD_THRESHOLD() external view returns (uint256)",
    "function PLATINUM_THRESHOLD() external view returns (uint256)",
    "function ownerOf(uint256 tokenId) external view returns (address)",
    "function tokenURI(uint256 tokenId) external view returns (string memory)",
    "event CertificateMinted(uint256 indexed tokenId, address indexed recipient, string recipientName, uint256 totalWeight, string certificateType, uint256 issuedAt)",
];

// Waste category mapping
export const WASTE_CATEGORIES = {
    Plastic: 0,
    Paper: 1,
    Metal: 2,
    EWaste: 3,
    Organic: 4,
};

export const CATEGORY_NAMES = ['Plastic', 'Paper', 'Metal', 'E-waste', 'Organic'];

// Reward rates in tokens per kg
export const REWARD_RATES = {
    Plastic: 5,
    Paper: 3,
    Metal: 4,
    EWaste: 12,
    Organic: 1,
};

// Certificate thresholds in kg
export const CERTIFICATE_THRESHOLDS = {
    BRONZE: 40,
    SILVER: 100,
    GOLD: 500,
    PLATINUM: 1000,
};
