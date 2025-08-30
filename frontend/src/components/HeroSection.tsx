import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom'; // ✅ Import Link
import { TrendingUp, Shield, Sparkles, Zap } from 'lucide-react';

interface HeroSectionProps {
  onConnect: () => void;
  onAnalyze: () => void;
  isConnected: boolean;
  address?: string;
  loading: boolean;
}

export const HeroSection = ({ onConnect, onAnalyze, isConnected, address, loading }: HeroSectionProps) => {
  return (
    <div className="text-center space-y-12">
      {/* Hero Content */}
      <div className="space-y-6">
        <div className="inline-flex items-center px-4 py-2 rounded-full glass border border-white/10 text-sm font-medium">
          <Zap className="w-4 h-4 mr-2 text-accent" />
          Cross-Chain Reputation Protocol
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Your{' '}
          <span className="text-gradient bg-gradient-to-r from-primary via-accent to-purple-600 bg-clip-text text-transparent">
            Universal
          </span>
          <br />
          DeFi Identity
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Analyze your cross-chain DeFi activity and mint verifiable credentials that unlock exclusive opportunities across protocols
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {!isConnected ? (
          <Button
            onClick={onConnect}
            size="lg"
            className="btn-gradient text-lg px-8 py-6 rounded-2xl"
          >
            <Shield className="w-5 h-5 mr-3" />
            Connect Wallet to Begin
          </Button>
        ) : (
          <Button
            onClick={onAnalyze}
            size="lg"
            className="btn-gradient text-lg px-8 py-6 rounded-2xl animate-pulse-glow"
            disabled={loading}
          >
            <TrendingUp className="w-5 h-5 mr-3" />
            {loading ? 'Analyzing...' : 'Analyze My Portfolio'}
          </Button>
        )}
        
        {/* ✅ Demo Button */}
        <Button
          asChild
          size="lg"
          variant="outline"
          className="glass border-white/20 text-lg px-8 py-6 rounded-2xl hover:bg-white/10"
        >
          <Link to="/demo">
            <Sparkles className="w-5 h-5 mr-3" />
            View Demo
          </Link>
        </Button>
      </div>

      {/* Connected Wallet Status */}
      {isConnected && address && (
        <div className="glass rounded-2xl p-4 inline-block">
          <div className="text-sm text-muted-foreground">Connected Wallet</div>
          <div className="font-mono text-sm text-accent">{address.slice(0, 8)}...{address.slice(-6)}</div>
        </div>
      )}
    </div>
  );
};
