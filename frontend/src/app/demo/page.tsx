'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import ConnectWallet from '@/app/components/ConnectWallet';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { APIService } from '@/lib/api';
import { CrossChainAnalysis } from '@/types';
import { Lock, Unlock, Star, Crown, Gift, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DemoPage() {
  const { address, isConnected } = useAccount();
  const [analysis, setAnalysis] = useState<CrossChainAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);

  useEffect(() => {
    if (address && isConnected) {
      loadAnalysis();
    }
  }, [address, isConnected]);

  const loadAnalysis = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const response = await APIService.analyzeUser(address);
      if (response.success && response.data) {
        setAnalysis(response.data);
      }
    } catch (error) {
      console.error('Failed to load analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const contentTiers = [
    {
      id: 'basic',
      title: 'Basic DeFi Guide',
      description: 'Introduction to decentralized finance',
      tier: 'BRONZE',
      icon: <Gift className="w-6 h-6" />,
      content: 'Welcome to DeFi! This guide covers the basics of yield farming, lending protocols, and how to get started safely.',
      unlocked: true
    },
    {
      id: 'advanced',
      title: 'Advanced Yield Strategies',
      description: 'Complex farming and arbitrage techniques',
      tier: 'SILVER',
      icon: <Star className="w-6 h-6" />,
      content: 'Learn about advanced strategies like delta-neutral farming, cross-chain arbitrage, and automated yield optimization.',
      unlocked: analysis?.accessLevel.tier && ['SILVER', 'GOLD', 'PLATINUM'].includes(analysis.accessLevel.tier)
    },
    {
      id: 'exclusive',
      title: 'Exclusive Alpha Research',
      description: 'Premium insights and early access',
      tier: 'GOLD',
      icon: <Crown className="w-6 h-6" />,
      content: 'Get access to exclusive research reports, early token access, and alpha opportunities from our premium research team.',
      unlocked: analysis?.accessLevel.tier && ['GOLD', 'PLATINUM'].includes(analysis.accessLevel.tier)
    },
    {
      id: 'vip',
      title: 'VIP Community & Events',
      description: 'Private community and exclusive events',
      tier: 'PLATINUM',
      icon: <Zap className="w-6 h-6" />,
      content: 'Join our exclusive VIP community with direct access to founders, private events, and first access to new products.',
      unlocked: analysis?.accessLevel.tier === 'PLATINUM'
    }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return 'from-purple-500 to-purple-700';
      case 'GOLD': return 'from-yellow-500 to-yellow-700';
      case 'SILVER': return 'from-gray-400 to-gray-600';
      default: return 'from-orange-400 to-orange-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">Demo Access Portal</h1>
            </div>
            <ConnectWallet />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="text-center py-16">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet to Access Content</h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to see what content your DeFi activity unlocks
            </p>
            <ConnectWallet />
          </div>
        ) : loading ? (
          <div className="py-16">
            <LoadingSpinner size="lg" message="Verifying your access credentials..." />
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Status */}
            {analysis && (
              <div className="bg-white rounded-xl shadow-lg p-6 border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Your Access Level</h2>
                  <div className={`bg-gradient-to-r ${getTierColor(analysis.accessLevel.tier)} text-white px-4 py-2 rounded-lg font-semibold`}>
                    {analysis.accessLevel.tier}
                  </div>
                </div>
                <p className="text-gray-600">
                  Based on your ${analysis.totalValueLocked.toLocaleString()} TVL across multiple chains, 
                  you have {analysis.accessLevel.tier.toLowerCase()}-tier access to the following content.
                </p>
              </div>
            )}

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contentTiers.map((content) => (
                <div key={content.id} className="bg-white rounded-xl shadow-lg border overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 bg-gradient-to-r ${getTierColor(content.tier)} rounded-lg flex items-center justify-center text-white`}>
                          {content.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{content.title}</h3>
                          <p className="text-sm text-gray-600">{content.description}</p>
                        </div>
                      </div>
                      {content.unlocked ? (
                        <Unlock className="w-5 h-5 text-green-600" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    <div className="mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getTierColor(content.tier)} text-white`}>
                        Requires {content.tier}
                      </span>
                    </div>

                    {content.unlocked ? (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-700">{content.content}</p>
                        <button
                          onClick={() => setSelectedContent(content.id)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Access Content
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-500">
                          Upgrade your tier to access this premium content
                        </p>
                        <div className="w-full bg-gray-200 text-gray-500 font-medium py-2 px-4 rounded-lg text-center">
                          Locked
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Content Modal */}
            {selectedContent && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {contentTiers.find(c => c.id === selectedContent)?.title}
                    </h3>
                    <button
                      onClick={() => setSelectedContent(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      {contentTiers.find(c => c.id === selectedContent)?.content}
                    </p>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-green-800 font-medium">🎉 Access Granted!</p>
                      <p className="text-green-700 text-sm">
                        Your {analysis?.accessLevel.tier} tier credential has been verified.
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedContent(null)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">How This Works</h3>
              <ul className="text-blue-800 space-y-1">
                <li>• Your wallets cross-chain DeFi activity determines your access tier</li>
                <li>• Higher TVL and better risk management = higher tier access</li>
                <li>• Credentials are generated dynamically based on real on-chain data</li>
                <li>• No manual verification or centralized approval needed</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}