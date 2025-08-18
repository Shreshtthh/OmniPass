// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@zetachain/protocol-contracts/contracts/zevm/SystemContract.sol";
import "@zetachain/protocol-contracts/contracts/zevm/interfaces/zContract.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IOmniPassCredential.sol";

/**
 * @title OmniPassCredential
 * @dev Universal Contract for cross-chain DeFi reputation and access control
 * @notice This contract stores and manages user credentials based on cross-chain activity
 */
contract OmniPassCredential is IOmniPassCredential, zContract, Ownable, ReentrancyGuard {
    using CredentialLogic for CredentialLogic.UserData;

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
    
    // Tier requirements
    mapping(AccessTier => TierRequirements) public tierRequirements;
    
    // Events
    event CredentialIssued(
        address indexed user,
        AccessTier tier,
        uint256 tvl,
        uint256 riskScore,
        uint256 expiresAt
    );
    
    event CredentialRevoked(address indexed user, string reason);
    
    event AnalyzerAuthorized(address indexed analyzer, bool authorized);
    
    event ChainConfigUpdated(uint256 chainId, bool supported);

    // Structs
    struct Credential {
        address user;
        AccessTier tier;
        uint256 totalValueLocked;
        uint256 riskScore;
        uint256 activityScore;
        uint256 diversificationScore;
        bytes32[] chainDataHashes;
        bytes aiInsightsHash;
        uint256 issuedAt;
        uint256 expiresAt;
        bool isValid;
    }

    struct TierRequirements {
        uint256 minTVL;
        uint256 minRiskScore;
        uint256 minActivityScore;
        uint256 minChains;
        bool isActive;
    }

    struct ChainConfig {
        string name;
        bool supported;
        uint256 weight; // For scoring calculation
        string[] supportedProtocols;
    }

    struct CrossChainData {
        uint256 chainId;
        uint256 tvl;
        uint256 positions;
        bytes32 dataHash;
        bytes signature;
    }

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
        
        // Initialize tier requirements
        _initializeTierRequirements();
        
        // Initialize supported chains
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
     * @dev Issue a new credential based on cross-chain analysis
     * @param user User address
     * @param crossChainData Array of chain-specific data
     * @param aiInsights AI analysis results hash
     * @param signature Analyzer signature
     */
    function issueCredential(
        address user,
        CrossChainData[] calldata crossChainData,
        bytes32 aiInsights,
        bytes calldata signature
    ) external onlyAuthorizedAnalyzer nonReentrant {
        require(user != address(0), "Invalid user address");
        require(crossChainData.length > 0, "No chain data provided");
        
        // Verify signature and nonce
        bytes32 nonce = keccak256(abi.encodePacked(user, block.timestamp, crossChainData));
        require(!usedNonces[nonce], "Nonce already used");
        usedNonces[nonce] = true;

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
            aiInsightsHash: aiInsights,
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
    ) external view returns (AccessTier tier) {
        return _determineAccessTier(tvl, riskScore, activityScore, chainCount);
    }

    /**
     * @dev Revoke a user's credential
     * @param user User address
     * @param reason Reason for revocation
     */
    function revokeCredential(address user, string calldata reason) 
        external 
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
    function getActiveChains() external view returns (uint256[] memory) {
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

    function _issueCrossChainCredential(
        address user,
        CrossChainData[] memory crossChainData,
        bytes32 aiInsights
    ) internal {
        // Simplified credential issuance for cross-chain calls
        // Would include proper validation in production
        
        (uint256 totalTVL, uint256 avgRiskScore, uint256 activityScore, uint256 diversificationScore) = 
            _calculateAggregatedScores(crossChainData);

        AccessTier tier = _determineAccessTier(
            totalTVL,
            avgRiskScore,
            activityScore,
            crossChainData.length
        );

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
            aiInsightsHash: aiInsights,
            issuedAt: block.timestamp,
            expiresAt: expiryTime,
            isValid: true
        });
        
        credentialExpiry[user] = expiryTime;

        emit CredentialIssued(user, tier, totalTVL, avgRiskScore, expiryTime);
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
        
        // TVL bonus (up to 30 points)
        if (tvl >= 100000 ether) baseScore += 30;
        else if (tvl >= 50000 ether) baseScore += 25;
        else if (tvl >= 10000 ether) baseScore += 20;
        else if (tvl >= 5000 ether) baseScore += 15;
        else if (tvl >= 1000 ether) baseScore += 10;
        
        // Chain diversification bonus (up to 20 points)
        if (chainCount >= 4) baseScore += 20;
        else if (chainCount >= 3) baseScore += 15;
        else if (chainCount >= 2) baseScore += 10;
        
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
        
        uint256 baseScore = crossChainData.length * 20;
        
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
        tierRequirements[AccessTier.BRONZE] = TierRequirements({
            minTVL: 1000 ether,
            minRiskScore: 40,
            minActivityScore: 30,
            minChains: 1,
            isActive: true
        });
        
        tierRequirements[AccessTier.SILVER] = TierRequirements({
            minTVL: 5000 ether,
            minRiskScore: 60,
            minActivityScore: 50,
            minChains: 1,
            isActive: true
        });
        
        tierRequirements[AccessTier.GOLD] = TierRequirements({
            minTVL: 25000 ether,
            minRiskScore: 75,
            minActivityScore: 65,
            minChains: 2,
            isActive: true
        });
        
        tierRequirements[AccessTier.PLATINUM] = TierRequirements({
            minTVL: 100000 ether,
            minRiskScore: 85,
            minActivityScore: 80,
            minChains: 3,
            isActive: true
        });
    }

    function _initializeSupportedChains() internal {
        // Ethereum
        supportedChains[1] = ChainConfig({
            name: "Ethereum",
            supported: true,
            weight: 100,
            supportedProtocols: new string[](0)
        });
        activeChains.push(1);
        
        // BSC
        supportedChains[56] = ChainConfig({
            name: "BSC",
            supported: true,
            weight: 80,
            supportedProtocols: new string[](0)
        });
        activeChains.push(56);
        
        // Polygon
        supportedChains[137] = ChainConfig({
            name: "Polygon",
            supported: true,
            weight: 70,
            supportedProtocols: new string[](0)
        });
        activeChains.push(137);
    }
}