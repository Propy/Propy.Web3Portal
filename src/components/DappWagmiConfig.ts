import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, bsc } from 'wagmi/chains'

export const config = createConfig({
  chains: [mainnet, sepolia, bsc],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [bsc.id]: http(),
  },
})