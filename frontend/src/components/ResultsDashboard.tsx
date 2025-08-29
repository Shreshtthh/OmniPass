import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, Shield, Activity, PieChart, DollarSign, Sparkles, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

// Updated interface to match backend response structure
interface CrossChainAnalysis {
  address: string;
  totalValueLocked: number;
  riskScore: number;
  activityScore: number;
  diversificationScore: number;
  chains: {
    name: string;
    chainId: number;
    tvl: number;
    protocols: {
      name: string;
      tvl: number;
      positions: number;
      healthFactor?: number;
    }[];
  }[];
  aiInsights: {
    summary: string;
    reasoning: string[];
    recommendations: string[];
    riskFactors: string[];
  };
  accessLevel: {
    tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
    qualifiesForAccess: boolean;
  };
}

interface ResultsDashboardProps {
  data: CrossChainAnalysis | null; // Allow null for loading states
  isLoading?: boolean;
  error?: string | null;
  onShare: () => void;
  onDownload: () => void;
}

export const ResultsDashboard = ({ 
  data, 
  isLoading = false, 
  error = null, 
  onShare, 
  onDownload
}: ResultsDashboardProps) => {
  // Handle loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Analyzing your cross-chain portfolio...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Analysis Failed</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle no data state
  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">No analysis data available</p>
        </div>
      </div>
    );
  }

  const getTierConfig = (tier: string) => {
    switch (tier) {
      case 'PLATINUM':
        return { gradient: 'tier-platinum', textColor: 'text-slate-800', bgColor: 'bg-slate-100' };
      case 'GOLD':
        return { gradient: 'tier-gold', textColor: 'text-yellow-900', bgColor: 'bg-yellow-100' };
      case 'SILVER':
        return { gradient: 'tier-silver', textColor: 'text-gray-800', bgColor: 'bg-gray-100' };
      default:
        return { gradient: 'tier-bronze', textColor: 'text-orange-900', bgColor: 'bg-orange-100' };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-accent';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  // Safe number formatting with fallbacks
  const formatTVL = (tvl: number | undefined | null) => {
    if (typeof tvl !== 'number' || isNaN(tvl)) return '0';
    return tvl.toLocaleString();
  };

  const formatAddress = (address: string) => {
    if (!address || address.length < 10) return address || '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const tierConfig = getTierConfig(data.accessLevel?.tier || 'BRONZE');

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your OmniPass Analysis</h1>
          <p className="text-muted-foreground">
            Analysis for {formatAddress(data.address)}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={onShare} variant="outline" className="glass border-white/20">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button onClick={onDownload} className="btn-gradient">
            <Download className="w-4 h-4 mr-2" />
            Download Credential
          </Button>
        </div>
      </div>

      {/* Main Credential Card */}
      <Card className={`${tierConfig.gradient} text-center p-8 border-0 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10">
          <div className="mb-4">
            <Badge className={`${tierConfig.bgColor} ${tierConfig.textColor} text-lg px-4 py-2 font-bold`}>
              {data.accessLevel?.tier || 'BRONZE'} TIER
            </Badge>
          </div>
          <h2 className={`text-4xl font-bold mb-2 ${tierConfig.textColor}`}>
            OmniPass Verified
          </h2>
          <p className={`text-lg ${tierConfig.textColor}/80 mb-6`}>
            Cross-Chain Reputation Protocol
          </p>
          {data.accessLevel?.qualifiesForAccess && (
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className={`w-5 h-5 ${tierConfig.textColor}`} />
              <span className={`font-semibold ${tierConfig.textColor}`}>
                Qualified for Premium Access
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Score Widgets */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="score-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Risk Score</CardTitle>
              <Shield className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-3xl font-bold">
                <span className={getScoreColor(data.riskScore || 0)}>
                  {data.riskScore || 0}
                </span>
                <span className="text-muted-foreground text-lg">/100</span>
              </div>
              <Progress 
                value={data.riskScore || 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="score-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Activity Score</CardTitle>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-3xl font-bold">
                <span className={getScoreColor(data.activityScore || 0)}>
                  {data.activityScore || 0}
                </span>
                <span className="text-muted-foreground text-lg">/100</span>
              </div>
              <Progress 
                value={data.activityScore || 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="score-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Diversification</CardTitle>
              <PieChart className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-3xl font-bold">
                <span className={getScoreColor(data.diversificationScore || 0)}>
                  {data.diversificationScore || 0}
                </span>
                <span className="text-muted-foreground text-lg">/100</span>
              </div>
              <Progress 
                value={data.diversificationScore || 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="score-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Value Locked</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-3xl font-bold text-accent">
                ${formatTVL(data.totalValueLocked)}
              </div>
              <div className="text-sm text-muted-foreground">
                Across {data.chains?.length || 0} chains
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle>AI Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary */}
          <div>
            <h4 className="font-semibold mb-2">Summary</h4>
            <p className="text-muted-foreground leading-relaxed">
              {data.aiInsights?.summary || 'No summary available'}
            </p>
          </div>

          {/* Recommendations */}
          {data.aiInsights?.recommendations && data.aiInsights.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-accent" />
                Recommendations
              </h4>
              <ul className="space-y-2">
                {data.aiInsights.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk Factors */}
          {data.aiInsights?.riskFactors && data.aiInsights.riskFactors.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-yellow-400" />
                Risk Factors
              </h4>
              <ul className="space-y-2">
                {data.aiInsights.riskFactors.map((risk, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
