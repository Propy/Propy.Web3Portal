import React, { useEffect, useState } from 'react';

import { PushAPI, CONSTANTS } from '@pushprotocol/restapi';

import {
  useEthersSigner
} from '../hooks';

import { useAccount } from 'wagmi';

import { toast } from 'sonner';

import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InboxIcon from '@mui/icons-material/Inbox';
import Menu from '@mui/material/Menu';
import LinkWrapper from './LinkWrapper';

import { ExternalLink } from './ExternalLink';

import FloatingActionButton from './FloatingActionButton';

import {
  PROPY_LIGHT_BLUE
} from '../utils/constants';

import {
  useUnifiedWriteContract,
} from '../hooks';

import { PropsFromRedux } from '../containers/PushNotificationZoneContainer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    margin: {
      margin: theme.spacing(1),
    },
    notificationIndicator: {
      height: '10px',
      width: '10px',
      position: 'absolute',
      backgroundColor: PROPY_LIGHT_BLUE,
      borderRadius: '50%',
      top: '11px',
      left: '11px',
    },
    acceptButton: {
      marginTop: theme.spacing(1),
      color: 'white',
      width: '100%',
    },
    errorText: {
      color: 'orangered',
      marginTop: theme.spacing(1),
    }
  }),
);

const getAcceptButtonText = (isAwaitingWalletInteraction: boolean, isAcceptingConnectionRequest: boolean) => {
  if(isAcceptingConnectionRequest) {
    return "Accepting Connection Request...";
  }
  
  if(isAwaitingWalletInteraction) {
    return "Please Check Wallet...";
  }

  return "Accept Communication Request";
}

const propySupportAddress = "0x48608159077516aFE77A04ebC0448eC32E6670c1";

const supportChatLink = `https://app.push.org/chat/0x48608159077516aFE77A04ebC0448eC32E6670c1`;

const genericErrorMessage = "Something went wrong accepting the connection request, please contact support if this issue persists.";

