import React, { useEffect } from 'react';

import { animated, useSpring } from '@react-spring/web'

import { toast } from 'sonner';

import { useAccount, useSwitchChain } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'

import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import NetworkGraphic from '../assets/img/network-icon-compressed.png';
import WalletIcon from '@mui/icons-material/AccountBalanceWallet';

import NetworkSelectDropdownContainer from '../containers/NetworkSelectDropdownContainer';

import {
  GLOBAL_PAGE_HEIGHT,
  NETWORK_NAME_TO_DISPLAY_NAME,
  NETWORK_NAME_TO_ID,
} from '../utils/constants';

import { PropsFromRedux } from '../containers/NetworkSelectDropdownContainer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column'
    },
    title: {
      fontWeight: '500',
      marginBottom: theme.spacing(1),
      // color: 'white',
    },
    sectionSpacer: {
      marginBottom: theme.spacing(4),
    },
    sectionSpacerSmall: {
      marginBottom: theme.spacing(2),
    },
    mainGraphic: {
      width: 250,
      height: 250,
      opacity: 0.15
    },
  }),
);

interface INetworkGate {
  children: React.ReactElement,
  requiredNetwork: string,
  onlyGateConnected?: boolean,
  requireConnected?: boolean,
}

export const NetworkGate = (props: PropsFromRedux & INetworkGate) => {

  let {
    children,
    activeNetwork,
    requiredNetwork,
    onlyGateConnected,
    requireConnected,
  } = props;

  const classes = useStyles();

  const { error, isPending, switchChain } = useSwitchChain();

  const { 
    address,
  } = useAccount();

  useEffect(() => {
    console.log({error})
    if(error) {
      let appendMessage = '';
      if(error.message.indexOf("pending") > -1) {
        appendMessage = " Please check for a pending network switch request inside your wallet.";
      }
      //@ts-ignore
      toast.error((error?.shortMessage ? error?.shortMessage : error.message) + appendMessage);
    }
  }, [error])

  const { open } = useWeb3Modal();

  const connectSpring = useSpring({
    from: {
      opacity: 0,
      transform: 'rotate(-22deg)',
    },
    to: {
      opacity: !address ? 1 : 0,
      transform: !address ? 'rotate(0deg)' : 'rotate(-22deg)',
    },
  })

  const chainSpring = useSpring({
    from: {
      opacity: 0,
      transform: 'rotate(-22deg)',
    },
    to: {
      opacity: !address ? 0 : 1,
      transform: !address ? 'rotate(-22deg)' : 'rotate(0deg)',
    },
  })

  return (
    <>
      {(requireConnected && !onlyGateConnected && !address) &&
        <div className={classes.root} style={{minHeight: GLOBAL_PAGE_HEIGHT, width: '100%'}}>
          <animated.div className={classes.sectionSpacer} style={connectSpring}>
            <WalletIcon className={classes.mainGraphic} />
          </animated.div>
          <Typography variant="h4" style={{textAlign: 'center'}} className={classes.title}>
            Connect Wallet
          </Typography>
          <Typography style={{textAlign: 'center'}} variant="h6" className={[classes.sectionSpacerSmall, "secondary-text-light-mode", "light-text"].join(" ")}>
            Please connect your wallet to continue
          </Typography>
          <Button variant={'outlined'} color={"primary"} onClick={() => open()}>{"Connect Wallet"}</Button>
        </div>
      }
      {(requiredNetwork !== activeNetwork) && ((onlyGateConnected && address) || (!onlyGateConnected && address)) &&
        <div className={classes.root} style={{minHeight: GLOBAL_PAGE_HEIGHT, width: '100%'}}>
          <animated.div className={classes.sectionSpacer} style={chainSpring}>
            <img className={classes.mainGraphic} src={NetworkGraphic} alt="Network Graphic"/>
          </animated.div>
          <Typography style={{textAlign: 'center'}} variant="h4" className={classes.title}>
            Network Checkpoint
          </Typography>
          <Typography style={{textAlign: 'center'}} variant="h6" className={[classes.sectionSpacerSmall, "secondary-text-light-mode", "light-text"].join(" ")}>
            Please switch to {NETWORK_NAME_TO_DISPLAY_NAME[requiredNetwork]} to continue
          </Typography>
          <NetworkSelectDropdownContainer color={"primary"} switchMode={true} isLoading={isPending} onClickOverride={() => switchChain && switchChain({chainId: NETWORK_NAME_TO_ID[requiredNetwork]})} />
        </div>
      }
      {((requiredNetwork === activeNetwork) || (onlyGateConnected && !address)) && ((requireConnected && address) || (!requireConnected && !address) || (onlyGateConnected && address)) &&
        <>
          {children}
        </>
      }
    </>
  )
}