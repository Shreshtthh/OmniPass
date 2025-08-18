import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers'; 

const inter = Inter({ subsets: ['latin'] });

// Use the Metadata API for title, description, and icons
export const metadata: Metadata = {
  title: 'OmniPass - Cross-Chain Identity & Access Control',
  description: "A universal access control system that analyzes users' cross-chain activity",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap the children with the Providers component */}
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
