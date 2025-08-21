// contracts/scripts/authorize-analyzer.ts
import { ethers } from "hardhat";
import fs from 'fs';
import path from 'path';

async function main() {
    console.log("🔍 Authorizing analyzer wallet...");
    
    // Load deployment info
    const deploymentPath = path.join(__dirname, '../deployments/OmniPassCredential.json');
    if (!fs.existsSync(deploymentPath)) {
        throw new Error("❌ Contract not deployed yet. Run 'npm run deploy' first.");
    }
    
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    
    // Get contract instance
    const contract = await ethers.getContractAt("OmniPassCredential", deployment.address);
    
    // Get analyzer address from environment
    if (!process.env.ANALYZER_PRIVATE_KEY) {
        throw new Error("❌ ANALYZER_PRIVATE_KEY not found in environment");
    }
    
    const analyzerWallet = new ethers.Wallet(process.env.ANALYZER_PRIVATE_KEY);
    console.log("🤖 Analyzer address:", analyzerWallet.address);
    
    // Check if already authorized
    const isAuthorized = await contract.authorizedAnalyzers(analyzerWallet.address);
    if (isAuthorized) {
        console.log("✅ Analyzer is already authorized");
        return;
    }
    
    // Authorize the analyzer
    const tx = await contract.setAnalyzerAuthorization(analyzerWallet.address, true);
    console.log("⏳ Authorization transaction:", tx.hash);
    await tx.wait();
    
    console.log("✅ Analyzer authorized successfully!");
}

main().catch((error) => {
    console.error("❌ Authorization failed:", error);
    process.exitCode = 1;
});
