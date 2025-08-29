// @/hooks/use-analysis.ts
import { useState } from 'react';
import { OmniPassAPI } from '@/lib/api';

interface AnalysisState {
  analysis: any;
  loading: boolean;
  error: string | null;
}

// In your use-analysis.ts
export const useAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeWallet = async (address) => {
    try {
      console.log('🔍 Starting analysis for:', address);
      setLoading(true);
      setError(null);
      setAnalysis(null);
      
      const result = await OmniPassAPI.analyzeWallet(address);
      console.log('📊 API Response:', result);
      
      if (result.success && result.data) {
        console.log('✅ Setting analysis data:', result.data);
        setAnalysis(result.data);
      } else {
        console.error('❌ API returned no data:', result);
        throw new Error(result.error || 'Analysis failed - no data returned');
      }
    } catch (err) {
      console.error('❌ Analysis error:', err);
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
      console.log('🏁 Analysis complete');
    }
  };

  // Debug current state
  console.log('useAnalysis state:', { analysis: !!analysis, loading, error });

  return {
    analysis,
    loading,
    error,
    analyzeWallet
  };
};

