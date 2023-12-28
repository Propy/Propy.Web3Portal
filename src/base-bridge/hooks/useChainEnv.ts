type ChainEnv = 'mainnet' | 'testnet';

export function useChainEnv(): ChainEnv {
  return process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet';
}
