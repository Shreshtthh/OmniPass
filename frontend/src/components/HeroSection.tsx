import { Button } from '@/components/ui/button';
import { Shield, TrendingUp, Network, Sparkles, Wallet } from 'lucide-react';

interface HeroSectionProps {
    onConnect: () => void;
    onAnalyze: () => Promise<void>;
    isConnected: boolean;
    address?: string;
    loading?: boolean;
}

export const HeroSection = ({ onConnect, onAnalyze, isConnected, address, loading }: HeroSectionProps) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full glass border border-white/20 mb-8">
          <Sparkles className="w-4 h-4 mr-2 text-accent" />
          <span className="text-sm font-medium">Cross-Chain Reputation Protocol</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Your Universal
          <br />
          <span className="text-gradient">Cross-Chain</span>
          <br />
          Reputation
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
          {!isConnected ? (
            "Analyze your Web3 activity across Ethereum and Polygon networks to unlock tiered access to premium dApps with your personalized reputation score."
          ) : (
            `Connected as ${address?.slice(0, 6)}...${address?.slice(-4)}. Ready to analyze your cross-chain portfolio and generate your OmniPass credential.`
          )}
        </p>

        {/* CTA Button - Shows different content based on connection status */}
        {!isConnected ? (
          <Button
            onClick={onConnect}
            size="lg"
            className="btn-gradient text-lg px-8 py-6 rounded-2xl animate-pulse-glow mb-16"
          >
            <Wallet className="w-5 h-5 mr-3" />
            Connect Wallet to Get Started
          </Button>
        ) : (
          <Button
            onClick={onAnalyze}
            size="lg"
            className="btn-gradient text-lg px-8 py-6 rounded-2xl animate-pulse-glow mb-16"
            disabled={loading}
          >
            <TrendingUp className="w-5 h-5 mr-3" />
            {loading ? 'Analyzing Portfolio...' : 'Analyze My Portfolio'}
          </Button>
        )}

        {/* Feature Icons */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="glass rounded-2xl p-6 hover:bg-card/90 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Risk Assessment</h3>
            <p className="text-muted-foreground text-sm">
              Advanced algorithms analyze your DeFi positions and protocol interactions
            </p>
          </div>

          <div className="glass rounded-2xl p-6 hover:bg-card/90 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 mx-auto">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Activity Scoring</h3>
            <p className="text-muted-foreground text-sm">
              Track transaction history and engagement across multiple protocols
            </p>
          </div>

          <div className="glass rounded-2xl p-6 hover:bg-card/90 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 mx-auto">
              <Network className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Cross-Chain Analysis</h3>
            <p className="text-muted-foreground text-sm">
              Comprehensive view of your assets and activities across all supported chains
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
