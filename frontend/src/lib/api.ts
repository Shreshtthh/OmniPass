const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface AnalysisResponse {
  success: boolean;
  data?: {
    address: string;
    totalValueLocked: number;
    riskScore: number;
    activityScore: number;
    diversificationScore: number;
    chains: Array<{
      name: string;
      chainId: number;
      tvl: number;
      protocols: Array<{
        name: string;
        tvl: number;
        positions: number;
        healthFactor?: number;
      }>;
    }>;
    aiInsights: {
      summary: string;
      reasoning: string[];
      recommendations: string[];
      riskFactors: string[];
    };
    accessLevel: {
      tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
      qualifiesForAccess: boolean;
      requiredTVL?: number;
      requiredScore?: number;
    };
  };
  error?: string;
  processingTime: number;
}

// Custom error class for better error handling
class ApiError extends Error {
  status: number;
  response: Response;
  
  constructor(message: string, status: number, response: Response) {
    super(message);
    this.status = status;
    this.response = response;
    this.name = 'ApiError';
  }
}

export class OmniPassAPI {
  private static async handleResponse<T>(response: Response): Promise<T> {
    // Check if response is ok
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      // Try to get error details from response body
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new ApiError(errorMessage, response.status, response);
    }

    // Parse JSON response
    try {
      return await response.json();
    } catch (error) {
      throw new Error('Failed to parse response as JSON');
    }
  }

  static async analyzeWallet(address: string): Promise<AnalysisResponse> {
    try {
      // Validate address format
      if (!address || !address.startsWith('0x') || address.length !== 42) {
        throw new Error('Invalid wallet address format');
      }

      const response = await fetch(`${API_BASE_URL}/api/analysis/${address}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout handling
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      const data = await this.handleResponse<AnalysisResponse>(response);
      console.log('✅ Analysis response:', data);
      return data;
      
    } catch (error) {
      console.error('❌ API Error:', error);
      
      // Provide user-friendly error messages
      if (error instanceof ApiError) {
        switch (error.status) {
          case 400:
            throw new Error('Invalid wallet address provided');
          case 404:
            throw new Error('Wallet not found or no DeFi activity detected');
          case 429:
            throw new Error('Too many requests. Please try again later');
          case 500:
            throw new Error('Server error. Please try again later');
          default:
            throw new Error(`Analysis failed: ${error.message}`);
        }
      }
      
      if (error.name === 'TimeoutError') {
        throw new Error('Request timed out. Please try again');
      }
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to server. Please check your connection');
      }
      
      throw error;
    }
  }

  static async issueCredential(address: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analysis/issue-credential/${address}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(15000),
      });

      return await this.handleResponse(response);
      
    } catch (error) {
      console.error('❌ Credential issuance error:', error);
      throw new Error('Failed to issue credential. Please try again');
    }
  }

  static async getHealthStatus(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analysis/health`, {
        signal: AbortSignal.timeout(5000),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('❌ Health check error:', error);
      throw new Error('Unable to check API health');
    }
  }

  static async getSupportedChains(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analysis/chains`, {
        signal: AbortSignal.timeout(5000),
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('❌ Chains fetch error:', error);
      throw new Error('Unable to fetch supported chains');
    }
  }
}
