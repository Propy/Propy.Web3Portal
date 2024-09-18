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
import CircularProgress from '@mui/material/CircularProgress';

import LinkWrapper from './LinkWrapper';

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
      width: '100%',
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
      minWidth: 40,
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
      width: '100%',
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
    subtitleRow: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(0.5),
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
    loadingOverlay: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffffbf',
      zIndex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }
  }),
);

interface IChatProfile {
  profileTag: string;
  chatLink: string;
  profilePic: string;
}

const chatProfileConfigs : {[key: string]: IChatProfile} = {
  "0x48608159077516aFE77A04ebC0448eC32E6670c1": {
    profileTag: "General Propy Support",
    chatLink: `https://app.push.org/chat/0x48608159077516aFE77A04ebC0448eC32E6670c1`,
    profilePic: PropyLogo,
  },
  "0x527C37417d25213868F76127021FeBa80dc85B0E": {
    profileTag: "PropyKeys Support",
    chatLink: `https://app.push.org/chat/0x527C37417d25213868F76127021FeBa80dc85B0E`,
    profilePic: PropyLogo,
  }
}

let pushUser : any;

const PushNotificationZone = (props: PropsFromRedux) => {

  let {
    setSupportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX,
    supportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX,
  } = props;

  const classes = useStyles();

  const [showNotificationZone, setShowNotificationZone] = useState(false);
  const [hasPendingSupportRequest, setHasPendingSupportRequest] = useState(false);
  const [hasSomeMessages, setHasSomeMessages] = useState(false);
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [hasUnreadMessage, setHasUnreadMessage] = useState(false);
  const [unreadMessageAccounts, setUnreadMessageAccounts] = useState<string[]>([]);
  const [supportAddressToLatestMessageEntry, setSupportAddressToLatestMessageEntry] = useState<{[key: string]: any}>({});
  const [unlockingProfile, setUnlockingProfile] = useState(false);
  const [unlockedProfile, setUnlockedProfile] = useState(false);
  const [initiatingSupportChatAddresses, setInitiatingSupportChatAddresses] = useState<string[]>([]);
  const [loading, setIsLoading] = useState(false);

  const openMenu = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
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
      for(let propySupportAddress of Object.keys(chatProfileConfigs)) {
        newWalletTimestamp[propySupportAddress] = {};
        newWalletTimestamp[propySupportAddress][address] = Math.floor(new Date().getTime() / 1000);
      }
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

  const initiateChat = async (initChatAddress: string) => {
    setInitiatingSupportChatAddresses((currentValues) => [initChatAddress, ...currentValues.filter((currentValue) => currentValue !== initChatAddress)]);
    if (!pushUser || !pushUser?.signer) {
      pushUser = await PushAPI.initialize(signer, {
        env: CONSTANTS.ENV.PROD,
      });
    }
    await pushUser.chat.send(
      initChatAddress, 
      {content: "Support chat successfully opened!"}
    );
    setInitiatingSupportChatAddresses((currentValues) => [...currentValues.filter((currentValue) => currentValue !== initChatAddress)]);
    setForceUpdateCounter((currentValue) => currentValue + 1);
  }

  useEffect(() => {
    const checkPendingSupportRequest = async () => {
      setIsLoading(true);
      let shouldShowNotificationZone = true;
      let hasSupportMessageRequest = false;
      let lastMessageFromSupport = false;
      let supportAddressToLatestMessageTimestamp : {[key: string]: number} = {};
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
          for(let propySupportAddress of Object.keys(chatProfileConfigs)) {
            try {
              let newLatestMessageTimestamp = 0;
              const latestSupportMessages : any = await pushUser.chat.latest(propySupportAddress);
              let isSmartWallet = false;
              if (memoizedCapabilities && (Object.keys(memoizedCapabilities).length > 0)) {
                isSmartWallet = true;
              }
              if(!isSmartWallet) {
                if(latestSupportMessages?.length > 0) {
                  hasSupportMessageRequest = latestSupportMessages.some((entry: any) => entry?.listType === "REQUESTS" && entry?.fromDID.indexOf(propySupportAddress) > -1);
                  newLatestMessageTimestamp = Math.floor(latestSupportMessages[0].timestamp / 1000);
                  shouldShowNotificationZone = true;
                  if(latestSupportMessages[0]) {
                    supportAddressesToLatestMessageEntries[propySupportAddress] = latestSupportMessages[0]
                  } else {
                    delete supportAddressesToLatestMessageEntries[propySupportAddress];
                  }
                } else {
                  if (Object.keys(latestSupportMessages).length > 0) {
                    supportAddressesToLatestMessageEntries[propySupportAddress] = latestSupportMessages;
                  } else {
                    delete supportAddressesToLatestMessageEntries[propySupportAddress];
                  }
                  newLatestMessageTimestamp = Math.floor(latestSupportMessages?.timestamp / 1000);
                  if (latestSupportMessages?.listType === "REQUESTS" && latestSupportMessages?.fromDID.indexOf(propySupportAddress) > -1) {
                    hasSupportMessageRequest = true;
                    shouldShowNotificationZone = true;
                  } else if (latestSupportMessages?.listType === "CHATS") {
                    shouldShowNotificationZone = true;
                  }
                }
                supportAddressToLatestMessageTimestamp[propySupportAddress] = newLatestMessageTimestamp;
                if (Object.keys(latestSupportMessages).length > 0) {
                  supportAddressesToLatestMessageEntries[propySupportAddress] = latestSupportMessages[0];
                  shouldShowNotificationZone = true;
                  hasMessages = true;
                }
              }
            } catch(e) {
              console.error({
                "Support Address": propySupportAddress,
                "Support Account": chatProfileConfigs[propySupportAddress].profileTag,
                "Error handling latest message state": e,
              })
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
        for(let propySupportAddress of Object.keys(chatProfileConfigs)) {
          if(
            (supportAddressesToLatestMessageEntries[propySupportAddress]?.signature !== supportAddressToLatestMessageEntry[propySupportAddress]?.signature)
            || (supportAddressesToLatestMessageEntries[propySupportAddress]?.messageObj?.content && !supportAddressToLatestMessageEntry[propySupportAddress]?.messageObj?.content)
          ) {
            setSupportAddressToLatestMessageEntry(supportAddressesToLatestMessageEntries);
          }
          if(supportAddressesToLatestMessageEntries[propySupportAddress]?.fromDID && (supportAddressesToLatestMessageEntries[propySupportAddress]?.fromDID.indexOf(propySupportAddress) > -1)) {
            lastMessageFromSupport = true;
          }
          if(address && supportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX?.[propySupportAddress]?.[address]) {
            if(lastMessageFromSupport && (supportAddressToLatestMessageTimestamp[propySupportAddress] > supportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX[propySupportAddress][address])) {
              unreadMessageStatus = true;
              latestUnreadMessageAccounts.push(propySupportAddress);
            }
          } else if(address && !supportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX?.[propySupportAddress]?.[address] && lastMessageFromSupport) {
            unreadMessageStatus = true;
            latestUnreadMessageAccounts.push(propySupportAddress);
          }
        }
        setHasUnreadMessage(unreadMessageStatus);
        setUnreadMessageAccounts(latestUnreadMessageAccounts);
        setIsLoading(false);
      }
    };
    checkPendingSupportRequest();
  }, [address, forceUpdateCounter, memoizedCapabilities, signer, supportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX, supportAddressToLatestMessageEntry])

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
            <div className="relative">
              {loading && 
                <div className={classes.loadingOverlay}>
                  <CircularProgress color="inherit" style={{height: '36px', width: '36px', marginRight: '8px', color: '#6e6e6e'}} />
                </div>
              }
              <div className={classes.titleRow}>
                <Typography variant="h6" className={classes.inboxHeading}>Web3 Wallet Inbox</Typography>
              </div>
              <div className={classes.actionRow}>
                {hasSomeMessages &&
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
                }
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
              {/* This block is for active/open chats */}
              {Object.keys(chatProfileConfigs).filter((includeAddress) => supportAddressToLatestMessageEntry[includeAddress]).map((chatProfileAddress) => (
                <LinkWrapper key={`push-notification-zone`} external={true} link={chatProfileConfigs[chatProfileAddress].chatLink}>
                  <div className={classes.chatProfileEntry}>
                    {(unreadMessageAccounts.indexOf(chatProfileAddress) > -1) &&
                      <div className={classes.chatProfileNotificationIndicator} />
                    }
                    <div className={classes.chatProfilePicContainer}>
                      <img alt={chatProfileConfigs[chatProfileAddress].profileTag} className={classes.chatProfilePic} src={chatProfileConfigs[chatProfileAddress].profilePic} />
                    </div>
                    <div className={classes.chatProfileEntryTypography}>
                      <div className="flex-center space-between">
                        <Typography variant="subtitle2" className={classes.profileTag}>{chatProfileConfigs[chatProfileAddress].profileTag}</Typography>
                        <Typography variant="overline" style={{lineHeight: 1, textTransform: 'none'}}>{dayjs.unix(Math.floor(supportAddressToLatestMessageEntry[chatProfileAddress].timestamp / 1000)).format('hh:mm A MMM-D-YYYY')}</Typography>
                      </div>
                      <Typography variant="overline" style={{lineHeight: 1, textTransform: 'none'}}>{supportAddressToLatestMessageEntry[chatProfileAddress].messageObj?.content ? supportAddressToLatestMessageEntry[chatProfileAddress].messageObj?.content : "🔒 Locked Message"}</Typography>
                    </div>
                  </div>
                </LinkWrapper>
              ))}
              {Object.keys(chatProfileConfigs).filter((includeAddress) => !supportAddressToLatestMessageEntry[includeAddress])?.length > 0 &&
                <div className={classes.subtitleRow}>
                  <Typography variant="subtitle2" className={classes.inboxHeading}>Suggested Support Channels</Typography>
                </div>
              }
              {/* This block is for suggested chats */}
              {Object.keys(chatProfileConfigs).filter((includeAddress) => !supportAddressToLatestMessageEntry[includeAddress]).map((chatProfileAddress) => (
                <div className={classes.chatProfileEntry}>
                  {(unreadMessageAccounts.indexOf(chatProfileAddress) > -1) &&
                    <div className={classes.chatProfileNotificationIndicator} />
                  }
                  <div className={classes.chatProfilePicContainer}>
                    <img alt={chatProfileConfigs[chatProfileAddress].profileTag} className={classes.chatProfilePic} src={chatProfileConfigs[chatProfileAddress].profilePic} />
                  </div>
                  <div className={classes.chatProfileEntryTypography}>
                    <div className="flex-center space-between">
                      <Typography variant="subtitle2" className={classes.profileTag}>{chatProfileConfigs[chatProfileAddress].profileTag}</Typography>
                      <ActionButton 
                        onClick={() => initiateChat(chatProfileAddress)}
                        size="small"
                        variant="outlined"
                        buttonColor="primary"
                        disabled={initiatingSupportChatAddresses.indexOf(chatProfileAddress) > -1}
                        text={"Request Support"}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Menu>
        </>
      }
    </>
  );
}

export default PushNotificationZone