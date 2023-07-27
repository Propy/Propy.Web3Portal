import React from 'react';
import { ChainId, DAppProvider } from '@usedapp/core'

import DappReactiveConfigContainer from '../containers/DappReactiveConfigContainer';

import { PropsFromRedux } from '../containers/DappProviderContainer';

const DappProvider = (props: PropsFromRedux) => {

  let {
    activeNetwork,
  } = props;

  const getActiveReadOnlyChainId = () => {
    if(activeNetwork === 'arbitrum') {
      return ChainId.Arbitrum;
    }
    return ChainId.Mainnet;
  }

  const mainnetReadOnlyUrl = () => {
    if(process.env.REACT_APP_INFURA_RPC_URL_MAINNET) {
      return `${process.env.REACT_APP_INFURA_RPC_URL_MAINNET}`;
    } else if(process.env.REACT_APP_ALCHEMY_RPC_URL_MAINNET) {
      return `${process.env.REACT_APP_ALCHEMY_RPC_URL_MAINNET}`;
    }
    return '';
  }
  
  const arbitrumReadOnlyUrl = () => {
    if(process.env.REACT_APP_INFURA_RPC_URL_ARBITRUM) {
      return `${process.env.REACT_APP_INFURA_RPC_URL_ARBITRUM}`;
    } else if(process.env.REACT_APP_ALCHEMY_RPC_URL_ARBITRUM) {
      return `${process.env.REACT_APP_ALCHEMY_RPC_URL_ARBITRUM}`;
    }
    return '';
  }
  
  const config = {
    readOnlyChainId: getActiveReadOnlyChainId(),
    readOnlyUrls: {
      [ChainId.Mainnet]: mainnetReadOnlyUrl(),
      [ChainId.Arbitrum]: arbitrumReadOnlyUrl(),
    },
    autoConnect: true,
  }

  return (
    <DAppProvider config={config}>
      <DappReactiveConfigContainer />
    </DAppProvider>
  )
}

export default DappProvider;