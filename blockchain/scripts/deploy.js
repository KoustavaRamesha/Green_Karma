const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🌱 Starting Green Karma Smart Contract Deployment...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
    console.log();

    // 1. Deploy IdentityContract
    console.log("📝 Deploying IdentityContract...");
    const IdentityContract = await hre.ethers.getContractFactory("IdentityContract");
    const identityContract = await IdentityContract.deploy();
    await identityContract.waitForDeployment();
    const identityAddress = await identityContract.getAddress();
    console.log("✅ IdentityContract deployed to:", identityAddress);
    console.log();

    // 2. Deploy RecycleRecordContract
    console.log("📝 Deploying RecycleRecordContract...");
    const RecycleRecordContract = await hre.ethers.getContractFactory("RecycleRecordContract");
    const recycleRecordContract = await RecycleRecordContract.deploy(identityAddress);
    await recycleRecordContract.waitForDeployment();
    const recycleRecordAddress = await recycleRecordContract.getAddress();
    console.log("✅ RecycleRecordContract deployed to:", recycleRecordAddress);
    console.log();

    // 3. Deploy CarbonToken
    console.log("📝 Deploying CarbonToken...");
    const CarbonToken = await hre.ethers.getContractFactory("CarbonToken");
    const carbonToken = await CarbonToken.deploy("Carbon Token", "CARB");
    await carbonToken.waitForDeployment();
    const carbonTokenAddress = await carbonToken.getAddress();
    console.log("✅ CarbonToken deployed to:", carbonTokenAddress);
    console.log();

    // 4. Deploy RewardEngine
    console.log("📝 Deploying RewardEngine...");
    const RewardEngine = await hre.ethers.getContractFactory("RewardEngine");
    const rewardEngine = await RewardEngine.deploy(
        carbonTokenAddress,
        recycleRecordAddress,
        identityAddress
    );
    await rewardEngine.waitForDeployment();
    const rewardEngineAddress = await rewardEngine.getAddress();
    console.log("✅ RewardEngine deployed to:", rewardEngineAddress);
    console.log();

    // 5. Set RewardEngine in CarbonToken
    console.log("🔗 Connecting RewardEngine to CarbonToken...");
    const tx = await carbonToken.setRewardEngine(rewardEngineAddress);
    await tx.wait();
    console.log("✅ RewardEngine connected to CarbonToken");
    console.log();

    // 6. Save deployment addresses
    const deploymentInfo = {
        network: hre.network.name,
        chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            IdentityContract: identityAddress,
            RecycleRecordContract: recycleRecordAddress,
            CarbonToken: carbonTokenAddress,
            RewardEngine: rewardEngineAddress
        }
    };

    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentPath = path.join(deploymentsDir, "contracts.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info saved to:", deploymentPath);
    console.log();

    // 7. Display summary
    console.log("🎉 Deployment Complete!\n");
    console.log("═══════════════════════════════════════════════════════");
    console.log("Contract Addresses:");
    console.log("═══════════════════════════════════════════════════════");
    console.log("IdentityContract:       ", identityAddress);
    console.log("RecycleRecordContract:  ", recycleRecordAddress);
    console.log("CarbonToken:            ", carbonTokenAddress);
    console.log("RewardEngine:           ", rewardEngineAddress);
    console.log("═══════════════════════════════════════════════════════");
    console.log("\n✨ All contracts deployed and configured successfully!");
    console.log("\n📋 Next steps:");
    console.log("1. Update backend .env with contract addresses");
    console.log("2. Update frontend .env with contract addresses");
    console.log("3. Start the backend server");
    console.log("4. Start the frontend application");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
