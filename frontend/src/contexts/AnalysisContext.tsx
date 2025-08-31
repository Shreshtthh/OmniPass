// src/contexts/AnalysisContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAnalysis } from '@/hooks/use-analysis';
import { OmniPassAPI } from '@/lib/api';
import { useToast } from "@/components/ui/use-toast"; // ✅ Fixed import

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
  const { toast } = useToast(); // ✅ Added hook call
  const [showResults, setShowResults] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const analyzeWallet = useCallback(async (address: string) => {
    try {
      await hookAnalyzeWallet(address);
      setShowResults(true);
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
        
        // ✅ Enhanced success toast with transaction link
        toast({
          title: "Success! 🎉",
          description: "Your OmniPass Credential has been issued on ZetaChain!",
          duration: 6000,
          action: (
            <div className="flex space-x-2">
              <button
                onClick={() => window.open(`https://zetachain-testnet.blockscout.com/tx/${response.transactionHash}`, '_blank')}
                className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary/90"
              >
                View Transaction
              </button>
              <button
                onClick={() => window.location.href = '/demo'}
                className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
              >
                View Benefits
              </button>
            </div>
          ),
        });
      } else {
        throw new Error(response.error || 'Failed to issue credential');
      }
    } catch (err: any) {
      console.error('❌ Credential issuance failed:', err);
      
      // ✅ Replace alert with toast error
      toast({
        title: "Error",
        description: `Issuance failed: ${err.message}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsIssuing(false);
    }
  }, [toast]); // ✅ Added toast to dependencies

  const resetAnalysis = useCallback(() => {
    setShowResults(false);
    setTxHash(null);
    localStorage.removeItem('omnipass_analysis_completed');
  }, []);

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
