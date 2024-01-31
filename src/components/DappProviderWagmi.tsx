import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'

import { WagmiConfig } from 'wagmi'
// import { arbitrum, mainnet } from 'viem/chains'
import { base, mainnet, sepolia, baseSepolia, goerli, baseGoerli } from 'wagmi/chains'
import BaseLogo from '../assets/img/base-web3modal-logo.png';
import PropyHouseOnlyLogo from '../assets/img/propy-house-only.png';

import AppContainer from '../containers/AppContainer';

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = '40a62032057258c14ebfdc9c25bfe42e'

// 2. Create wagmiConfig
const metadata = {
  name: 'Propy dApp',
  description: 'Interfacing with Propy\'s on-chain systems',
  url: 'https://dapp.propy.com',
  icons: [PropyHouseOnlyLogo]
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
  chainImages: {
    8453: BaseLogo,
  }
})

export default function DappProviderWagmi() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <AppContainer />
    </WagmiConfig>
  )
}