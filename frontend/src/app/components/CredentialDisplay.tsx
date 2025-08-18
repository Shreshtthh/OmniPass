import { AccessLevel } from '@/types';
import { getTierColor, getTierIcon, formatAddress } from '@/lib/utils';
import { Download, Eye, Share2, Shield } from 'lucide-react';
import Link from 'next/link';

interface CredentialDisplayProps {
  accessLevel: AccessLevel;
  address: string;
  onDownload?: () => void;
  onShare?: () => void;
}

export default function CredentialDisplay({ 
  accessLevel, 
  address, 
  onDownload, 
  onShare 
}: CredentialDisplayProps) {
  if (!accessLevel.qualifiesForAccess) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-red-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Not Granted</h3>
          <p className="text-gray-600 mb-4">
            Your current DeFi activity does not meet the minimum requirements for access.
          </p>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-800">
              Required: ${accessLevel.requiredTVL?.toLocaleString() || '1,000'} minimum TVL
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Credential Generated</h3>
        <p className="text-gray-600">Your cross-chain DeFi activity has been verified</p>
      </div>

      {/* Credential Card */}
      <div className={`bg-gradient-to-br ${getTierColor(accessLevel.tier)} p-6 rounded-lg text-white mb-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getTierIcon(accessLevel.tier)}</span>
            <span className="text-xl font-bold">{accessLevel.tier}</span>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">OmniPass</p>
            <p className="text-xs opacity-75">Cross-Chain Credential</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm opacity-90">Wallet Address</p>
          <p className="font-mono text-lg">{formatAddress(address)}</p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-90">Valid Until</span>
            <span>{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <Link 
          href="/demo"
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          <Eye className="w-4 h-4" />
          <span>Try Demo</span>
        </Link>
        
        <button
          onClick={onDownload}
          className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
        
        <button
          onClick={onShare}
          className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Credential Details */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Credential Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Tier Level</p>
            <p className="font-medium">{accessLevel.tier}</p>
          </div>
          <div>
            <p className="text-gray-600">Status</p>
            <p className="font-medium text-green-600">Active</p>
          </div>
          <div>
            <p className="text-gray-600">Issued</p>
            <p className="font-medium">{new Date().toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Protocol</p>
            <p className="font-medium">OmniPass v1.0</p>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">How to Use Your Credential</h4>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Connect your wallet to supported applications</li>
          <li>2. Your credential will be automatically verified</li>
          <li>3. Enjoy {accessLevel.tier.toLowerCase()}-tier access and benefits</li>
        </ol>
      </div>
    </div>
  );
}