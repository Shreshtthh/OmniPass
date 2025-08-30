// src/contexts/AnalysisContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAnalysis } from '@/hooks/use-analysis';
import { OmniPassAPI } from '@/lib/api';

interface AnalysisContextType {
  analysis: any;
  loading: boolean;
  error: string | null;
  showResults: boolean;
  isIssuing: boolean;
  txHash: string | null;
  analyzeWallet: (address: string) => Promise<void>;
  issueCredential: (address: string) => Promise<void>;
  resetAnalysis: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider = ({ children }: { children: React.ReactNode }) => {
  const { analysis, loading, error, analyzeWallet: hookAnalyzeWallet } = useAnalysis();
  const [showResults, setShowResults] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const analyzeWallet = useCallback(async (address: string) => {
    try {
      await hookAnalyzeWallet(address);
      setShowResults(true);
      // ✅ Persist to localStorage
      localStorage.setItem('omnipass_analysis_completed', 'true');
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  }, [hookAnalyzeWallet]);

  const issueCredential = useCallback(async (address: string) => {
    setIsIssuing(true);
    setTxHash(null);

    try {
      console.log('🏆 Issuing credential for:', address);
      const response = await OmniPassAPI.issueCredential(address);
      
      if (response.success && response.transactionHash) {
        setTxHash(response.transactionHash);
        alert('Success! Your OmniPass Credential has been issued on ZetaChain! 🎉');
      } else {
        throw new Error(response.error || 'Failed to issue credential');
      }
    } catch (err: any) {
      console.error('❌ Credential issuance failed:', err);
      alert(`Issuance failed: ${err.message}`);
    } finally {
      setIsIssuing(false);
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setShowResults(false);
    setTxHash(null);
    localStorage.removeItem('omnipass_analysis_completed');
  }, []);

  // ✅ Restore state on mount
  React.useEffect(() => {
    const wasCompleted = localStorage.getItem('omnipass_analysis_completed');
    if (wasCompleted && analysis) {
      setShowResults(true);
    }
  }, [analysis]);

  const value: AnalysisContextType = {
    analysis,
    loading,
    error,
    showResults,
    isIssuing,
    txHash,
    analyzeWallet,
    issueCredential,
    resetAnalysis,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysisContext = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysisContext must be used within an AnalysisProvider');
  }
  return context;
};
