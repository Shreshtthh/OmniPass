'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAccount } from 'wagmi';
import AnalysisResults from '@/app/components/AnalysisResults';
import CredentialDisplay from '@/app/components/CredentialDisplay';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { CrossChainAnalysis } from '@/types';
import { Zap, Shield } from 'lucide-react';
import Link from 'next/link';

// Dynamically import to prevent hydration issues
const DynamicConnectWallet = dynamic(() => import('@/app/components/ConnectWallet'), {
  ssr: false,
  loading: () => <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
});

// CORRECTED API service with proper endpoint
const APIService = {
  analyzeUser: async (address: string): Promise<{ success: boolean; data?: CrossChainAnalysis; error?: string }> => {
    try {
      // CORRECTED: /api/analysis instead of /api/analyze
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/analysis/${address}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      // Backend returns {success: true, data: analysis}, so we need responseData.data
      return { success: true, data: responseData.data };
    } catch (error) {
      console.error("API Service Error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to fetch analysis from the server." 
      };
    }
  }
};

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [analysis, setAnalysis] = useState<CrossChainAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAnalyze = async () => {
    if (!address) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);
    
    try {
      const response = await APIService.analyzeUser(address);
      
      if (response.success && response.data) {
        setAnalysis(response.data);
      } else {
        setError(response.error || 'Analysis failed. Please try again.');
      }
    } catch (err) {
      setError('Failed to connect to the analysis service. Please check if your backend is running.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCredential = () => {
    if (!analysis) return;
    
    const credential = {
      address: analysis.address,
      accessLevel: analysis.accessLevel,
      riskScore: analysis.riskScore,
      activityScore: analysis.activityScore,
      totalValueLocked: analysis.totalValueLocked,
      timestamp: new Date().toISOString(),
      chains: analysis.chains.map(chain => ({
        chainId: chain.chainId,
        name: chain.name,
        tvl: chain.tvl
      }))
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

  const handleShareCredential = async () => {
    if (!analysis) return;
    
    const shareText = `🔐 My OmniPass Credential:\n\n` +
      `Access Level: ${analysis.accessLevel.tier}\n` +
      `Risk Score: ${analysis.riskScore}/100\n` +
      `Activity Score: ${analysis.activityScore}/100\n` +
      `Total Value Locked: $${analysis.totalValueLocked.toFixed(2)}\n` +
      `Active on ${analysis.chains.length} chains\n\n` +
      `Generated via OmniPass Cross-Chain Analysis`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My OmniPass Credential',
          text: shareText,
        });
      } catch (err) {
        console.log('Error sharing:', err);
        fallbackShare(shareText);
      }
    } else {
      fallbackShare(shareText);
    }
  };

  const fallbackShare = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Credential details copied to clipboard!');
    }).catch(() => {
      alert('Unable to copy to clipboard. Please copy manually.');
    });
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
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
              <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">
                Home
              </Link>
              <DynamicConnectWallet />
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
                Analyze your cross-chain DeFi activity on Sepolia and Amoy testnets to generate dynamic access credentials.
              </p>
              <DynamicConnectWallet />
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
                  Our backend analysis engine will scan your on-chain activity across Sepolia and Amoy testnets to generate your access credential.
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
                <LoadingSpinner size="lg" message="Analyzing your on-chain data..." />
                 <div className="text-center mt-6 space-y-2 text-sm text-gray-600">
                    <p>Scanning your activity across Sepolia and Amoy testnets...</p>
                    <p>This may take a moment as we analyze your cross-chain interactions.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-800 mb-4">{error}</p>
                <button
                  onClick={handleAnalyze}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg"
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
    </div>
  );
}
