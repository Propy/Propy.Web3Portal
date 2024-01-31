import { createWeb3Modal, EIP6963Connector } from '@web3modal/wagmi1/react'
import { walletConnectProvider } from '@web3modal/wagmi1'
import { publicProvider } from 'wagmi/providers/public'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

import { WagmiConfig, createConfig, configureChains } from 'wagmi'
// import { arbitrum, mainnet } from 'viem/chains'
import { base, mainnet, sepolia, baseSepolia } from 'wagmi/chains'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

import BaseLogo from '../assets/img/base-web3modal-logo.png';
import PropyHouseOnlyLogo from '../assets/img/propy-house-only.png';

import AppContainer from '../containers/AppContainer';

import {
  NETWORK_ID_TO_RPC,
} from '../utils/constants';

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
  ];

const { chains: configuredChains, publicClient } = configureChains(
  chains,
  [jsonRpcProvider({
    rpc: (chain) => {
      let rpcUrl = NETWORK_ID_TO_RPC[chain.id] || "";
      return {
        http: rpcUrl,
      }
    },
  }), walletConnectProvider({ projectId }), publicProvider()]
)

// const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({ chains, options: { shimDisconnect: true } }),
    new WalletConnectConnector({ chains, options: { projectId, showQrModal: false, metadata } }),
    new EIP6963Connector({ chains }),
    new CoinbaseWalletConnector({ chains, options: { appName: metadata.name } })
  ],
  publicClient
})

// 3. Create modal
createWeb3Modal({ 
  wagmiConfig,
  projectId,
  chains: configuredChains,
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