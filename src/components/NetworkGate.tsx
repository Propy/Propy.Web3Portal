import React, { useEffect } from 'react';

import { animated, useSpring } from '@react-spring/web'

import { toast } from 'sonner';

import { useAccount, useSwitchChain } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'

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

import {
  SupportedNetworks,
} from '../interfaces';

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
    multiNetworkSwitchContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    multiNetworkSwitchEntry: {
      marginRight: theme.spacing(1),
      marginLeft: theme.spacing(1),
    }
  }),
);

interface INetworkGateBase {
  children: React.ReactElement;
  onlyGateConnected?: boolean;
  requireConnected?: boolean;
}

interface INetworkGateSingle extends INetworkGateBase {
  requiredNetwork: string;
  requiredNetworks?: never;
}

interface INetworkGateMultiple extends INetworkGateBase {
  requiredNetwork?: never;
  requiredNetworks: SupportedNetworks[];
}

type INetworkGate = INetworkGateSingle | INetworkGateMultiple;

export const NetworkGate = (props: PropsFromRedux & INetworkGate) => {

  let {
    children,
    activeNetwork,
    requiredNetwork,
    requiredNetworks,
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

  const { open } = useAppKit();

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
      {requiredNetwork && (requiredNetwork !== activeNetwork) && ((onlyGateConnected && address) || (!onlyGateConnected && address)) &&
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
      {requiredNetworks && (requiredNetworks.indexOf(activeNetwork) === -1) && ((onlyGateConnected && address) || (!onlyGateConnected && address)) &&
        <div className={classes.root} style={{minHeight: GLOBAL_PAGE_HEIGHT, width: '100%'}}>
          <animated.div className={classes.sectionSpacer} style={chainSpring}>
            <img className={classes.mainGraphic} src={NetworkGraphic} alt="Network Graphic"/>
          </animated.div>
          <Typography style={{textAlign: 'center'}} variant="h4" className={classes.title}>
            Network Checkpoint
          </Typography>
          <Typography style={{textAlign: 'center'}} variant="h6" className={[classes.sectionSpacerSmall, "secondary-text-light-mode", "light-text"].join(" ")}>
            Please switch to {
              requiredNetworks.map((requiredNetworkEntry, index) => {
                if(index === 0) {
                  return NETWORK_NAME_TO_DISPLAY_NAME[requiredNetworkEntry]
                } else if ((index > 0) && (index < (requiredNetworks.length - 1))) {
                  return `, ${NETWORK_NAME_TO_DISPLAY_NAME[requiredNetworkEntry]}`
                } else {
                  return ` or ${NETWORK_NAME_TO_DISPLAY_NAME[requiredNetworkEntry]}`
                }
              })
            } to continue
          </Typography>
          <div className={classes.multiNetworkSwitchContainer}>
            {
              requiredNetworks.map((requiredNetworkEntry) => {
                return (
                  <div className={classes.multiNetworkSwitchEntry}>
                    <NetworkSelectDropdownContainer switchMode={false} overrideActiveNetwork={requiredNetworkEntry} isLoading={isPending} onClickOverride={() => switchChain && switchChain({chainId: NETWORK_NAME_TO_ID[requiredNetworkEntry]})} />
                  </div>
                )
              })
            }
          </div>
        </div>
      }
      {((requiredNetwork === activeNetwork || (requiredNetworks && requiredNetworks.indexOf(activeNetwork) > -1)) || (onlyGateConnected && !address)) && ((requireConnected && address) || (!requireConnected && !address) || (onlyGateConnected && address)) &&
        <>
          {children}
        </>
      }
    </>
  )
}