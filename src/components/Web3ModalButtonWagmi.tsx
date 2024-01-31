import { useWeb3Modal } from '@web3modal/wagmi1/react'
import { useAccount, useDisconnect } from 'wagmi'

import styled from 'styled-components'

import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';

import NetworkSelectDropdownContainer from '../containers/NetworkSelectDropdownContainer';

import {
  centerShortenLongString,
} from '../utils';

interface IWeb3ModalButtonProps {
  darkMode: boolean
  hideNetworkSwitch?: boolean
  overrideConnectText?: string
  variant?: "text" | "outlined" | "contained"
  color?: "primary" | "secondary" | "info" | "success" | "error"
}

export const Web3ModalButtonWagmi = (props: IWeb3ModalButtonProps) => {

  let {
    darkMode,
    hideNetworkSwitch = false,
    overrideConnectText,
    variant,
    color,
  } = props;

  // 4. Use modal hook
  const { open } = useWeb3Modal();
  const { 
    address,
    // isConnecting,
    // isDisconnected
  } = useAccount();
  const { disconnect } = useDisconnect()

  return (
    <>
      {!hideNetworkSwitch && address &&
        <div style={{marginRight: 16}}>
          <NetworkSelectDropdownContainer/>
        </div>
      }
      {address ? (
        <>
          <AccountChip style={darkMode ? {} : { backgroundColor: "#414141" }} onClick={() => open()} label={address ? centerShortenLongString(address, 10) : ""}/>
          <Button variant={variant ? variant : 'text'} color={color ? color : "inherit"} onClick={() => disconnect()}>Disconnect</Button>
        </>
      ) : (
        <Button variant={variant ? variant : 'text'} color={color ? color : "inherit"} onClick={() => open()}>{overrideConnectText ? overrideConnectText : "Connect"}</Button>
      )}
    </>
  )
}

const AccountChip = styled(Chip)`
  margin-right: 15px;
  color: white;
`