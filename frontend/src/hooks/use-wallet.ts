import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { sepolia, polygonAmoy } from 'wagmi/chains'

export const useWallet = () => {
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  // Force Sepolia balance fetch with explicit chainId
  const { data: sepoliaBalance } = useBalance({
    address,
    chainId: sepolia.id, // 11155111 - Always fetch from Sepolia
    query: {
      enabled: !!address,
      staleTime: 0, // Don't use cached data
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  })

  // Force Polygon Amoy balance fetch
  const { data: amoyBalance } = useBalance({
    address,
    chainId: polygonAmoy.id, // 80002 - Always fetch from Polygon Amoy
    query: {
      enabled: !!address,
      staleTime: 0, // Don't use cached data  
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  })

  const connectWallet = async () => {
    const injectedConnector = connectors.find(c => c.type === 'injected')
    if (injectedConnector) {
      await connect({ connector: injectedConnector })
    }
  }

  return {
    address,
    isConnected,
    chainId,
    sepoliaBalance,
    amoyBalance,
    connectWallet,
    disconnect,
    connectors
  }
}
