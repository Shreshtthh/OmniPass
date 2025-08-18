'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import ConnectWallet from '@/app/components/ConnectWallet';
import AnalysisResults from '@/app/components/AnalysisResults';
import CredentialDisplay from '@/app/components/CredentialDisplay';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { APIService } from '@/lib/api';
import { CrossChainAnalysis } from '@/types';
import { Zap, Shield, BarChart3, Network } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const [analysis, setAnalysis] = useState<CrossChainAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!address) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await APIService.analyzeUser(address);
      
      if (response.success && response.data) {
        setAnalysis(response.data);
      } else {
        setError(response.error || 'Analysis failed');
      }
    } catch (err) {
      setError('Failed to connect to analysis service');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCredential = () => {
    if (!analysis) return;
    
    const credential = {
      address: analysis.address,
      tier: analysis.accessLevel.tier,
      qualified: analysis.accessLevel.qualifiesForAccess,
      issuedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      signature: 'omnipass_demo_signature'
    };
    
    const blob = new Blob([JSON.stringify(credential, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnipass-credential-${analysis.address.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareCredential = () => {
    if (!analysis) return;
    
    const shareText = `I just got ${analysis.accessLevel.tier} tier access with OmniPass! 🚀 My cross-chain DeFi activity analysis shows $${analysis.totalValueLocked.toLocaleString()} TVL across multiple protocols.`;
    
    if (navigator.share) {
      navigator.share({
        title: 'OmniPass Credential',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Credential details copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">OmniPass</h1>
                <p className="text-sm text-gray-600">Cross-Chain Identity & Access Control</p>
              </div>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/demo" className="text-gray-600 hover:text-gray-900 font-medium">
                Demo
              </Link>
              <ConnectWallet />
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          // Welcome Section
          <div className="text-center py-16">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Universal Access Control for Web3
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Analyze your cross-chain DeFi activity to generate dynamic access credentials. 
                Get verified based on your on-chain reputation across multiple protocols.
              </p>
              <ConnectWallet />
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Network className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cross-Chain Analysis</h3>
                <p className="text-gray-600">
                  Analyze activity across Ethereum, BSC, Polygon and more to build comprehensive reputation
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
                <p className="text-gray-600">
                  Get detailed explanations of your DeFi activity and risk assessment with transparent AI analysis
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dynamic Access Control</h3>
                <p className="text-gray-600">
                  Generate verifiable credentials that unlock access to exclusive protocols and opportunities
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Connected State
          <div className="space-y-8">
            {!analysis && !loading && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Analyze Your Cross-Chain Activity
                </h2>
                <p className="text-gray-600 mb-6">
                  We will examine your DeFi positions across multiple chains to generate your access credential
                </p>
                <button
                  onClick={handleAnalyze}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Start Analysis
                </button>
              </div>
            )}

            {loading && (
              <div className="py-16">
                <LoadingSpinner size="lg" message="Analyzing your cross-chain activity..." />
                <div className="text-center mt-6 space-y-2">
                  <p className="text-sm text-gray-600">✓ Connecting to Ethereum network</p>
                  <p className="text-sm text-gray-600">✓ Fetching Aave lending positions</p>
                  <p className="text-sm text-gray-600">✓ Analyzing BSC Venus protocol data</p>
                  <p className="text-sm text-gray-600 animate-pulse">🤖 Running AI analysis...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-800 mb-4">{error}</p>
                <button
                  onClick={handleAnalyze}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            )}

            {analysis && (
              <div className="space-y-8">
                <AnalysisResults analysis={analysis} />
                <CredentialDisplay 
                  accessLevel={analysis.accessLevel}
                  address={analysis.address}
                  onDownload={handleDownloadCredential}
                  onShare={handleShareCredential}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 OmniPass. Built for cross-chain DeFi reputation.</p>
            <p className="text-sm mt-2">
              Demo application - Not for production use
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
