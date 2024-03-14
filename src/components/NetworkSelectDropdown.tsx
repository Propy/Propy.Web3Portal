import React, { useEffect } from 'react';
import Button from '@mui/material/Button';

import { useWeb3Modal } from '@web3modal/wagmi1/react';

import { useNetwork } from 'wagmi';

import CircularProgress from '@mui/material/CircularProgress';

import { PropsFromRedux } from '../containers/NetworkSelectDropdownContainer';

import EthLogo from '../assets/img/ethereum-web3-modal.png';
import ArbitrumLogo from '../assets/img/arbitrum.png';
import BaseLogo from '../assets/img/base-logo-transparent-bg.png';

import { SupportedNetworks } from '../interfaces';

import {
  NETWORK_ID_TO_NAME,
  NETWORK_NAME_TO_DISPLAY_NAME,
} from '../utils/constants'

interface INetworkSelectButton {
  switchMode?: boolean
  onClickOverride?: () => void
  isLoading?: boolean
  color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning" | undefined
  width?: string
  showCompactNetworkSwitch?: boolean
}

const NetworkSelectDropdown = (props: PropsFromRedux & INetworkSelectButton) => {

  let {
    switchMode = false,
    activeNetwork,
    isLoading = false,
    setActiveNetwork,
    onClickOverride,
    color = "inherit",
    width = "auto",
    showCompactNetworkSwitch = false,
  } = props;

  const { chain } = useNetwork();

  const { open } = useWeb3Modal();

  useEffect(() => {
    if(chain) {
      console.log({chain})
      let networkName = NETWORK_ID_TO_NAME[chain.id];
      if(networkName) {
        setActiveNetwork(networkName as SupportedNetworks);
      } else {
        setActiveNetwork('unsupported');
      }
    }
  }, [chain, setActiveNetwork, open]);

  const activeNetworkToImage = (network: SupportedNetworks, showCompactNetworkSwitch: boolean) => {
    let networkImage;
    switch (network) {
      case 'ethereum':
        networkImage = EthLogo;
        break;
      case 'goerli':
        networkImage = EthLogo;
        break;
      case 'sepolia':
        networkImage = EthLogo;
        break;
      case 'arbitrum':
        networkImage = ArbitrumLogo;
        break;
      case 'base-sepolia':
        networkImage = BaseLogo;
        break;
      case 'base-goerli':
        networkImage = BaseLogo;
        break;
      case 'base':
        networkImage = BaseLogo;
        break;
    }
    if(networkImage && NETWORK_NAME_TO_DISPLAY_NAME[network]) {
      return <img src={networkImage} style={{height: 23, marginRight: showCompactNetworkSwitch ? 0 : 8, borderRadius: '50%'}} alt={`${NETWORK_NAME_TO_DISPLAY_NAME[network]} Network`} />;
    }
  }

  const getCircularProgressColor = (color: INetworkSelectButton["color"]) => {
    if(color === 'inherit') {
      return '#bdbdbd';
    }
    return "";
  }

  const getBorderColorClass = (color: INetworkSelectButton["color"]) => {
    if(color === 'inherit') {
      return "light-grey-border";
    }
    return "";
  }

  const getButtonInternalPaddingClass = (switchMode: boolean, showCompactNetworkSwitch: boolean) => {
    if(switchMode) {
      return '';
    }
    if(showCompactNetworkSwitch) {
      return 'outlined-icon-button-no-text';
    }
    return 'outlined-icon-button';
  }

  return (
    <Button
      onClick={
        (e) => {
          if(onClickOverride) {
            onClickOverride();
          } else {
            open({ view: 'Networks' });
          }
        }
      }
      variant={'outlined'}
      color={color}
      disabled={isLoading}
      style={{width: width, minWidth: showCompactNetworkSwitch ? 0 : 64}}
      className={[
        getBorderColorClass(color),
        getButtonInternalPaddingClass(switchMode, showCompactNetworkSwitch)
      ].join(" ")}
    >
      {switchMode && 
        <>
          {isLoading && <CircularProgress color="inherit" style={{height: '18px', width: '18px', marginRight: '8px', color: getCircularProgressColor(color)}} />}
          {isLoading ? `Check Wallet` : `Switch Network`}
        </>
      }
      {!switchMode && 
        <>
          {NETWORK_NAME_TO_DISPLAY_NAME[activeNetwork] && activeNetworkToImage(activeNetwork, showCompactNetworkSwitch) &&
            <>
              {activeNetworkToImage(activeNetwork, showCompactNetworkSwitch)}
              {showCompactNetworkSwitch ? '' : NETWORK_NAME_TO_DISPLAY_NAME[activeNetwork]}
            </>
          }
          {!(NETWORK_NAME_TO_DISPLAY_NAME[activeNetwork] && activeNetworkToImage(activeNetwork, showCompactNetworkSwitch)) &&
            <>
              Unsupported Network
            </>
          }
        </>
      }
    </Button>
  );
}

export default NetworkSelectDropdown;