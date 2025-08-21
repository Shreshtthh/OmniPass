import { CrossChainAnalysis } from '@/types';
import { formatCurrency, getScoreColor, getTierColor, getTierIcon } from '@/lib/utils';
import { BarChart3, Shield, Activity, PieChart, Brain } from 'lucide-react';

interface AnalysisResultsProps {
  analysis: CrossChainAnalysis;
}

export default function AnalysisResults({ analysis }: AnalysisResultsProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Cross-Chain Analysis</h2>
          <div className={`bg-gradient-to-r ${getTierColor(analysis.accessLevel.tier)} text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2`}>
            <span>{getTierIcon(analysis.accessLevel.tier)}</span>
            <span>{analysis.accessLevel.tier}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Total Value Locked</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(analysis.totalValueLocked)}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Risk Score</span>
            </div>
            <p className={`text-2xl font-bold ${getScoreColor(analysis.riskScore)}`}>
              {analysis.riskScore}/100
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Activity Score</span>
            </div>
            <p className={`text-2xl font-bold ${getScoreColor(analysis.activityScore)}`}>
              {analysis.activityScore}/100
            </p>
          </div>
        </div>
      </div>

      {/* Chain Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6 border">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <PieChart className="w-5 h-5" />
          <span>Chain Breakdown</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.chains.map((chain) => (
            <div key={chain.chainId} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{chain.name}</h4>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(chain.tvl)}
                </span>
              </div>
              
              <div className="space-y-2">
                {chain.protocols.map((protocol, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{protocol.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{formatCurrency(protocol.tvl)}</span>
                      {protocol.healthFactor && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          protocol.healthFactor > 1.5 ? 'bg-green-100 text-green-800' : 
                          protocol.healthFactor > 1.2 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          HF: {protocol.healthFactor.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-xl shadow-lg p-6 border">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <span>AI Analysis</span>
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
            <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{analysis.aiInsights.summary}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Key Insights</h4>
              <ul className="space-y-1">
                {analysis.aiInsights.reasoning.map((reason, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {analysis.aiInsights.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {analysis.aiInsights.riskFactors.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Risk Factors</h4>
              <ul className="space-y-1">
                {analysis.aiInsights.riskFactors.map((risk, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start space-x-2">
                    <span className="text-orange-500 mt-1">⚠</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Access Level */}
      <div className="bg-white rounded-xl shadow-lg p-6 border">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Access Qualification</h3>
        
        <div className={`p-4 rounded-lg ${
          analysis.accessLevel.qualifiesForAccess 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              analysis.accessLevel.qualifiesForAccess 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white'
            }`}>
              {analysis.accessLevel.qualifiesForAccess ? '✓' : '✗'}
            </div>
            <div>
              <p className={`font-semibold ${
                analysis.accessLevel.qualifiesForAccess ? 'text-green-800' : 'text-red-800'
              }`}>
                {analysis.accessLevel.qualifiesForAccess 
                  ? 'Access Granted' 
                  : 'Access Requirements Not Met'
                }
              </p>
              <p className="text-sm text-gray-600">
                {analysis.accessLevel.qualifiesForAccess 
                  ? `${analysis.accessLevel.tier} tier access approved`
                  : `Requires ${formatCurrency(analysis.accessLevel.requiredTVL || 1000)} TVL minimum`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}