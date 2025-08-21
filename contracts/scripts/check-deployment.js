// contracts/scripts/check-deployment.js
const fs = require('fs');
const path = require('path');

function main() {
    console.log("🔍 Checking deployment status...");
    
    const deploymentPath = path.join(__dirname, '../deployments/OmniPassCredential.json');
    if (!fs.existsSync(deploymentPath)) {
        console.log("❌ No deployment found. Run 'npm run deploy' first.");
        return;
    }
    
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    
    console.log("✅ Contract deployed:");
    console.log("📍 Address:", deployment.address);
    console.log("🌐 Network:", deployment.network);
    console.log("⏰ Deployed at:", deployment.deployedAt);
    console.log("👤 Deployer:", deployment.deployer);
    console.log("🔗 Chain ID:", deployment.chainId);
    
    // Check if config files exist
    const backendConfigPath = path.join(__dirname, '../../backend/src/config/contracts.ts');
    const frontendConfigPath = path.join(__dirname, '../../frontend/src/lib/contracts.ts');
    
    console.log("\n🔧 Configuration files:");
    console.log("🔧 Backend config:", fs.existsSync(backendConfigPath) ? "✅ Updated" : "❌ Missing");
    console.log("🎨 Frontend config:", fs.existsSync(frontendConfigPath) ? "✅ Updated" : "❌ Missing");
    
    // Network-specific explorer links
    console.log("\n🔗 Explorer Links:");
    if (deployment.chainId === 7001) {
        console.log(`🔍 ZetaChain Testnet: https://athens3.explorer.zetachain.com/address/${deployment.address}`);
    }
    
    console.log("\n💰 Get Testnet Tokens:");
    console.log("🔸 ZetaChain: https://labs.zetachain.com/get-zeta");
    console.log("🔸 Sepolia ETH: https://sepoliafaucet.com/");
    console.log("🔸 Amoy MATIC: https://faucet.polygon.technology/");
}

main();
