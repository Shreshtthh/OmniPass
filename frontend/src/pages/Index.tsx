import { useState } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { AICoach } from '@/components/AICoach';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { useWallet } from '@/hooks/use-wallet';
import { useAnalysis } from '@/hooks/use-analysis';

export default function Index() {
  const { address, isConnected, connectWallet } = useWallet();
  const { analysis, loading, error, analyzeWallet } = useAnalysis();
  const [showResults, setShowResults] = useState(false);

  const handleConnect = () => {
    connectWallet();
  };

  const handleAnalyze = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      await analyzeWallet(address);
      setShowResults(true);
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  };

  const handleShare = () => {
    if (analysis) {
      const shareText = `Check out my OmniPass ${analysis.accessLevel.tier} tier credential! 🚀`;
      if (navigator.share) {
        navigator.share({
          title: 'My OmniPass Analysis',
          text: shareText,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(shareText);
        alert('Share text copied to clipboard!');
      }
    }
  };

  const handleDownload = () => {
    if (analysis) {
      const credentialData = JSON.stringify(analysis, null, 2);
      const blob = new Blob([credentialData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `omnipass-credential-${analysis.address.slice(0, 8)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* --- FIX: Only one Header component should be here --- */}
      <Header />

      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card/90 rounded-2xl p-8 border border-white/10">
            <LoadingAnimation />
          </div>
        </div>
      )}
      
      {/* --- FIX: The main content area, no longer duplicated --- */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {!showResults ? (
          <>
            <HeroSection 
              onConnect={handleConnect}
              onAnalyze={handleAnalyze}
              isConnected={isConnected}
              address={address}
              loading={loading}
            />
            {error && (
              <div className="text-center p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive">Error: {error}</p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-8">
            {analysis && (
              <ResultsDashboard 
                data={analysis}
                onShare={handleShare}
                onDownload={handleDownload}
              />
            )}
            <AICoach analysisData={analysis} />
          </div>
        )}
      </main>
    </div>
  );
}
