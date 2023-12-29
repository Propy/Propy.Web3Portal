import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'

import { WagmiConfig } from 'wagmi'
// import { arbitrum, mainnet } from 'viem/chains'
import { base, mainnet, sepolia, baseSepolia, goerli, baseGoerli } from 'wagmi/chains'

import AppContainer from '../containers/AppContainer';

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = '40a62032057258c14ebfdc9c25bfe42e'

// 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = 
  process?.env?.REACT_APP_ENV === 'prod' ? [
    mainnet,
    base,
  ] :
  [
    mainnet,
    base,
    sepolia,
    baseSepolia,
    goerli,
    baseGoerli,
  ];

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// 3. Create modal
createWeb3Modal({ 
  wagmiConfig,
  projectId,
  chains,
  themeMode: 'light',
  // chainImages: {
  //   1: EthLogo,
  //   42161: ArbitrumLogo
  // }
})

export default function DappProviderWagmi() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <AppContainer />
    </WagmiConfig>
  )
}