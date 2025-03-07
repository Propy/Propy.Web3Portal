import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { createWeb3Modal } from '@web3modal/wagmi/react'
// import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
// import { base, mainnet, sepolia, baseSepolia } from 'wagmi/chains'
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base, mainnet, sepolia, baseSepolia } from '@reown/appkit/networks';

import AppContainer from '../containers/AppContainer';

import PropyHouseOnlyLogo from '../assets/img/propy-house-only.png';

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = '32a05ca21db0679cb1e3e2601081e2f4'

// 2. Create wagmiConfig
const metadata = {
  name: 'Propy Onchain',
  description: 'Interfacing with Propy\'s onchain systems',
  url: 'https://dapp.propy.com?test=123',
  icons: [PropyHouseOnlyLogo]
}

const networks = 
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

const wagmiAdapter = new WagmiAdapter({
  networks: [...networks],
  projectId
})

// const config = defaultWagmiConfig({
//   chains,
//   projectId,
//   metadata,
//   auth: {
//     email: true,
//     socials: [
//       'x',
//       'google',
//       'github',
//       'discord',
//       'apple',
//       'facebook',
//       // 'farcaster'
//     ],
//     showWallets: true,
//     walletFeatures: true,
//   },
// })

// 3. Create modal
// createWeb3Modal({
//   wagmiConfig: config,
//   projectId,
//   enableAnalytics: true, // Optional - defaults to your Cloud configuration
//   enableOnramp: true, // Optional - false as default
// })
createAppKit({
  adapters: [wagmiAdapter],
  networks: [...networks],
  metadata: metadata,
  projectId,
  defaultNetwork: base,
  features: {
    analytics: true,
    onramp: true,
    swaps: false,
    socials: ['x', 'farcaster', 'google', 'github', 'discord', 'apple', 'facebook'],
    connectMethodsOrder: ['email', 'social', 'wallet'],
  },
  featuredWalletIds: [
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
  ]
 })

export default function DappProviderWagmi2() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppContainer />
      </QueryClientProvider>
    </WagmiProvider>
  )
}