import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Crown, Zap, Shield, TrendingUp, CheckCircle, ArrowRight, Gift, Coins, Users, Lock, Unlock, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import { OmniPassAPI, AnalysisResponse } from '@/lib/api';
import { useSearchParams } from 'react-router-dom';

export default function Demo() {
  const [searchParams] = useSearchParams();
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const walletAddress = searchParams.get('address') || '0x92CbB44A94BEf56944929e25077F3A4F4F7B95E6';
  
  const tierBenefits = {
    BRONZE: [
      {
        protocol: 'Aave',
        icon: '🏦',
        benefit: 'Basic Rate Discount',
        description: '2% discount on borrowing rates',
        status: 'unlocked'
      },
      {
        protocol: 'Community',
        icon: '👥',
        benefit: 'Discord Access',
        description: 'Join our Bronze tier community',
        status: 'unlocked'
      }
    ],
    SILVER: [
      {
        protocol: 'Aave',
        icon: '🏦',
        benefit: 'Enhanced Borrowing',
        description: '5% lower collateral requirements',
        status: 'unlocked'
      },
      {
        protocol: 'Uniswap',
        icon: '🦄',
        benefit: 'LP Pool Access',
        description: 'Access to mid-tier liquidity pools',
        status: 'unlocked'
      },
      {
        protocol: 'AirdropHub',
        icon: '🎁',
        benefit: 'Priority Allocation',
        description: 'Higher chances in token airdrops',
        status: 'unlocked'
      }
    ],
    GOLD: [
      {
        protocol: 'Aave',
        icon: '🏦',
        benefit: 'Premium Lending',
        description: '10% lower collateral + flash loan access',
        status: 'unlocked'
      },
      {
        protocol: 'Uniswap',
        icon: '🦄',
        benefit: 'Exclusive Pools',
        description: 'Access to high-yield premium pools',
        status: 'unlocked'
      },
      {
        protocol: 'AirdropHub',
        icon: '🎁',
        benefit: 'Guaranteed Allocation',
        description: 'Guaranteed spot in major airdrops',
        status: 'unlocked'
      },
      {
        protocol: 'DeFiGame',
        icon: '⚔️',
        benefit: 'Legendary NFT',
        description: 'Exclusive in-game asset unlocked',
        status: 'unlocked'
      },
      {
        protocol: 'Compound',
        icon: '💰',
        benefit: 'VIP Rewards',
        description: '25% bonus on COMP rewards',
        status: 'unlocked'
      }
    ],
    PLATINUM: [
      {
        protocol: 'All Protocols',
        icon: '👑',
        benefit: 'White Glove Service',
        description: 'Dedicated support + custom strategies',
        status: 'unlocked'
      },
      {
        protocol: 'Institutional',
        icon: '🏛️',
        benefit: 'Direct Partnerships',
        description: 'Private investment opportunities',
        status: 'unlocked'
      }
    ]
  };

  useEffect(() => {
    if (!walletAddress) return;
    
    setLoading(true);
    setError(null);
    
    OmniPassAPI.analyzeWallet(walletAddress)
      .then(data => {
        setAnalysis(data);
        console.log('📊 Analysis loaded for demo:', data);
      })
      .catch(err => {
        setError(err.message);
        console.error('❌ Demo analysis error:', err);
      })
      .finally(() => setLoading(false));
  }, [walletAddress]);

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

  const getCurrentTierBenefits = () => {
    if (!analysis?.data?.accessLevel?.tier) return [];
    
    const userTier = analysis.data.accessLevel.tier;
    const allBenefits = [];
    
    if (['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].includes(userTier)) {
      allBenefits.push(...tierBenefits.BRONZE.map(b => ({ ...b, tier: 'BRONZE' })));
    }
    if (['SILVER', 'GOLD', 'PLATINUM'].includes(userTier)) {
      allBenefits.push(...tierBenefits.SILVER.map(b => ({ ...b, tier: 'SILVER' })));
    }
    if (['GOLD', 'PLATINUM'].includes(userTier)) {
      allBenefits.push(...tierBenefits.GOLD.map(b => ({ ...b, tier: 'GOLD' })));
    }
    if (userTier === 'PLATINUM') {
      allBenefits.push(...tierBenefits.PLATINUM.map(b => ({ ...b, tier: 'PLATINUM' })));
    }
    
    return allBenefits;
  };

  const getNextTierBenefits = () => {
    if (!analysis?.data?.accessLevel?.tier) return [];
    
    const userTier = analysis.data.accessLevel.tier;
    if (userTier === 'BRONZE') return tierBenefits.SILVER.map(b => ({ ...b, tier: 'SILVER', status: 'locked' }));
    if (userTier === 'SILVER') return tierBenefits.GOLD.map(b => ({ ...b, tier: 'GOLD', status: 'locked' }));
    if (userTier === 'GOLD') return tierBenefits.PLATINUM.map(b => ({ ...b, tier: 'PLATINUM', status: 'locked' }));
    return [];
  };

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
            <p className="text-muted-foreground mb-4">Please analyze a wallet first</p>
            <Button onClick={() => window.location.href = '/'}>Go to Analysis</Button>
          </Card>
        </main>
      </div>
    );
  }

  const userTier = analysis.data.accessLevel.tier;
  const currentBenefits = getCurrentTierBenefits();
  const nextTierBenefits = getNextTierBenefits();
  const TierIcon = getTierIcon(userTier);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
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

        <Card className="glass border-0">
          <CardHeader className="text-center pb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Unlock className="w-8 h-8 text-green-500" />
              <CardTitle className="text-3xl font-bold">
                Your Unlocked Benefits
              </CardTitle>
            </div>
            <p className="text-muted-foreground text-lg">
              These exclusive perks are now active for your wallet across the DeFi ecosystem
            </p>
          </CardHeader>
          
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentBenefits.map((benefit, index) => (
                <Card key={index} className="border border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-800">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{benefit.icon}</span>
                        <div>
                          <h4 className="font-semibold text-foreground">{benefit.protocol}</h4>
                          <Badge className={`text-xs bg-gradient-to-r ${getTierColor(benefit.tier)} text-white`}>
                            {benefit.tier}
                          </Badge>
                        </div>
                      </div>
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-green-700 dark:text-green-300">{benefit.benefit}</h5>
                      <p className="text-sm text-muted-foreground mt-1">{benefit.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {nextTierBenefits.length > 0 && (
          <Card className="glass border-0">
            <CardHeader className="text-center pb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Lock className="w-8 h-8 text-primary" />
                <CardTitle className="text-3xl font-bold">
                  Unlock More Benefits
                </CardTitle>
              </div>
              <p className="text-muted-foreground text-lg">
                Continue growing your DeFi reputation to unlock these premium benefits
              </p>
            </CardHeader>
            
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nextTierBenefits.slice(0, 6).map((benefit, index) => (
                  <Card key={index} className="border border-primary/40 bg-primary/10 dark:bg-primary/20 dark:border-primary/60">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{benefit.icon}</span>
                          <div>
                            <h4 className="font-semibold text-foreground">{benefit.protocol}</h4>
                            <Badge className={`text-xs bg-gradient-to-r ${getTierColor(benefit.tier)} text-white`}>
                              {benefit.tier}
                            </Badge>
                          </div>
                        </div>
                        <Lock className="w-6 h-6 text-primary" />
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-primary">{benefit.benefit}</h5>
                        <p className="text-sm text-muted-foreground mt-1">{benefit.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-8">
                <Button 
                  className="btn-gradient text-lg px-8 py-3 min-w-[200px]" 
                  onClick={() => window.location.href = '/'}
                >
                  Improve My Score
                  <TrendingUp className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="glass border-0 text-center">
          <CardContent className="py-12 space-y-6">
            <h2 className="text-3xl font-bold">Start Using Your Benefits</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Your {userTier} tier credentials are ready to use. Connect to partner protocols and claim your exclusive benefits.
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
                Analyze Another Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
