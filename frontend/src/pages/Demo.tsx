import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Crown, Zap, Shield, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';

export default function Demo() {
  const tiers = [
    {
      name: 'Bronze',
      icon: Award,
      color: 'from-amber-500 to-orange-600',
      price: '$5',
      period: 'month',
      features: [
        'Basic DeFi insights',
        'Community access',
        'Weekly reports',
        'Email support',
        'Testnet tutorials'
      ],
      cta: 'Subscribe Bronze',
      description: 'Perfect for DeFi beginners'
    },
    {
      name: 'Silver',
      icon: Star,
      color: 'from-slate-400 to-slate-600',
      price: '$15',
      period: 'month',
      features: [
        'Advanced protocol analytics',
        'AI-powered recommendations',
        'Partner rewards (5% discount)',
        'Priority support',
        'Exclusive webinars',
        'Custom alerts'
      ],
      cta: 'Subscribe Silver',
      popular: true,
      description: 'Most popular for active traders'
    },
    {
      name: 'Gold',
      icon: Crown,
      color: 'from-yellow-400 to-yellow-600',
      price: '$25',
      period: 'month',
      features: [
        'Premium AI coaching',
        'VIP community access',
        'Early protocol access',
        'Partner rewards (15% discount)',
        '1-on-1 strategy sessions',
        'Custom portfolio alerts',
        'Risk analysis tools'
      ],
      cta: 'Subscribe Gold',
      description: 'Advanced features for experts'
    },
    {
      name: 'Platinum',
      icon: Zap,
      color: 'from-purple-500 to-indigo-600',
      price: '$50',
      period: 'month',
      features: [
        'Everything in Gold',
        'Exclusive investment opportunities',
        'Direct protocol partnerships',
        'Custom smart contract audits',
        'Partner rewards (25% discount)',
        'Dedicated account manager',
        'White-label solutions'
      ],
      cta: 'Subscribe Platinum',
      description: 'Ultimate package for institutions'
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Verified On-Chain Credentials',
      description: 'Your DeFi activity is verified and stored immutably on ZetaChain, providing transparent proof of your expertise and track record.'
    },
    {
      icon: TrendingUp,
      title: 'Exclusive Partner Benefits',
      description: 'Access special discounts, early access to new protocols, and exclusive investment opportunities from our growing network of DeFi partners.'
    },
    {
      icon: Crown,
      title: 'AI-Powered Portfolio Insights',
      description: 'Get personalized DeFi strategies and recommendations powered by advanced AI analysis of your cross-chain activity and market conditions.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <Badge className="mx-auto bg-primary/10 text-primary border-primary/20">
            Demo Marketplace
          </Badge>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            OmniPass Marketplace
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Unlock exclusive DeFi benefits, premium insights, and partner rewards based on your verified on-chain credentials
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Secure on-chain verification</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span>Real-time tier benefits</span>
            </div>
          </div>
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <Card 
                key={tier.name}
                className={`relative border-0 glass ${
                  tier.popular ? 'ring-2 ring-primary/50 scale-105' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto bg-gradient-to-r ${tier.color} rounded-2xl flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <CardTitle className="text-2xl">{tier.name} Tier</CardTitle>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {tier.price}
                      <span className="text-sm text-muted-foreground font-normal">/{tier.period}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-3 text-sm">
                        <CheckCircle className={`w-4 h-4 bg-gradient-to-r ${tier.color} rounded-full text-white flex-shrink-0`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full bg-gradient-to-r ${tier.color} hover:opacity-90 transition-opacity text-white`}
                    onClick={() => alert(`${tier.name} subscription coming soon! 🚀`)}
                  >
                    {tier.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Benefits Section */}
        <Card className="glass border-0">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold mb-4">
              Why Choose OmniPass?
            </CardTitle>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Your verified on-chain credentials unlock real value and exclusive opportunities in the DeFi ecosystem
            </p>
          </CardHeader>
          
          <CardContent className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="glass border-0 text-center">
          <CardContent className="py-12 space-y-6">
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Connect your wallet and analyze your DeFi activity to see which tier you qualify for
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="btn-gradient text-lg px-8 py-3" onClick={() => window.location.href = '/'}>
                Analyze My Portfolio
                <TrendingUp className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" className="glass border-white/20 text-lg px-8 py-3">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
