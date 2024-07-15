import React, { useState, useEffect } from 'react';

import { useAccount, useSignMessage } from 'wagmi';

import { toast } from 'sonner';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

import Typography from '@mui/material/Typography';

import { Web3ModalButtonWagmi } from './Web3ModalButtonWagmi';

import { PropsFromRedux } from '../containers/PropyKeysHomeListingLikeZoneContainer';

import {
  INonceResponse,
} from '../interfaces';

import {
  SignerService,
  PropyKeysListingService,
} from '../services/api';

import {
  constructSignerMessage,
} from '../utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 'auto',
      display: 'flex',
      alignItems: 'center',
    },
    likeButton: {
      border: '1px solid #efefef',
      marginRight: theme.spacing(1),
    },
    likeButtonCompact: {
      border: '1px solid #efefef',
      marginRight: theme.spacing(0.5),
    },
  }),
);

interface IPropyKeysHomeListingLikeZone {
  title?: string,
  propyKeysHomeListingId: string,
  onSuccess?: () => void,
  compact?: boolean,
}

const PropyKeysHomeListingLikeZone = (props: PropsFromRedux & IPropyKeysHomeListingLikeZone) => {

  const [likeCount, setLikeCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [reloadIndex, setReloadIndex] = useState<number>(0);

  const classes = useStyles();

  const { address } = useAccount();

  const { 
    // data,
    // isError,
    // isLoading,
    // isSuccess, 
    signMessageAsync
  } = useSignMessage();

  const {
    darkMode,
    propyKeysHomeListingId,
    onSuccess,
    compact = false,
  } = props;

  useEffect(() => {
    let isMounted = true;
    const getLikeStatus = async () => {
      if(address) {
        let [likeStatusResponse, likeCountResponse] = await Promise.all([
          PropyKeysListingService.getLikedByStatus(propyKeysHomeListingId, address),
          PropyKeysListingService.getLikeCount(propyKeysHomeListingId),
        ]);
        if(isMounted) {
          if(likeStatusResponse?.data?.like_status) {
            setIsLiked(true);
          } else {
            setIsLiked(false);
          }
          console.log({likeCountResponse})
          if(!isNaN(likeCountResponse?.data?.like_count)) {
            setLikeCount(likeCountResponse?.data?.like_count);
          }
        }
      } else {
        let [likeCountResponse] = await Promise.all([
          PropyKeysListingService.getLikeCount(propyKeysHomeListingId),
        ]);
        if(isMounted) {
          if(!isNaN(likeCountResponse?.data?.like_count)) {
            setLikeCount(likeCountResponse?.data?.like_count);
          }
        }
        setIsLiked(false);
      }
    }
    getLikeStatus();
    return () => {
      isMounted = false;
    }
  }, [propyKeysHomeListingId, address, reloadIndex])

  const signLike = async (type: 'add_like_propykeys_listing' | 'remove_like_propykeys_listing') => {
    if(signMessageAsync && address) {
      let signerAccount = address;
      let nonceResponse : INonceResponse = await SignerService.getSignerNonce(address);
      let {
        data,
      } = nonceResponse;
      if(data && propyKeysHomeListingId) {
        let {
          nonce,
          salt,
        } = data;
        let messageForSigning = constructSignerMessage(
          signerAccount,
          nonce,
          salt,
          type,
          {
            listing_id: propyKeysHomeListingId,
          }
        );
        if(messageForSigning) {
          try {
            let signedMessage = await signMessageAsync({message: messageForSigning})
            console.log({signedMessage, messageForSigning})
            if(typeof signedMessage === "string") {
              let triggerSignedMessageActionResponse = await SignerService.validateSignedMessageAndPerformAction(messageForSigning, signedMessage, signerAccount);
              console.log({triggerSignedMessageActionResponse});
              if(triggerSignedMessageActionResponse.status) {
                if(onSuccess) {
                  onSuccess();
                }
                setReloadIndex(reloadIndex + 1);
                if(type === 'add_like_propykeys_listing') {
                  setIsLiked(true);
                  setLikeCount(likeCount + 1);
                } else {
                  setIsLiked(false);
                  setLikeCount(likeCount - 1);
                }
                toast.success(`Like ${type === 'add_like_propykeys_listing' ? "added" : "removed"} successfully!`);
              } else {
                toast.error(`Unable to ${type === 'add_like_propykeys_listing' ? "add" : "remove"} like`);
              }
            }
          } catch (e) {
            //@ts-ignore
            toast.error(e?.shortMessage ? e.shortMessage : "Failed to sign message");
          }
        } else {
          toast.error("Unable to generate message for signing");
        }
      } else {
        toast.error("Unable to fetch account nonce");
      }
    }
  }

  return (
    <div className={classes.root}>
        {!address && 
          <Web3ModalButtonWagmi renderCustomConnectButton={(onClickFn: () => void) => (
            <Tooltip title="Add like">
              <IconButton 
                className={classes.likeButton}
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onClickFn();
                }}
              >
                {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Tooltip>
          )} variant="contained" color="secondary" darkMode={darkMode} overrideConnectText="Connect wallet" hideNetworkSwitch={true} />
        }
        {address &&
          <Tooltip title={isLiked ? "Remove like" : "Add like"}>
            <IconButton 
              size={compact ? 'small' : 'medium'}
              className={compact ? classes.likeButtonCompact : classes.likeButton}
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                signLike(isLiked ? 'remove_like_propykeys_listing' : 'add_like_propykeys_listing')
              }}
              onTouchStart={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {isLiked ? <FavoriteIcon fontSize="inherit" /> : <FavoriteBorderIcon fontSize="inherit" />}
            </IconButton>
          </Tooltip>
        }
        <Typography variant={compact ? "subtitle2" : "subtitle1"}>
          {likeCount} 
          {!compact && <>{(likeCount && (likeCount === 1)) ? ' Like' : ' Likes'}</>}
        </Typography>
    </div>
  )
}

export default PropyKeysHomeListingLikeZone;