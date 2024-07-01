import { WagmiProvider } from 'wagmi'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { base, mainnet, sepolia, baseSepolia } from 'wagmi/chains'

import AppContainer from '../containers/AppContainer';

import PropyHouseOnlyLogo from '../assets/img/propy-house-only.png';

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = '40a62032057258c14ebfdc9c25bfe42e'

// 2. Create wagmiConfig
const metadata = {
  name: 'Propy dApp',
  description: 'Interfacing with Propy\'s onchain systems',
  url: 'https://dapp.propy.com',
  icons: [PropyHouseOnlyLogo]
}

const chains = 
  process?.env?.REACT_APP_ENV === 'prod' ? [
    mainnet,
    base,
  ] as const :
  [
    mainnet,
    base,
    sepolia,
    baseSepolia,
  ] as const;

const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
})

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true // Optional - false as default
})

export default function DappProviderWagmi2() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppContainer />
      </QueryClientProvider>
    </WagmiProvider>
  )
}