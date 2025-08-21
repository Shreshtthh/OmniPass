// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7 <0.9.0;

interface IOmniPassCredential {
    enum AccessTier { NONE, BRONZE, SILVER, GOLD, PLATINUM }
    
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
    
    struct CrossChainData {
        uint256 chainId;
        uint256 tvl;
        uint256 positions;
        bytes32 dataHash;
        bytes signature;
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
        uint256 weight;
        string[] supportedProtocols;
    }
    
    event CredentialIssued(
        address indexed user,
        AccessTier tier,
        uint256 tvl,
        uint256 riskScore,
        uint256 expiresAt
    );
    
    event CredentialRevoked(address indexed user, string reason);
    
    function verifyCredential(address user, AccessTier requiredTier) 
        external view returns (bool isValid, AccessTier userTier);
    
    function getCredential(address user) 
        external view returns (Credential memory credential);
        
    function issueCredential(
        address user,
        CrossChainData[] calldata crossChainData,
        bytes32 aiInsights,
        bytes calldata signature
    ) external;
    
    function revokeCredential(address user, string calldata reason) external;
    
    function checkTierEligibility(
        uint256 tvl,
        uint256 riskScore,
        uint256 activityScore,
        uint256 chainCount
    ) external view returns (AccessTier tier);
    
    function getActiveChains() external view returns (uint256[] memory);
}
