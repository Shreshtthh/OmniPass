import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; // ✅ Import routing
import { Button } from '@/components/ui/button';
import { Wallet, ChevronDown, ExternalLink } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';

export const Header = () => {
  const { address, isConnected, connectWallet, disconnect, sepoliaBalance, amoyBalance } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation(); // ✅ Get current route

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (balance: any) => {
    if (!balance) return '0';
    return parseFloat(balance.formatted).toFixed(4);
  };

  return (
    <header className="w-full border-b border-border/50 backdrop-blur-xl bg-background/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3"> {/* ✅ Make logo clickable */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <div className="w-4 h-4 rounded-sm bg-white/90" />
          </div>
          <span className="text-xl font-bold text-gradient">OmniPass</span>
        </Link>

        {/* ✅ Updated Navigation with proper routing */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/"
            className={`text-sm font-medium transition-colors hover:text-foreground ${
              location.pathname === '/' ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            to="/credentials"
            className={`text-sm font-medium transition-colors hover:text-foreground ${
              location.pathname === '/credentials' ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            Credentials
          </Link>
          <Link 
            to="/demo"
            className={`text-sm font-medium transition-colors hover:text-foreground ${
              location.pathname === '/demo' ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            Demo
          </Link>
          <a 
            href="https://github.com/Shreshtthh/OmniPass" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
          >
            GitHub <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </nav>

        {/* Wallet Connection - unchanged */}
        <div className="relative">
          {!isConnected ? (
            <Button onClick={connectWallet} className="btn-gradient">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          ) : (
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowDropdown(!showDropdown)}
                className="glass border-white/20 hover:bg-white/10"
              >
                <div className="w-2 h-2 rounded-full bg-accent mr-2" />
                {formatAddress(address!)}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 glass-strong rounded-xl p-4 z-50">
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Wallet Balances</div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sepolia ETH:</span>
                        <span>{formatBalance(sepoliaBalance)} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amoy MATIC:</span>
                        <span>{formatBalance(amoyBalance)} MATIC</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-white/10 pt-3">
                      <button
                        onClick={() => {
                          disconnect();
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm"
                      >
                        Disconnect Wallet
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
