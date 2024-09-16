import React, { useEffect, useState, useMemo } from 'react';

import { PushAPI, CONSTANTS } from '@pushprotocol/restapi';

import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

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
import ActionButton from './ActionButton';

import PropyLogo from '../assets/img/propy-house-only.png';

import {
  PROPY_LIGHT_BLUE
} from '../utils/constants';

import {
  useUnifiedWriteContract,
} from '../hooks';

import { PropsFromRedux } from '../containers/PushNotificationZoneContainer';

dayjs.extend(advancedFormat);

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
    },
    chatProfileEntry: {
      display: 'flex',
      padding: theme.spacing(1),
      borderRadius: '10px',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: '#f3f3f3',
      },
      position: 'relative',
    },
    chatProfileNotificationIndicator: {
      height: '10px',
      width: '10px',
      position: 'absolute',
      backgroundColor: PROPY_LIGHT_BLUE,
      borderRadius: '50%',
      top: '10px',
      left: '8px',
    },
    chatProfilePicContainer: {
      width: 40,
      height: 40,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '50%',
      border: '1px solid #d5d5d5',
      overflow: 'hidden',
    },
    chatProfilePic: {
      width: '100%',
      height: '100%',
    },
    chatProfileEntryTypography: {
      display: 'flex',
      flexDirection: 'column',
      marginLeft: theme.spacing(1.5),
      justifyContent: 'center',
    },
    profileTag: {
      marginRight: theme.spacing(1.5),
    },
    titleRow: {
      marginBottom: theme.spacing(1),
      display: 'flex',
      justifyContent: 'start',
      alignItems: 'center',
    },
    actionRow: {
      marginBottom: theme.spacing(1),
      display: 'flex',
      justifyContent: 'start',
      alignItems: 'center',
    },
    inboxHeading: {
      fontWeight: 'bold',
    },
    actionButtonSpacer: {
      marginRight: 8
    },
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

interface IChatProfile {
  profileTag: string;
  chatLink: string;
  profilePic: string;
}

const propySupportAddress = "0x48608159077516aFE77A04ebC0448eC32E6670c1";

const chatProfileConfigs : {[key: string]: IChatProfile} = {
  "0x48608159077516aFE77A04ebC0448eC32E6670c1": {
    profileTag: "General Propy Support",
    chatLink: `https://app.push.org/chat/0x48608159077516aFE77A04ebC0448eC32E6670c1`,
    profilePic: PropyLogo,
  }
}

let pushUser : any;

const genericErrorMessage = "Something went wrong accepting the connection request, please contact support if this issue persists.";

