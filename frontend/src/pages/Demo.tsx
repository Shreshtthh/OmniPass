import { useAccount } from 'wagmi';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Crown, Zap, Shield, TrendingUp, CheckCircle, Gift, Lock, Unlock, Loader } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { OmniPassAPI, AnalysisResponse } from '@/lib/api';
import { useSearchParams } from 'react-router-dom';

export default function Demo() {
  const { address: connectedAddress } = useAccount();
  const [searchParams] = useSearchParams();
  
  // Extract URL parameter once outside the effect
  const walletAddressParam = searchParams.get('address');
  const fallbackAddress = '0x92CbB44A94BEf56944929e25077F3A4F4F7B95E6';
  
  // Memoize the computed wallet address to avoid unnecessary re-renders
  const computedWalletAddress = useMemo(() => {
    return walletAddressParam || connectedAddress || fallbackAddress;
  }, [walletAddressParam, connectedAddress, fallbackAddress]);
  
  const [walletAddress, setWalletAddress] = useState(computedWalletAddress);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Main analysis effect - depends only on walletAddress state
  useEffect(() => {
    if (!walletAddress) return;
    
    setLoading(true);
    setError(null);
    
    console.log('🔍 Analyzing wallet address:', walletAddress);
    
    OmniPassAPI.analyzeWallet(walletAddress)
      .then(data => {
        setAnalysis(data);
        console.log('📊 Full Analysis Response:', data);
        console.log('🏆 User Tier from API:', data?.data?.accessLevel?.tier);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
        console.error('❌ Demo analysis error:', err);
      })
      .finally(() => setLoading(false));
  }, [walletAddress]);

  // ✅ FIXED: Sync computed wallet address to state
  useEffect(() => {
    if (computedWalletAddress !== walletAddress) {
      setWalletAddress(computedWalletAddress);
    }
  }, [computedWalletAddress, walletAddress]);

  // ... rest of your component (benefits, tier functions, etc.)
  
  const allBenefits = [
    // Bronze Tier Benefits
    {
      protocol: 'Aave',
      icon: '🏦',
      benefit: 'Basic Rate Discount', 
      description: '2% discount on borrowing rates',
      unlockTier: 'BRONZE'
    },
    {
      protocol: 'Community',
      icon: '👥',
      benefit: 'Discord Access',
      description: 'Join our Bronze tier community',
      unlockTier: 'BRONZE'
    },
    // Silver Tier Benefits
    {
      protocol: 'Aave',
      icon: '🏦',
      benefit: 'Enhanced Borrowing',
      description: '5% lower collateral requirements',
      unlockTier: 'SILVER'
    },
    {
      protocol: 'Uniswap',
      icon: '🦄',
      benefit: 'LP Pool Access',
      description: 'Access to mid-tier liquidity pools',
      unlockTier: 'SILVER'
    },
    {
      protocol: 'AirdropHub',
      icon: '🎁',
      benefit: 'Priority Allocation',
      description: 'Higher chances in token airdrops',
      unlockTier: 'SILVER'
    },
    // Gold Tier Benefits
    {
      protocol: 'Aave',
      icon: '🏦',
      benefit: 'Premium Lending',
      description: '10% lower collateral + flash loan access',
      unlockTier: 'GOLD'
    },
    {
      protocol: 'Uniswap',
      icon: '🦄',
      benefit: 'Exclusive Pools',
      description: 'Access to high-yield premium pools',
      unlockTier: 'GOLD'
    },
    {
      protocol: 'AirdropHub',
      icon: '🎁',
      benefit: 'Guaranteed Allocation',
      description: 'Guaranteed spot in major airdrops',
      unlockTier: 'GOLD'
    },
    {
      protocol: 'DeFiGame',
      icon: '⚔️',
      benefit: 'Legendary NFT',
      description: 'Exclusive in-game asset unlocked',
      unlockTier: 'GOLD'
    },
    {
      protocol: 'Compound',
      icon: '💰',
      benefit: 'VIP Rewards',
      description: '25% bonus on COMP rewards',
      unlockTier: 'GOLD'
    },
    // Platinum Tier Benefits
    {
      protocol: 'All Protocols',
      icon: '👑',
      benefit: 'White Glove Service',
      description: 'Dedicated support + custom strategies',
      unlockTier: 'PLATINUM'
    },
    {
      protocol: 'Institutional',
      icon: '🏛️',
      benefit: 'Direct Partnerships',
      description: 'Private investment opportunities',
      unlockTier: 'PLATINUM'
    }
  ];

  // Define tier hierarchy for comparison
  const tierRank = { 
    'BRONZE': 1, 
    'SILVER': 2, 
    'GOLD': 3, 
    'PLATINUM': 4 
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return 'from-amber-500 to-orange-600';
      case 'SILVER': return 'from-slate-400 to-slate-600';
      case 'GOLD': return 'from-yellow-400 to-yellow-600';
      case 'PLATINUM': return 'from-purple-500 to-indigo-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return Award;
      case 'SILVER': return Star;
      case 'GOLD': return Crown;
      case 'PLATINUM': return Zap;
      default: return Shield;
    }
  };

  const isBenefitUnlocked = (benefitTier: string, userTier: string) => {
    if (!benefitTier || !userTier) return false;
    
    const normalizedBenefitTier = benefitTier.toUpperCase();
    const normalizedUserTier = userTier.toUpperCase();
    
    return tierRank[normalizedUserTier] >= tierRank[normalizedBenefitTier];
  };

  // Loading, error, and no data states remain the same...
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-12 flex items-center justify-center">
          <Card className="glass border-0 p-8">
            <div className="flex items-center space-x-4">
              <Loader className="w-8 h-8 animate-spin text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Analyzing Wallet...</h2>
                <p className="text-muted-foreground">Fetching your OmniPass tier and benefits</p>
              </div>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-12 flex items-center justify-center">
          <Card className="glass border-0 p-8 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Analysis Failed</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </Card>
        </main>
      </div>
    );
  }

  if (!analysis?.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-12 flex items-center justify-center">
          <Card className="glass border-0 p-8 text-center">
            <h2 className="text-xl font-semibold">No Analysis Data</h2>
            <p className="text-muted-foreground mb-4">
              {!connectedAddress ? 
                "Please connect your wallet to view benefits" : 
                "Please analyze a wallet first"
              }
            </p>
            <Button onClick={() => window.location.href = '/'}>Go to Analysis</Button>
          </Card>
        </main>
      </div>
    );
  }

  const userTier = analysis.data.accessLevel.tier;
  const TierIcon = getTierIcon(userTier);

  const unlockedBenefits = allBenefits.filter(benefit => 
    isBenefitUnlocked(benefit.unlockTier, userTier)
  );
  const lockedBenefits = allBenefits.filter(benefit => 
    !isBenefitUnlocked(benefit.unlockTier, userTier)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <Badge className="mx-auto bg-primary/10 text-primary border-primary/20">
            Your OmniPass Status
          </Badge>
          
          <div className="space-y-4">
            <div className={`w-24 h-24 mx-auto bg-gradient-to-r ${getTierColor(userTier)} rounded-3xl flex items-center justify-center`}>
              <TierIcon className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-normal break-words px-4">
              Congratulations! 🎉
            </h1>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">
                You're a {userTier} Tier User
              </h2>
              <p className="text-lg text-muted-foreground">
                Wallet: {walletAddress}
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm">
                <span>TVL: ${analysis.data.totalValueLocked?.toLocaleString()}</span>
                <span>Risk Score: {analysis.data.riskScore}/100</span>
                <span>Activity Score: {analysis.data.activityScore}/100</span>
              </div>
            </div>
          </div>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Your on-chain DeFi activity has unlocked exclusive benefits across multiple protocols. 
            Here's what your {userTier} tier reputation gives you access to:
          </p>
        </div>

        {/* All Benefits Overview */}
        <Card className="glass border-0">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold">
              OmniPass Benefits Overview
            </CardTitle>
            <p className="text-muted-foreground text-lg">
              All available benefits across tiers - unlocked and locked based on your current tier
            </p>
          </CardHeader>
          
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allBenefits.map((benefit, index) => {
                const unlocked = isBenefitUnlocked(benefit.unlockTier, userTier);
                return (
                  <Card 
                    key={index} 
                    className={
                      unlocked 
                        ? "border border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-800"
                        : "border border-primary/40 bg-primary/10 dark:bg-primary/20 dark:border-primary/60"
                    }
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{benefit.icon}</span>
                          <div>
                            <h4 className="font-semibold text-foreground">{benefit.protocol}</h4>
                            <Badge className={`text-xs bg-gradient-to-r ${getTierColor(benefit.unlockTier)} text-white`}>
                              {benefit.unlockTier}
                            </Badge>
                          </div>
                        </div>
                        {unlocked ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <Lock className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      
                      <div>
                        <h5 className={`font-medium ${
                          unlocked 
                            ? "text-green-700 dark:text-green-300" 
                            : "text-primary"
                        }`}>
                          {benefit.benefit}
                        </h5>
                        <p className="text-sm text-muted-foreground mt-1">{benefit.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {unlocked ? "✅ Available now" : `🔒 Requires ${benefit.unlockTier} tier`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card className="glass border-0">
          <CardContent className="py-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-2xl font-bold text-green-600">{unlockedBenefits.length}</h3>
                <p className="text-muted-foreground">Benefits Unlocked</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-primary">{lockedBenefits.length}</h3>
                <p className="text-muted-foreground">Benefits To Unlock</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-accent">{allBenefits.length}</h3>
                <p className="text-muted-foreground">Total Benefits Available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="glass border-0 text-center">
          <CardContent className="py-12 space-y-6">
            <h2 className="text-3xl font-bold">Ready to Unlock More?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {lockedBenefits.length > 0 
                ? `You have ${lockedBenefits.length} more benefits waiting to be unlocked. Improve your DeFi activity to advance to the next tier!`
                : "Congratulations! You've unlocked all available benefits. You're at the top tier!"
              }
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button className="btn-gradient text-lg px-8 py-3 min-w-[200px]">
                <Gift className="w-5 h-5 mr-2" />
                Claim Benefits
              </Button>
              <Button 
                variant="outline" 
                className="glass border-white/20 text-lg px-8 py-3 min-w-[200px]" 
                onClick={() => window.location.href = '/'}
              >
                {lockedBenefits.length > 0 ? "Improve My Score" : "Analyze Another Wallet"}
                <TrendingUp className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
