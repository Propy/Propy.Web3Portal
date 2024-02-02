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

import { PropsFromRedux } from '../containers/NFTLikeZoneContainer';

import {
  INonceResponse,
} from '../interfaces';

import {
  SignerService,
  NFTService,
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
    }
  }),
);

interface INFTLikeZone {
  title?: string,
  tokenAddress: string,
  tokenId: string,
  tokenNetwork: string,
  onSuccess?: () => void,
}

const NFTLikeZone = (props: PropsFromRedux & INFTLikeZone) => {

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
    tokenAddress,
    tokenId,
    tokenNetwork,
    onSuccess,
  } = props;

  useEffect(() => {
    let isMounted = true;
    const getLikeStatus = async () => {
      if(address) {
        let [likeStatusResponse, likeCountResponse] = await Promise.all([
          NFTService.getLikedByStatus(tokenNetwork, tokenAddress, tokenId, address),
          NFTService.getLikeCount(tokenNetwork, tokenAddress, tokenId),
        ]);
        if(isMounted) {
          if(likeStatusResponse?.data?.like_status) {
            setIsLiked(true);
          } else {
            setIsLiked(false);
          }
          if(!isNaN(likeCountResponse?.data?.like_count)) {
            setLikeCount(likeCountResponse?.data?.like_count);
          }
        }
      } else {
        let [likeCountResponse] = await Promise.all([
          NFTService.getLikeCount(tokenNetwork, tokenAddress, tokenId),
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
  }, [tokenNetwork, tokenAddress, tokenId, address, reloadIndex])

  const signLike = async (type: 'add_like_nft' | 'remove_like_nft') => {
    if(signMessageAsync && address) {
      let signerAccount = address;
      let nonceResponse : INonceResponse = await SignerService.getSignerNonce(address);
      let {
        data,
      } = nonceResponse;
      if(data && tokenAddress && tokenId) {
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
            token_address: tokenAddress,
            token_id: tokenId,
            token_network: tokenNetwork,
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
                  setReloadIndex(reloadIndex + 1);
                  if(type === 'add_like_nft') {
                    setIsLiked(true);
                    setLikeCount(likeCount + 1);
                  } else {
                    setIsLiked(false);
                    setLikeCount(likeCount - 1);
                  }
                }
                toast.success(`Like ${type === 'add_like_nft' ? "added" : "removed"} successfully!`);
              } else {
                toast.error(`Unable to ${type === 'add_like_nft' ? "add" : "remove"} like`);
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
              <IconButton className={classes.likeButton} color="primary" onClick={() => onClickFn()}>
                {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Tooltip>
          )} variant="contained" color="secondary" darkMode={darkMode} overrideConnectText="Connect wallet" hideNetworkSwitch={true} />
        }
        {address &&
          <Tooltip title={isLiked ? "Remove like" : "Add like"}>
            <IconButton className={classes.likeButton} color="primary" onClick={() => signLike(isLiked ? 'remove_like_nft' : 'add_like_nft')}>
              {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Tooltip>
        }
        <Typography>
          {likeCount} {(likeCount && (likeCount === 1)) ? 'Like' : 'Likes'}
        </Typography>
    </div>
  )
}

export default NFTLikeZone;