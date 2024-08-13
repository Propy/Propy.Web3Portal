import React, { useCallback } from 'react';
import { useConnect } from 'wagmi';

import Typography from '@mui/material/Typography';

import { CoinbaseWalletLogo } from './CoinbaseWalletLogo';
 
const buttonStyles = {
  background: 'transparent',
  border: '1px solid transparent',
  // boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  color: 'white',
  backgroundColor: '#0052FF',
  paddingLeft: 8,
  paddingRight: 12,
  borderRadius: 15,
  cursor: 'pointer',
};
 
export function CoinbaseCreateWalletButton() {
  const { connectors, connect } = useConnect();
 
  const createWallet = useCallback(() => {
    const coinbaseWalletConnector = connectors.find(
      (connector) => connector.id === 'coinbaseWalletSDK'
    );
    if (coinbaseWalletConnector) {
      connect({ connector: coinbaseWalletConnector });
    }
  }, [connectors, connect]);
  return (
    <button style={buttonStyles} onClick={createWallet}>
      <CoinbaseWalletLogo containerStyles={{ marginRight: 4, paddingTop: 2 }} />
      <Typography variant="button">
        Create Wallet
      </Typography>
    </button>
  );
}