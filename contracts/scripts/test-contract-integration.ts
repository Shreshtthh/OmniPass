// contracts/scripts/test-contract-integration.ts
import "@nomicfoundation/hardhat-ethers";
import hre from "hardhat";
import fs from 'fs';
import path from 'path';

async function main() {
    console.log("🧪 Testing testnet contract integration...");
    
    // Load deployment info
    const deploymentPath = path.join(__dirname, '../deployments/OmniPassCredential.json');
    if (!fs.existsSync(deploymentPath)) {
        throw new Error("❌ Contract not deployed yet. Run 'npm run deploy' first.");
    }
    
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    const contract = await hre.ethers.getContractAt("OmniPassCredential", deployment.address);
    
    console.log("📋 Contract Address:", deployment.address);
    console.log("🌐 Network:", deployment.network);
    console.log("🔗 Chain ID:", deployment.chainId);
    
    // Verify we're on testnet
    const network = await hre.ethers.provider.getNetwork();
    if (network.chainId !== 7001n) {
        console.error("❌ Wrong network! Expected ZetaChain testnet (7001)");
        return;
    }
    
    // Test 1: Check contract is accessible
    try {
        const activeChains = await contract.getActiveChains();
        console.log("✅ Contract is accessible");
        console.log("📊 Active chains:", activeChains.map(c => c.toString()));
        
        // Verify testnet chain IDs are configured
        const expectedChains = ["11155111", "7001", "80002"]; // Sepolia, ZetaChain, Amoy
        const actualChains = activeChains.map(c => c.toString());
        
        for (const expected of expectedChains) {
            if (actualChains.includes(expected)) {
                console.log(`✅ Chain ${expected} configured`);
            } else {
                console.log(`⚠️ Chain ${expected} missing`);
            }
        }
    } catch (error) {
        console.error("❌ Contract access failed:", error);
        return;
    }
    
    // Test 2: Check analyzer authorization
    if (process.env.ANALYZER_PRIVATE_KEY) {
        const analyzerWallet = new hre.ethers.Wallet(process.env.ANALYZER_PRIVATE_KEY);
        const isAuthorized = await contract.authorizedAnalyzers(analyzerWallet.address);
        if (isAuthorized) {
            console.log("✅ Analyzer is properly authorized");
        } else {
            console.log("⚠️ Analyzer not authorized. Run 'npm run authorize-analyzer'");
        }
    }
    
    // Test 3: Test tier requirements (testnet values)
    try {
        const bronzeReq = await contract.tierRequirements(1); // BRONZE = 1
        const silverReq = await contract.tierRequirements(2); // SILVER = 2
        const goldReq = await contract.tierRequirements(3);   // GOLD = 3
        const platinumReq = await contract.tierRequirements(4); // PLATINUM = 4
        
        console.log("✅ Tier requirements accessible");
        console.log("🥉 Bronze TVL requirement:", hre.ethers.formatEther(bronzeReq.minTVL), "ETH");
        console.log("🥈 Silver TVL requirement:", hre.ethers.formatEther(silverReq.minTVL), "ETH");
        console.log("🥇 Gold TVL requirement:", hre.ethers.formatEther(goldReq.minTVL), "ETH");
        console.log("💎 Platinum TVL requirement:", hre.ethers.formatEther(platinumReq.minTVL), "ETH");
        
        // Verify testnet-appropriate values
        const bronzeTVL = Number(hre.ethers.formatEther(bronzeReq.minTVL));
        if (bronzeTVL <= 1.0) {
            console.log("✅ Testnet TVL requirements are appropriate");
        } else {
            console.log("⚠️ TVL requirements might be too high for testnet");
        }
    } catch (error) {
        console.error("❌ Tier requirements check failed:", error);
    }
    
    // Test 4: Test tier eligibility calculation
    try {
        const testTier = await contract.checkTierEligibility(
            hre.ethers.parseEther("0.5"), // 0.5 ETH
            60, // Risk score
            50, // Activity score
            2   // 2 chains
        );
        console.log("✅ Tier eligibility calculation works");
        console.log("🎯 Test eligibility result:", testTier.toString());
    } catch (error) {
        console.error("❌ Tier eligibility test failed:", error);
    }
    
    console.log("\n🎉 Testnet contract integration test completed!");
    console.log("💡 Remember to get testnet tokens from faucets before testing transactions");
}

main().catch((error) => {
    console.error("❌ Integration test failed:", error);
    process.exitCode = 1;
});
