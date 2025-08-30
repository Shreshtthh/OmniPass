import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { AICoach } from '@/components/AICoach';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { useWallet } from '@/hooks/use-wallet';
import { Award } from 'lucide-react';
import { useAnalysisContext } from '@/contexts/AnalysisContext'; // ✅ Use context

export default function Index() {
  const { address, isConnected, connectWallet } = useWallet();
  
  // ✅ Get everything from context instead of local hooks/state
  const { 
    analysis, 
    loading, 
    error, 
    showResults, 
    isIssuing, 
    txHash, 
    analyzeWallet, 
    issueCredential 
  } = useAnalysisContext();

  const handleConnect = () => {
    connectWallet();
  };

  const handleAnalyze = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }
    // ✅ Use context function
    await analyzeWallet(address);
  };

  const handleIssueCredential = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }
    // ✅ Use context function
    await issueCredential(address);
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

  console.log('🔍 Current txHash state:', txHash);
  console.log('🔍 Current isIssuing state:', isIssuing);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Header />

      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card/90 rounded-2xl p-8 border border-white/10">
            <LoadingAnimation />
          </div>
        </div>
      )}
      
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
                onIssueCredential={handleIssueCredential}
                isIssuing={isIssuing}
              />
            )}
            
            {/* ✅ Transaction Hash Display with corrected explorer URL */}
            {txHash && (
              <div className="glass rounded-2xl p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  ✅ Credential Issued Successfully!
                </h3>
                <p className="text-muted-foreground">
                  Your OmniPass credential has been recorded on ZetaChain
                </p>
                <a 
                  href={`https://zetachain-testnet.blockscout.com//tx/${txHash}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
                >
                  View Transaction on ZetaChain Testnet Explorer →
                </a>
              </div>
            )}
            
            <AICoach analysisData={analysis} userAddress={address} />
          </div>
        )}
      </main>
    </div>
  );
}