const PushNotificationZone = (props: PropsFromRedux) => {

  let {
    setSupportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX,
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
  const [unreadMessageAccounts, setUnreadMessageAccounts] = useState<string[]>([]);
  const [supportAddressToLatestMessageEntry, setSupportAddressToLatestMessageEntry] = useState<{[key: string]: any}>({});
  const [unlockingProfile, setUnlockingProfile] = useState(false);
  const [unlockedProfile, setUnlockedProfile] = useState(false);

  const openMenu = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if(hasPendingSupportRequest) {
      setAnchorEl(event.currentTarget);
    } else if (hasSomeMessages) {
      setAnchorEl(event.currentTarget);
    }
  };

  useEffect(() => {
    let allMessagesUnlocked = true;
    for(let supportAddress of Object.keys(supportAddressToLatestMessageEntry)) {
      if(!supportAddressToLatestMessageEntry[supportAddress]?.messageObj?.content) {
        allMessagesUnlocked = false;
      }
    }
    if(allMessagesUnlocked) {
      setUnlockedProfile(true);
    } else {
      setUnlockedProfile(false);
    }
  }, [supportAddressToLatestMessageEntry])

  const getUnlockMessagesButtonText = () => {
    if(unlockingProfile) {
      return "Unlocking Messages"
    }
    if(unlockedProfile) {
      return "Unlocked Messages"
    }
    return "Unlock Messages"; 
  }

  const handleDismissChatNotification = () => {
    if(address) {
      let newWalletTimestamp : {[key: string]: {[key: string]: number}} = {};
      newWalletTimestamp[propySupportAddress] = {};
      newWalletTimestamp[propySupportAddress][address] = Math.floor(new Date().getTime() / 1000);
      setSupportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX(newWalletTimestamp);
    }
  }
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const signer = useEthersSigner();

  const { address } = useAccount();

  const { capabilities } = useUnifiedWriteContract({});

  const memoizedCapabilities = useMemo(() => capabilities, [capabilities]);

  const unlockPushProfile = async () => {
    try {
      if(address) {
        setUnlockingProfile(true);
        pushUser = await PushAPI.initialize(signer, {
          env: CONSTANTS.ENV.PROD,
        })
        setUnlockingProfile(false);
        setForceUpdateCounter((currentValue) => currentValue + 1);
      }
    } catch (e) {
      console.error({'unlockPushProfile PushAPI.initialize error': e});
      toast.error("Unable to unlock push.org profile");
    }
  }

  useEffect(() => {
    console.log({address, forceUpdateCounter, memoizedCapabilities, supportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX, supportAddressToLatestMessageEntry})
    const checkPendingSupportRequest = async () => {
      let shouldShowNotificationZone = false;
      let hasSupportMessageRequest = false;
      let newLatestMessageTimestamp = 0;
      let lastMessageFromSupport = false;
      let hasMessages = false;
      let unreadMessageStatus = false;
      let supportAddressesToLatestMessageEntries = Object.assign({}, supportAddressToLatestMessageEntry);
      let latestUnreadMessageAccounts = [];
      try {
        if(address) {
          if (!pushUser || (pushUser?.account !== address)) {
            pushUser = await PushAPI.initialize(null, {
              env: CONSTANTS.ENV.PROD,
              account: address,
            })
          }
          const latestSupportMessages : any = await pushUser.chat.latest(propySupportAddress);
          console.log({latestSupportMessages})
          let isSmartWallet = false;
          if (memoizedCapabilities && (Object.keys(memoizedCapabilities).length > 0)) {
            isSmartWallet = true;
          }
          if(!isSmartWallet) {
            if(latestSupportMessages?.length > 0) {
              hasSupportMessageRequest = latestSupportMessages.some((entry: any) => entry?.listType === "REQUESTS");
              newLatestMessageTimestamp = Math.floor(latestSupportMessages[0].timestamp / 1000);
              shouldShowNotificationZone = true;
              supportAddressesToLatestMessageEntries[propySupportAddress] = latestSupportMessages[0];
            } else {
              if (Object.keys(latestSupportMessages).length > 0) {
                supportAddressesToLatestMessageEntries[propySupportAddress] = latestSupportMessages;
              }
              newLatestMessageTimestamp = Math.floor(latestSupportMessages?.timestamp / 1000);
              if (latestSupportMessages?.listType === "REQUESTS") {
                hasSupportMessageRequest = true;
                shouldShowNotificationZone = true;
              } else if (latestSupportMessages?.listType === "CHATS") {
                shouldShowNotificationZone = true;
              }
            }
            if (Object.keys(latestSupportMessages).length > 0) {
              supportAddressesToLatestMessageEntries[propySupportAddress] = latestSupportMessages[0];
              shouldShowNotificationZone = true;
              hasMessages = true;
            }
          }
        } else {
          pushUser = undefined;
        }
      } catch (e) {
        console.error({'PushAPI.initialize error': e})
        shouldShowNotificationZone = false;
      } finally {
        setShowNotificationZone(shouldShowNotificationZone);
        setHasPendingSupportRequest(hasSupportMessageRequest);
        setHasSomeMessages(hasMessages);
        if(
          (supportAddressesToLatestMessageEntries[propySupportAddress]?.signature !== supportAddressToLatestMessageEntry[propySupportAddress]?.signature)
          || (supportAddressesToLatestMessageEntries[propySupportAddress]?.messageObj?.content && !supportAddressToLatestMessageEntry[propySupportAddress]?.messageObj?.content)
        ) {
          setSupportAddressToLatestMessageEntry(supportAddressesToLatestMessageEntries);
        }
        console.log({'supportAddressesToLatestMessageEntries[propySupportAddress]?.fromDID.indexOf(propySupportAddress) > -1': supportAddressesToLatestMessageEntries[propySupportAddress]?.fromDID.indexOf(propySupportAddress)})
        if(supportAddressesToLatestMessageEntries[propySupportAddress]?.fromDID && (supportAddressesToLatestMessageEntries[propySupportAddress]?.fromDID.indexOf(propySupportAddress) > -1)) {
          lastMessageFromSupport = true;
        }
        if(address && supportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX?.[propySupportAddress]?.[address]) {
          if(lastMessageFromSupport && (newLatestMessageTimestamp > supportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX[propySupportAddress][address])) {
            unreadMessageStatus = true;
            latestUnreadMessageAccounts.push(propySupportAddress);
          }
        } else if(address && !supportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX?.[propySupportAddress]?.[address] && lastMessageFromSupport) {
          unreadMessageStatus = true;
          latestUnreadMessageAccounts.push(propySupportAddress);
        }
        console.log({unreadMessageStatus, lastMessageFromSupport})
        setHasUnreadMessage(unreadMessageStatus);
        setUnreadMessageAccounts(latestUnreadMessageAccounts);
      }
    };
    checkPendingSupportRequest();
  }, [address, forceUpdateCounter, memoizedCapabilities, signer, supportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX, supportAddressToLatestMessageEntry])

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
            {!hasPendingSupportRequest && hasSomeMessages &&
              <div>
                <div className={classes.titleRow}>
                  <Typography variant="h6" className={classes.inboxHeading}>Wallet Inbox</Typography>
                </div>
                <div className={classes.actionRow}>
                  <ActionButton 
                    onClick={() => unlockPushProfile()}
                    className={classes.actionButtonSpacer}
                    size="small"
                    variant="outlined"
                    buttonColor="secondary"
                    showLoadingIcon={unlockingProfile}
                    disabled={unlockingProfile || unlockedProfile}
                    text={getUnlockMessagesButtonText()}
                  />
                  {unreadMessageAccounts.length > 0 &&
                    <ActionButton 
                      onClick={() => handleDismissChatNotification()}
                      size="small"
                      variant="outlined"
                      buttonColor="secondary"
                      disabled={unreadMessageAccounts.length === 0}
                      text={"Dismiss Notifications"}
                    />
                  }
                </div>
                {Object.keys(chatProfileConfigs).map((chatProfileAddress) => (
                  <LinkWrapper external={true} link={chatProfileConfigs[chatProfileAddress].chatLink}>
                    <div className={classes.chatProfileEntry}>
                      {(unreadMessageAccounts.indexOf(chatProfileAddress) > -1) &&
                        <div className={classes.chatProfileNotificationIndicator} />
                      }
                      <div className={classes.chatProfilePicContainer}>
                        <img alt={chatProfileConfigs[chatProfileAddress].profileTag} className={classes.chatProfilePic} src={chatProfileConfigs[chatProfileAddress].profilePic} />
                      </div>
                      <div className={classes.chatProfileEntryTypography}>
                        <div className="flex-center">
                          <Typography variant="subtitle2" className={classes.profileTag}>{chatProfileConfigs[chatProfileAddress].profileTag}</Typography>
                          <Typography variant="overline" style={{lineHeight: 1, textTransform: 'none'}}>{dayjs.unix(Math.floor(supportAddressToLatestMessageEntry[chatProfileAddress].timestamp / 1000)).format('hh:mm A MMM-D-YYYY')}</Typography>
                        </div>
                        <Typography variant="overline" style={{lineHeight: 1, textTransform: 'none'}}>{supportAddressToLatestMessageEntry[chatProfileAddress].messageObj?.content ? supportAddressToLatestMessageEntry[chatProfileAddress].messageObj?.content : "🔒 Locked Message"}</Typography>
                      </div>
                    </div>
                  </LinkWrapper>
                ))}
              </div>
            }
          </Menu>
        </>
      }
    </>
  );
}

export default PushNotificationZone