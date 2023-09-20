import React, { useEffect, useState } from 'react'
import { useEthers, shortenAddress } from '@usedapp/core'
import styled from 'styled-components'
import Web3Modal from 'web3modal'

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

import WalletConnectProvider from '@walletconnect/web3-provider'

import NetworkSelectDropdownContainer from '../containers/NetworkSelectDropdownContainer';

interface IWeb3ModalButtonProps {
  darkMode: boolean
  hideNetworkSwitch?: boolean
}

export const Web3ModalButton = (props: IWeb3ModalButtonProps) => {
  const { account, activate, deactivate, chainId } = useEthers()
  const [activateError, setActivateError] = useState('')
  const { error } = useEthers()

  let {
    darkMode,
    hideNetworkSwitch = false,
  } = props;

  useEffect(() => {
    if (error) {
      // Temp workaround to avoid network changed error message until useDapp handles this internally
      if(error?.message?.indexOf('underlying network changed') === -1) {
        setActivateError(error.message)
      }
    }
  }, [error])

  useEffect(() => {
    // Can handle switches to unsupported chainId(s) here
    console.log("Current chainId", chainId);
  }, [chainId])

  useEffect(() => {
    console.log({account});
    if(account) {
      console.log("Run default account info scanning")
    } else {
      console.log("Clear account info from Redux")
    }
  }, [account])

  const activateProvider = async () => {
    const providerOptions = {
      injected: {
        display: {
          name: 'Metamask',
          description: 'Connect with the provider in your Browser',
        },
        package: null,
      },
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          bridge: 'https://bridge.walletconnect.org',
          infuraId: '0cdca40ec1c4459d8f1ecafd88c795d1',
        },
      },
    }

    const web3Modal = new Web3Modal({
      providerOptions,
    })
    
    try {
      const provider = await web3Modal.connect()
      await activate(provider)
    } catch(error: any) {
      setActivateError(error?.message)
    }
  }

  return (
    <Account>
      <ErrorWrapper>{activateError}</ErrorWrapper>
      {!hideNetworkSwitch &&
        <div style={{marginRight: 16}}>
          <NetworkSelectDropdownContainer/>
        </div>
      }
      {account ? (
        <>
          <AccountChip style={darkMode ? {} : { backgroundColor: "#414141" }} label={account ? shortenAddress(account) : ""}/>
          <Button color="inherit" onClick={() => deactivate()}>Disconnect</Button>
        </>
      ) : (
        <Button color="inherit" onClick={activateProvider}>Connect</Button>
      )}
    </Account>
  )
}

const ErrorWrapper = styled.div`
  color: #ff3960;
  margin-right: 40px;
  margin-left: 40px;
  overflow: auto;
`

const Account = styled.div`
  display: flex;
  align-items: center;
`

const AccountChip = styled(Chip)`
  margin-right: 15px;
  color: white;
`