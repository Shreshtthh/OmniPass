export interface UserAddress {
  address: string;
  chainId: number;
}

export interface LendingData {
  protocol: string;
  chain: string;
  totalSupplied: number;
  totalBorrowed: number;
  healthFactor: number;
  positions: LendingPosition[];
}

export interface LendingPosition {
  asset: string;
  supplied: number;
  borrowed: number;
  apy: number;
}

export interface CrossChainAnalysis {
  address: string;
  totalValueLocked: number;
  riskScore: number;
  activityScore: number;
  diversificationScore: number;
  chains: ChainData[];
  aiInsights: AIInsights;
  accessLevel: AccessLevel;
}

export interface ChainData {
  name: string;
  chainId: number;
  tvl: number;
  protocols: ProtocolData[];
}

export interface ProtocolData {
  name: string;
  tvl: number;
  positions: number;
  healthFactor?: number;
}

export interface AIInsights {
  summary: string;
  reasoning: string[];
  recommendations: string[];
  riskFactors: string[];
}

export interface AccessLevel {
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  qualifiesForAccess: boolean;
  requiredTVL?: number;
  requiredScore?: number;
}

export interface AnalysisRequest {
  address: string;
  chains?: string[];
}

export interface AnalysisResponse {
  success: boolean;
  data?: CrossChainAnalysis;
  error?: string;
  processingTime: number;
}