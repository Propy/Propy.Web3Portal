import React, { useEffect } from 'react';
import Button from '@mui/material/Button';

import { useWeb3Modal } from '@web3modal/wagmi/react'

import { useNetwork } from 'wagmi'

import { PropsFromRedux } from '../containers/NetworkSelectDropdownContainer';

import EthLogo from '../assets/img/eth.png';
import ArbitrumLogo from '../assets/img/arbitrum.png';
import { SupportedNetworks } from '../interfaces';

import {
  NETWORK_ID_TO_NAME,
} from '../utils/constants'

const NetworkSelectDropdown = (props: PropsFromRedux) => {

  let {
    activeNetwork,
    setActiveNetwork,
  } = props;

  const { chain } = useNetwork()

  const { open } = useWeb3Modal();

  useEffect(() => {
    if(chain) {
      console.log({chain})
      let networkName = NETWORK_ID_TO_NAME[chain.id];
      if(networkName) {
        setActiveNetwork(networkName as SupportedNetworks);
      } else {
        // setActiveNetwork('unsupported');
        open({ view: 'Networks' });
      }
    }
  }, [chain, setActiveNetwork, open]);

  return (
    <Button
      onClick={
        (e) => {
          open({ view: 'Networks' });
        }
      }
      variant={'text'}
      color={"inherit"}
    >
      {activeNetwork === 'ethereum' && 
        <>
          <img src={EthLogo} style={{height: 23, marginRight: 8}} alt="Ethereum Network" />
          Ethereum
        </>
      }
      {activeNetwork === 'arbitrum' && 
        <>
          <img src={ArbitrumLogo} style={{height: 23, marginRight: 8}} alt="Arbitrum Network" />
          Arbitrum
        </>
      }
    </Button>
  );
}

export default NetworkSelectDropdown;