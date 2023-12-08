import React, { useEffect } from 'react';

import { toast } from 'sonner';

import { useAccount, useSwitchNetwork } from 'wagmi'

import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Typography from '@mui/material/Typography';

import NetworkGraphic from '../assets/svg/network_icon.svg'; 

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
      opacity: 0.15
    },
  }),
);

interface INetworkGate {
  children: React.ReactElement,
  requiredNetwork: string,
  onlyConnected?: boolean,
}

export const NetworkGate = (props: PropsFromRedux & INetworkGate) => {

  let {
    children,
    activeNetwork,
    requiredNetwork,
    onlyConnected,
  } = props;

  const classes = useStyles();

  const { error, isLoading, switchNetwork } = useSwitchNetwork();

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

  return (
    <>
      {(requiredNetwork !== activeNetwork) && ((onlyConnected && address) || !onlyConnected) &&
        <div className={classes.root} style={{minHeight: GLOBAL_PAGE_HEIGHT}}>
          <div className={classes.sectionSpacer}>
            <img className={classes.mainGraphic} src={NetworkGraphic} alt="Network Graphic"/>
          </div>
          <Typography variant="h4" className={classes.title}>
            Network Checkpoint
          </Typography>
          <Typography variant="h6" className={[classes.sectionSpacerSmall, "secondary-text-light-mode", "light-text"].join(" ")}>
            Please switch to {NETWORK_NAME_TO_DISPLAY_NAME[requiredNetwork]} to continue
          </Typography>
          <NetworkSelectDropdownContainer color={"primary"} switchMode={true} isLoading={isLoading} onClickOverride={() => switchNetwork && switchNetwork(NETWORK_NAME_TO_ID[requiredNetwork])} />
        </div>
      }
      {((requiredNetwork === activeNetwork) || (onlyConnected && !address)) &&
        <>
          {children}
        </>
      }
    </>
  )
}