const PushNotificationZone = (props: PropsFromRedux) => {

  let {
    setsupportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX,
    supportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX,
  } = props;

  const classes = useStyles();

  const [showNotificationZone, setShowNotificationZone] = useState(false);
  const [hasPendingSupportRequest, setHasPendingSupportRequest] = useState(false);
  const [hasSomeMessages, setHasSomeMessages] = useState(false);
  const [isAwaitingWalletInteraction, setIsAwaitingWalletInteraction] = useState(false);
  const [isAcceptingConnectionRequest, setIsAcceptingConnectionRequest] = useState(false);
  const [hasAcceptingError, setHasAcceptingError] = useState(false);
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [hasUnreadMessage, setHasUnreadMessage] = useState(false);

  const openMenu = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if(hasPendingSupportRequest) {
      setAnchorEl(event.currentTarget);
    }
    if(hasSomeMessages && !hasPendingSupportRequest && address) {
      let newWalletTimestamp : {[key: string]: {[key: string]: number}} = {};
      newWalletTimestamp[propySupportAddress] = {};
      newWalletTimestamp[propySupportAddress][address] = Math.floor(new Date().getTime() / 1000);
      setsupportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX(newWalletTimestamp);
    }
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const signer = useEthersSigner();

  const { address } = useAccount();

  const { capabilities } = useUnifiedWriteContract({});

  useEffect(() => {
    const checkPendingSupportRequest = async () => {
      let shouldShowNotificationZone = false;
      let hasSupportMessageRequest = false;
      let newLatestMessageTimestamp = 0;
      let hasMessages = false;
      let unreadMessageStatus = false;
      try {
        if(address) {
          let pushUserReadOnly = await PushAPI.initialize(null, {
            env: CONSTANTS.ENV.PROD,
            account: address,
          })
          const latestSupportMessages : any = await pushUserReadOnly.chat.latest(propySupportAddress);
          let isSmartWallet = false;
          if (capabilities && (Object.keys(capabilities).length > 0)) {
            isSmartWallet = true;
          }
          if(!isSmartWallet) {
            if(latestSupportMessages?.length > 0) {
              hasSupportMessageRequest = latestSupportMessages.some((entry: any) => entry?.listType === "REQUESTS");
              newLatestMessageTimestamp = Math.floor(latestSupportMessages[0].timestamp / 1000);
              shouldShowNotificationZone = true;
              
            } else {
              newLatestMessageTimestamp = Math.floor(latestSupportMessages?.timestamp / 1000);
              if (latestSupportMessages?.listType === "REQUESTS") {
                hasSupportMessageRequest = true;
                shouldShowNotificationZone = true;
              } else if (latestSupportMessages?.listType === "CHATS") {
                shouldShowNotificationZone = true;
              }
            }
            if (Object.keys(latestSupportMessages).length > 0) {
              shouldShowNotificationZone = true;
              hasMessages = true;
            }
          }
        }
      } catch (e) {
        console.error({'PushAPI.initialize error': e})
        shouldShowNotificationZone = false;
      } finally {
        setShowNotificationZone(shouldShowNotificationZone);
        setHasPendingSupportRequest(hasSupportMessageRequest);
        setHasSomeMessages(hasMessages);
        if(address && supportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX?.[propySupportAddress]?.[address]) {
          if(newLatestMessageTimestamp > supportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX[propySupportAddress][address]) {
            unreadMessageStatus = true;
          }
        } else if(address && !supportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX?.[propySupportAddress]?.[address]) {
          unreadMessageStatus = true;
        }
        setHasUnreadMessage(unreadMessageStatus);
      }
    };
    checkPendingSupportRequest();
  }, [address, forceUpdateCounter, capabilities, supportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX])

  const initPushInbox = async () => {
    try {
      if(signer && address) {
        setHasAcceptingError(false);
        setIsAwaitingWalletInteraction(true);
        let pushUser = await PushAPI.initialize(signer, {
          env: CONSTANTS.ENV.PROD,
          progressHook: (progress) => {
            if(progress.progressId === "PUSH-DECRYPT-02") {
              setIsAcceptingConnectionRequest(true);
            }
          }
        })
        setIsAcceptingConnectionRequest(true);
        await pushUser.chat.accept(propySupportAddress);
        toast.success("Successfully accepted push.org connection request!");
        setHasPendingSupportRequest(false);
        handleClose();
      }
    } catch (e) {
      toast.error(genericErrorMessage);
      setHasAcceptingError(true);
      setForceUpdateCounter(forceUpdateCounter + 1);
    } finally {
      setIsAwaitingWalletInteraction(false);
      setIsAcceptingConnectionRequest(false);
    }
  }

  return (
    <>
      {address && showNotificationZone &&
        <>
          <LinkWrapper external={true} link={!hasPendingSupportRequest ? supportChatLink : undefined}>
            <IconButton 
              onClick={handleClick}
              className={classes.margin}
              aria-label="push inbox"
              size="large"
            >
              {(hasPendingSupportRequest || hasUnreadMessage) && 
                <div className={classes.notificationIndicator} />
              }
              <InboxIcon />
            </IconButton>
          </LinkWrapper>
          <Menu
            id="push-inbox-menu"
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'push inbox',
            }}
            sx={{
              '.MuiMenu-list': {
                padding: '16px',
                maxWidth: '500px',
              }
            }}
          >
            {hasPendingSupportRequest &&
              <div>
                <Typography>Propy Support would like to establish a <ExternalLink href="https://push.org" style={{color: PROPY_LIGHT_BLUE}}>push.org</ExternalLink> communication channel with your wallet, please accept this request so you can be notified if anything requires your attention.</Typography>
                <FloatingActionButton
                  className={classes.acceptButton}
                  buttonColor="primary"
                  disabled={isAwaitingWalletInteraction || isAcceptingConnectionRequest}
                  onClick={() => initPushInbox()}
                  showLoadingIcon={isAwaitingWalletInteraction || isAcceptingConnectionRequest}
                  text={getAcceptButtonText(isAwaitingWalletInteraction, isAcceptingConnectionRequest)}
                />
                {hasAcceptingError &&
                  <Typography variant="subtitle2" className={classes.errorText}>{genericErrorMessage}</Typography>
                }
              </div>
            }
          </Menu>
        </>
      }
    </>
  );
}

export default PushNotificationZone