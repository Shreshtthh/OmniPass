// src/types/coach.ts
export interface CoachQuestion {
  id: string;
  question: string;
  category: 'tier' | 'risk' | 'protocol' | 'general';
  requiresAnalysis: boolean;
}

export interface CoachResponse {
  question: string;
  answer: string;
  actionItems: string[];
  relatedQuestions: string[];
}

export interface AnalysisData {
  address: string;
  totalValueLocked: number;
  riskScore: number;
  activityScore: number;
  diversificationScore: number;
  accessLevel: {
    tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
    qualifiesForAccess: boolean;
  };
  chains: Array<{
    name: string;
    tvl: number;
  }>;
  aiInsights: {
    summary: string;
    reasoning: string[];
    recommendations: string[];
    riskFactors: string[];
  };
}
