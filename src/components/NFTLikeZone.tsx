import React from 'react';

import { useAccount, useSignMessage } from 'wagmi';

import { useQueryClient, useQuery } from '@tanstack/react-query';

import { toast } from 'sonner';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';

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
    },
    likeButtonCompact: {
      border: '1px solid #efefef',
      marginRight: theme.spacing(0.5),
    },
  }),
);

interface INFTLikeZone {
  title?: string,
  tokenAddress: string | false,
  tokenId: string | false,
  tokenNetwork: string | false,
  onSuccess?: () => void,
  compact?: boolean,
  isPlaceholder?: boolean,
}

const NFTLikeZone = (props: PropsFromRedux & INFTLikeZone) => {

  const classes = useStyles();

  const { address, chainId } = useAccount();

  const queryClient = useQueryClient();

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
    compact = false,
    isPlaceholder = false,
  } = props;

  const { 
    data: likeDataTanstack,
    isLoading: isLoadingLikeDataTanstack,
  } = useQuery({
    queryKey: ['nft-like-zone', tokenNetwork, tokenAddress, tokenId, address, isPlaceholder],
    queryFn: async () => {
      let likeCount = 0;
      let isLiked = false;
      if (tokenNetwork && tokenId && tokenAddress && !isPlaceholder) {
        if(address) {
          let [likeStatusResponse, likeCountResponse] = await Promise.all([
            NFTService.getLikedByStatus(tokenNetwork, tokenAddress, tokenId, address),
            NFTService.getLikeCount(tokenNetwork, tokenAddress, tokenId),
          ]);
          if(likeStatusResponse?.data?.like_status) {
            isLiked = true;
          }
          if(!isNaN(likeCountResponse?.data?.like_count)) {
            likeCount = likeCountResponse?.data?.like_count;
          }
        } else {
          let [likeCountResponse] = await Promise.all([
            NFTService.getLikeCount(tokenNetwork, tokenAddress, tokenId),
          ]);
          if(!isNaN(likeCountResponse?.data?.like_count)) {
            likeCount = likeCountResponse?.data?.like_count;
          }
        }
      }
      return {
        likeCount,
        isLiked,
      }
    },
    gcTime: 5 * 60 * 1000,
    staleTime: 60 * 1000,
  });

  const signLike = async (type: 'add_like_nft' | 'remove_like_nft') => {
    if(signMessageAsync && address && chainId) {
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
          chainId,
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
                }
                queryClient.invalidateQueries({ queryKey: ['nft-like-zone', tokenNetwork, tokenAddress, tokenId, address, isPlaceholder] })
                toast.success(`Like ${type === 'add_like_nft' ? "added" : "removed"} successfully!`);
              } else {
                toast.error(`Unable to ${type === 'add_like_nft' ? "add" : "remove"} like`);
              }
            }
          } catch (e: any) {
            let errorMessage;
            if(e?.shortMessage) {
              errorMessage = e?.shortMessage;
            }
            if(e?.data?.message) {
              errorMessage = e?.data?.message;
            }
            toast.error(errorMessage ? errorMessage : "Failed to sign message");
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
                disabled={isPlaceholder}
              >
                {likeDataTanstack?.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Tooltip>
          )} variant="contained" color="secondary" darkMode={darkMode} overrideConnectText="Connect wallet" hideNetworkSwitch={true} />
        }
        {address &&
          <Tooltip title={likeDataTanstack?.isLiked ? "Remove like" : "Add like"}>
            <IconButton 
              size={compact ? 'small' : 'medium'}
              className={compact ? classes.likeButtonCompact : classes.likeButton}
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                signLike(likeDataTanstack?.isLiked ? 'remove_like_nft' : 'add_like_nft')
              }}
              disabled={isPlaceholder}
              onTouchStart={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {likeDataTanstack?.isLiked ? <FavoriteIcon fontSize="inherit" /> : <FavoriteBorderIcon fontSize="inherit" />}
            </IconButton>
          </Tooltip>
        }
        {!isLoadingLikeDataTanstack &&
          <Typography variant={compact ? "subtitle2" : "subtitle1"}>
            {likeDataTanstack?.likeCount} 
            {!compact && <>{(likeDataTanstack?.likeCount && (likeDataTanstack?.likeCount === 1)) ? ' Like' : ' Likes'}</>}
          </Typography>
        }
        {isLoadingLikeDataTanstack &&
          <CircularProgress style={{width: compact ? 8 : 20, height: compact ? 8 : 20, marginLeft: compact ? 0 : 8}} />
        }
    </div>
  )
}

export default NFTLikeZone;