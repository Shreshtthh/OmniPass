// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@zetachain/protocol-contracts/contracts/zevm/SystemContract.sol";
import "@zetachain/protocol-contracts/contracts/zevm/interfaces/zContract.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IOmniPassCredential.sol";

/**
 * @title OmniPassCredential
 * @dev Universal Contract for cross-chain DeFi reputation and access control
 * @notice This contract stores and manages user credentials based on cross-chain activity
 * @notice Configured for ZetaChain testnet, Sepolia, and Amoy testnet
 */
contract OmniPassCredential is IOmniPassCredential, zContract, Ownable, ReentrancyGuard {
   
    // State variables
    SystemContract public systemContract;
    
    // Credential storage
    mapping(address => Credential) public credentials;
    mapping(address => uint256) public credentialExpiry;
    mapping(bytes32 => bool) public usedNonces;
    
    // Access control
    mapping(address => bool) public authorizedAnalyzers;
    mapping(uint256 => ChainConfig) public supportedChains;
    uint256[] public activeChains;
    
    // Tier requirements (adjusted for testnet)
    mapping(AccessTier => TierRequirements) public tierRequirements;
    
    // Additional events (not in interface)
    event AnalyzerAuthorized(address indexed analyzer, bool authorized);
    event ChainConfigUpdated(uint256 chainId, bool supported);
    
    // Modifiers
    modifier onlyAuthorizedAnalyzer() {
        require(authorizedAnalyzers[msg.sender], "Not authorized analyzer");
        _;
    }
    
    modifier validCredential(address user) {
        require(credentials[user].isValid, "Invalid credential");
        require(block.timestamp < credentialExpiry[user], "Credential expired");
        _;
    }
    
    constructor(address _systemContract) {
        systemContract = SystemContract(_systemContract);
        
        // Initialize tier requirements for testnet
        _initializeTierRequirements();
        
        // Initialize supported testnet chains
        _initializeSupportedChains();
    }
    
    /**
     * @dev ZetaChain Universal Contract entry point
     * @param context Cross-chain message context
     * @param zrc20 ZRC20 token address
     * @param amount Token amount
     * @param message Encoded credential data
     */
    function onCrossChainCall(
        zContext calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external override {
        // Decode the message to determine action
        (uint8 action, bytes memory data) = abi.decode(message, (uint8, bytes));
        
        if (action == 1) {
            // Issue credential
            _handleCredentialIssuance(context, data);
        } else if (action == 2) {
            // Verify credential
            _handleCredentialVerification(context, data);
        } else if (action == 3) {
            // Update credential
            _handleCredentialUpdate(context, data);
        } else {
            revert("Invalid action");
        }
    }
    
    /**
     * @dev Issue a new credential based on cross-chain analysis (Fixed for stack too deep)
     */
    
    function issueCredential(
        address user,
        CrossChainData[] calldata crossChainData,
        bytes32 aiInsights,
        bytes calldata signature
    ) external override onlyAuthorizedAnalyzer nonReentrant {
        require(user != address(0), "Invalid user address");
        require(crossChainData.length > 0, "No chain data provided");
        
        // Verify signature and nonce (fixed)
        bytes32 nonce = keccak256(abi.encodePacked(user, block.timestamp));
        require(!usedNonces[nonce], "Nonce already used");
        usedNonces[nonce] = true;
        
        // Move the credential creation to a separate function
        _createAndStoreCredential(user, crossChainData, aiInsights);
    }
    
    /**
     * @dev New internal function to handle credential creation
     */
    function _createAndStoreCredential(
        address user,
        CrossChainData[] calldata crossChainData,
        bytes32 aiInsights
    ) internal {
        // Calculate aggregated scores
        (uint256 totalTVL, uint256 avgRiskScore, uint256 activityScore, uint256 diversificationScore) = 
            _calculateAggregatedScores(crossChainData);
        
        // Determine access tier
        AccessTier tier = _determineAccessTier(
            totalTVL,
            avgRiskScore,
            activityScore,
            crossChainData.length
        );
        
        // Create and store credential
        _storeCredential(user, tier, totalTVL, avgRiskScore, activityScore, diversificationScore, crossChainData, aiInsights);
    }
    
    /**
     * @dev Helper function for credential storage
     */
    function _storeCredential(
        address user,
        AccessTier tier,
        uint256 totalTVL,
        uint256 avgRiskScore,
        uint256 activityScore,
        uint256 diversificationScore,
        CrossChainData[] calldata crossChainData,
        bytes32 aiInsights
    ) internal {
        // Create chain data hashes
        bytes32[] memory chainHashes = new bytes32[](crossChainData.length);
        for (uint256 i = 0; i < crossChainData.length; i++) {
            chainHashes[i] = crossChainData[i].dataHash;
        }
        
        // Store credential
        uint256 expiryTime = block.timestamp + 30 days;
        credentials[user] = Credential({
            user: user,
            tier: tier,
            totalValueLocked: totalTVL,
            riskScore: avgRiskScore,
            activityScore: activityScore,
            diversificationScore: diversificationScore,
            chainDataHashes: chainHashes,
            aiInsightsHash: abi.encodePacked(aiInsights),
            issuedAt: block.timestamp,
            expiresAt: expiryTime,
            isValid: true
        });
        
        credentialExpiry[user] = expiryTime;
        emit CredentialIssued(user, tier, totalTVL, avgRiskScore, expiryTime);
    }
    
    /**
     * @dev Helper for memory-based cross-chain data
     */
    function _storeCredentialFromMemory(
        address user,
        AccessTier tier,
        uint256 totalTVL,
        uint256 avgRiskScore,
        uint256 activityScore,
        uint256 diversificationScore,
        CrossChainData[] memory crossChainData,
        bytes32 aiInsights
    ) internal {
        bytes32[] memory chainHashes = new bytes32[](crossChainData.length);
        for (uint256 i = 0; i < crossChainData.length; i++) {
            chainHashes[i] = crossChainData[i].dataHash;
        }
        
        uint256 expiryTime = block.timestamp + 30 days;
        credentials[user] = Credential({
            user: user,
            tier: tier,
            totalValueLocked: totalTVL,
            riskScore: avgRiskScore,
            activityScore: activityScore,
            diversificationScore: diversificationScore,
            chainDataHashes: chainHashes,
            aiInsightsHash: abi.encodePacked(aiInsights),
            issuedAt: block.timestamp,
            expiresAt: expiryTime,
            isValid: true
        });
        
        credentialExpiry[user] = expiryTime;
        emit CredentialIssued(user, tier, totalTVL, avgRiskScore, expiryTime);
    }
    
    /**
     * @dev Verify if a user has valid credentials for a specific tier
     * @param user User address
     * @param requiredTier Minimum required access tier
     * @return isValid Whether the credential is valid
     * @return userTier User's current tier
     */
    function verifyCredential(address user, AccessTier requiredTier) 
        external 
        view 
        override
        returns (bool isValid, AccessTier userTier) 
    {
        Credential memory cred = credentials[user];
        
        if (!cred.isValid || block.timestamp >= credentialExpiry[user]) {
            return (false, AccessTier.NONE);
        }
        
        bool hasAccess = uint8(cred.tier) >= uint8(requiredTier);
        return (hasAccess, cred.tier);
    }
    
    /**
     * @dev Get detailed credential information
     * @param user User address
     * @return credential Full credential struct
     */
    function getCredential(address user) 
        external 
        view 
        override
        returns (Credential memory credential) 
    {
        return credentials[user];
    }
    
    /**
     * @dev Check if credential qualifies for specific tier
     * @param tvl Total value locked
     * @param riskScore Risk assessment score
     * @param activityScore Activity level score
     * @param chainCount Number of active chains
     * @return tier Qualified access tier
     */
    function checkTierEligibility(
        uint256 tvl,
        uint256 riskScore,
        uint256 activityScore,
        uint256 chainCount
    ) external view override returns (AccessTier tier) {
        return _determineAccessTier(tvl, riskScore, activityScore, chainCount);
    }
    
    /**
     * @dev Revoke a user's credential
     * @param user User address
     * @param reason Reason for revocation
     */
    function revokeCredential(address user, string calldata reason) 
        external 
        override
        onlyOwner 
    {
        require(credentials[user].isValid, "Credential not found");
        
        credentials[user].isValid = false;
        credentialExpiry[user] = block.timestamp;
        
        emit CredentialRevoked(user, reason);
    }
    
    /**
     * @dev Authorize/deauthorize analyzer addresses
     * @param analyzer Analyzer address
     * @param authorized Whether to authorize or deauthorize
     */
    function setAnalyzerAuthorization(address analyzer, bool authorized) 
        external 
        onlyOwner 
    {
        authorizedAnalyzers[analyzer] = authorized;
        emit AnalyzerAuthorized(analyzer, authorized);
    }
    
    /**
     * @dev Update tier requirements
     * @param tier Access tier
     * @param requirements New requirements
     */
    function updateTierRequirements(AccessTier tier, TierRequirements calldata requirements)
        external
        onlyOwner
    {
        tierRequirements[tier] = requirements;
    }
    
    /**
     * @dev Update supported chain configuration
     * @param chainId Chain ID
     * @param config Chain configuration
     */
    function updateChainConfig(uint256 chainId, ChainConfig calldata config)
        external
        onlyOwner
    {
        supportedChains[chainId] = config;
        
        // Update active chains list
        if (config.supported) {
            bool exists = false;
            for (uint256 i = 0; i < activeChains.length; i++) {
                if (activeChains[i] == chainId) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                activeChains.push(chainId);
            }
        } else {
            // Remove from active chains
            for (uint256 i = 0; i < activeChains.length; i++) {
                if (activeChains[i] == chainId) {
                    activeChains[i] = activeChains[activeChains.length - 1];
                    activeChains.pop();
                    break;
                }
            }
        }
        
        emit ChainConfigUpdated(chainId, config.supported);
    }
    
    /**
     * @dev Get list of active chain IDs
     * @return Array of supported chain IDs
     */
    function getActiveChains() external view override returns (uint256[] memory) {
        return activeChains;
    }
    
    // Internal functions
    function _handleCredentialIssuance(zContext calldata context, bytes memory data) internal {
        // Decode cross-chain credential issuance request
        (address user, CrossChainData[] memory crossChainData, bytes32 aiInsights) = 
            abi.decode(data, (address, CrossChainData[], bytes32));
        
        // Issue credential (simplified for cross-chain call)
        // In production, would include additional validation
        _issueCrossChainCredential(user, crossChainData, aiInsights);
    }
    
    function _handleCredentialVerification(zContext calldata context, bytes memory data) internal {
        (address user, AccessTier requiredTier) = abi.decode(data, (address, AccessTier));
        
        (bool isValid, AccessTier userTier) = this.verifyCredential(user, requiredTier);
        
        // Return result to origin chain (implementation depends on ZetaChain specifics)
        // This would typically emit an event or call back to origin contract
    }
    
    function _handleCredentialUpdate(zContext calldata context, bytes memory data) internal {
        // Handle credential updates from cross-chain calls
        // Implementation would depend on specific update requirements
    }
    
    /**
     * @dev Fixed _issueCrossChainCredential function to use new helper
     */
    function _issueCrossChainCredential(
        address user,
        CrossChainData[] memory crossChainData,
        bytes32 aiInsights
    ) internal {
        // Calculate aggregated scores
        (uint256 totalTVL, uint256 avgRiskScore, uint256 activityScore, uint256 diversificationScore) = 
            _calculateAggregatedScores(crossChainData);
        
        AccessTier tier = _determineAccessTier(
            totalTVL,
            avgRiskScore,
            activityScore,
            crossChainData.length
        );
        
        // Use the same storage helper
        _storeCredentialFromMemory(user, tier, totalTVL, avgRiskScore, activityScore, diversificationScore, crossChainData, aiInsights);
    }
    
    function _calculateAggregatedScores(CrossChainData[] memory crossChainData)
        internal
        view
        returns (uint256 totalTVL, uint256 avgRiskScore, uint256 activityScore, uint256 diversificationScore)
    {
        uint256 weightedTVL = 0;
        uint256 totalWeight = 0;
        uint256 totalPositions = 0;
        
        for (uint256 i = 0; i < crossChainData.length; i++) {
            CrossChainData memory data = crossChainData[i];
            ChainConfig memory config = supportedChains[data.chainId];
            
            if (config.supported) {
                uint256 weight = config.weight > 0 ? config.weight : 100; // Default weight
                weightedTVL += data.tvl * weight;
                totalWeight += weight;
                totalPositions += data.positions;
            }
        }
        
        totalTVL = totalWeight > 0 ? weightedTVL / totalWeight : 0;
        
        // Risk score based on TVL and diversification
        avgRiskScore = _calculateRiskScore(totalTVL, crossChainData.length);
        
        // Activity score based on number of positions
        activityScore = _calculateActivityScore(totalPositions, crossChainData.length);
        
        // Diversification score based on chain count and TVL distribution
        diversificationScore = _calculateDiversificationScore(crossChainData);
    }
    
    function _calculateRiskScore(uint256 tvl, uint256 chainCount) internal pure returns (uint256) {
        uint256 baseScore = 50;
        
        // TVL bonus (adjusted for testnet - using smaller amounts)
        if (tvl >= 10 ether) baseScore += 30;        // 10 ETH for testnet
        else if (tvl >= 5 ether) baseScore += 25;    // 5 ETH for testnet
        else if (tvl >= 1 ether) baseScore += 20;    // 1 ETH for testnet
        else if (tvl >= 0.5 ether) baseScore += 15;  // 0.5 ETH for testnet
        else if (tvl >= 0.1 ether) baseScore += 10;  // 0.1 ETH for testnet
        
        // Chain diversification bonus (up to 20 points)
        if (chainCount >= 3) baseScore += 20;  // All 3 testnets
        else if (chainCount >= 2) baseScore += 15;
        else if (chainCount >= 1) baseScore += 10;
        
        return baseScore > 100 ? 100 : baseScore;
    }
    
    function _calculateActivityScore(uint256 positions, uint256 chainCount) internal pure returns (uint256) {
        uint256 baseScore = 30;
        
        // Position count bonus
        baseScore += positions * 5;
        
        // Multi-chain bonus
        baseScore += chainCount * 10;
        
        return baseScore > 100 ? 100 : baseScore;
    }
    
    function _calculateDiversificationScore(CrossChainData[] memory crossChainData) 
        internal 
        pure 
        returns (uint256) 
    {
        if (crossChainData.length <= 1) return 20;
        
        uint256 baseScore = crossChainData.length * 25; // Higher score for testnet
        
        // Check TVL distribution
        uint256 maxTVL = 0;
        uint256 totalTVL = 0;
        
        for (uint256 i = 0; i < crossChainData.length; i++) {
            if (crossChainData[i].tvl > maxTVL) {
                maxTVL = crossChainData[i].tvl;
            }
            totalTVL += crossChainData[i].tvl;
        }
        
        // Penalty for over-concentration
        if (totalTVL > 0 && maxTVL * 100 / totalTVL > 70) {
            baseScore -= 10; // Reduce score if >70% on single chain
        }
        
        return baseScore > 100 ? 100 : baseScore;
    }
    
    function _determineAccessTier(
        uint256 tvl,
        uint256 riskScore,
        uint256 activityScore,
        uint256 chainCount
    ) internal view returns (AccessTier) {
        // Check PLATINUM tier
        TierRequirements memory platinumReq = tierRequirements[AccessTier.PLATINUM];
        if (platinumReq.isActive &&
            tvl >= platinumReq.minTVL &&
            riskScore >= platinumReq.minRiskScore &&
            activityScore >= platinumReq.minActivityScore &&
            chainCount >= platinumReq.minChains) {
            return AccessTier.PLATINUM;
        }
        
        // Check GOLD tier
        TierRequirements memory goldReq = tierRequirements[AccessTier.GOLD];
        if (goldReq.isActive &&
            tvl >= goldReq.minTVL &&
            riskScore >= goldReq.minRiskScore &&
            activityScore >= goldReq.minActivityScore &&
            chainCount >= goldReq.minChains) {
            return AccessTier.GOLD;
        }
        
        // Check SILVER tier
        TierRequirements memory silverReq = tierRequirements[AccessTier.SILVER];
        if (silverReq.isActive &&
            tvl >= silverReq.minTVL &&
            riskScore >= silverReq.minRiskScore &&
            activityScore >= silverReq.minActivityScore) {
            return AccessTier.SILVER;
        }
        
        // Check BRONZE tier
        TierRequirements memory bronzeReq = tierRequirements[AccessTier.BRONZE];
        if (bronzeReq.isActive &&
            tvl >= bronzeReq.minTVL &&
            riskScore >= bronzeReq.minRiskScore) {
            return AccessTier.BRONZE;
        }
        
        return AccessTier.NONE;
    }
    
    function _initializeTierRequirements() internal {
        // Adjusted for testnet with smaller TVL requirements
        tierRequirements[AccessTier.BRONZE] = TierRequirements({
            minTVL: 0.1 ether,    // 0.1 ETH for testnet
            minRiskScore: 40,
            minActivityScore: 30,
            minChains: 1,
            isActive: true
        });
        
        tierRequirements[AccessTier.SILVER] = TierRequirements({
            minTVL: 0.5 ether,    // 0.5 ETH for testnet
            minRiskScore: 60,
            minActivityScore: 50,
            minChains: 1,
            isActive: true
        });
        
        tierRequirements[AccessTier.GOLD] = TierRequirements({
            minTVL: 2 ether,      // 2 ETH for testnet
            minRiskScore: 75,
            minActivityScore: 65,
            minChains: 2,
            isActive: true
        });
        
        tierRequirements[AccessTier.PLATINUM] = TierRequirements({
            minTVL: 10 ether,     // 10 ETH for testnet
            minRiskScore: 85,
            minActivityScore: 80,
            minChains: 3,         // All 3 testnets
            isActive: true
        });
    }
    
    function _initializeSupportedChains() internal {
        // Sepolia Ethereum Testnet
        supportedChains[11155111] = ChainConfig({
            name: "Sepolia",
            supported: true,
            weight: 100,
            supportedProtocols: new string[](0)
        });
        activeChains.push(11155111);
        
        // ZetaChain Athens Testnet
        supportedChains[7001] = ChainConfig({
            name: "ZetaChain Testnet",
            supported: true,
            weight: 100,
            supportedProtocols: new string[](0)
        });
        activeChains.push(7001);
        
        // Polygon Amoy Testnet
        supportedChains[80002] = ChainConfig({
            name: "Polygon Amoy",
            supported: true,
            weight: 80,
            supportedProtocols: new string[](0)
        });
        activeChains.push(80002);
    }
}
