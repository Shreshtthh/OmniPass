import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  }
  return num.toString();
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

export function getTierColor(tier: string): string {
  switch (tier) {
    case 'PLATINUM':
      return 'from-purple-500 to-purple-700';
    case 'GOLD':
      return 'from-yellow-500 to-yellow-700';
    case 'SILVER':
      return 'from-gray-400 to-gray-600';
    default:
      return 'from-orange-400 to-orange-600';
  }
}

export function getTierIcon(tier: string): string {
  switch (tier) {
    case 'PLATINUM':
      return '💎';
    case 'GOLD':
      return '🥇';
    case 'SILVER':
      return '🥈';
    default:
      return '🥉';
  }
}