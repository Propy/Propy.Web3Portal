import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'

import { WagmiConfig } from 'wagmi'
// import { arbitrum, mainnet } from 'viem/chains'
import { arbitrum, mainnet } from 'wagmi/chains'

import AppContainer from '../containers/AppContainer';

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = 'f230464ddad38c3d4ab987793e5d2b64'

// 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [mainnet, arbitrum]
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