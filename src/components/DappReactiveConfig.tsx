import React, { useEffect } from 'react';
import { ChainId, useEthers, useUpdateConfig, MetamaskConnector, CoinbaseWalletConnector } from '@usedapp/core'

import AppContainer from '../containers/AppContainer';

import { PropsFromRedux } from '../containers/DappReactiveConfigContainer';

import { SupportedNetworks } from '../interfaces';

const DappReactiveConfig = (props: PropsFromRedux) => {

  let {
    activeNetwork,
  } = props;

  const { chainId, account, switchNetwork } = useEthers();

  const updateConfig = useUpdateConfig();

  useEffect(() => {
    const getActiveReadOnlyChainId = (activeNetwork: SupportedNetworks) => {
      if(activeNetwork === 'arbitrum') {
        return ChainId.Arbitrum;
      }
      return ChainId.Mainnet;
    }

    const mainnetReadOnlyUrl = () => {
      if (process.env.REACT_APP_QUICKNODE_RPC_URL_MAINNET) {
        return process.env.REACT_APP_QUICKNODE_RPC_URL_MAINNET;
      } else if(process.env.REACT_APP_INFURA_RPC_URL_MAINNET) {
        return `${process.env.REACT_APP_INFURA_RPC_URL_MAINNET}`;
      } else if(process.env.REACT_APP_ALCHEMY_RPC_URL_MAINNET) {
        return `${process.env.REACT_APP_ALCHEMY_RPC_URL_MAINNET}`;
      }
      return '';
    }
    
    const arbitrumReadOnlyUrl = () => {
      if(process.env.REACT_APP_QUICKNODE_RPC_URL_ARBITRUM) {
        return `${process.env.REACT_APP_QUICKNODE_RPC_URL_ARBITRUM}`;
      } else if(process.env.REACT_APP_INFURA_RPC_URL_ARBITRUM) {
        return `${process.env.REACT_APP_INFURA_RPC_URL_ARBITRUM}`;
      } else if(process.env.REACT_APP_ALCHEMY_RPC_URL_ARBITRUM) {
        return `${process.env.REACT_APP_ALCHEMY_RPC_URL_ARBITRUM}`;
      }
      return '';
    }

    const handleConnectedAccountNetworkSwitch = async (activeNetwork: SupportedNetworks) => {
      if(account && activeNetwork === 'arbitrum') {
        if(chainId !== ChainId.Arbitrum) {
          try {
            await switchNetwork(ChainId.Arbitrum)
          } catch (e) {
            console.log({e})
          }
        }
      } else if(account && chainId !== ChainId.Mainnet) {
        try {
          await switchNetwork(ChainId.Mainnet)
        } catch (e) {
          console.log({e})
        }
      }
    }

    if(!account) {
      updateConfig({
        readOnlyChainId: getActiveReadOnlyChainId(activeNetwork),
        readOnlyUrls: {
          [ChainId.Mainnet]: mainnetReadOnlyUrl(),
          [ChainId.Arbitrum]: arbitrumReadOnlyUrl(),
        },
        autoConnect: true,
        // noMetamaskDeactivate: true,
        connectors: {
          metamask: new MetamaskConnector(),
          coinbase: new CoinbaseWalletConnector(),
        },
      });
    } else {
      handleConnectedAccountNetworkSwitch(activeNetwork);
    }
  }, [activeNetwork, chainId, updateConfig, switchNetwork, account])

  return (
    <AppContainer />
  )
}

export default DappReactiveConfig;