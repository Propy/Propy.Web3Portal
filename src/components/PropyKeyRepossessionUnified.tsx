import React, { useEffect, useState } from 'react';

import { Theme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import { useQuery } from '@tanstack/react-query';

import Typography from '@mui/material/Typography';

import SingleTokenCardBaseline from './SingleTokenCardBaseline';

import FloatingActionButton from './FloatingActionButton';

import PlaceholderImage from '../assets/img/placeholder.webp';

import { useUnifiedWriteContract } from '../hooks/useUnifiedWriteContract';

import { 
  useAccount,
  useReadContract,
  useBlockNumber,
} from 'wagmi';

import {
  PROPY_KEY_REPOSSESSION_CONTRACT,
  BASE_OG_STAKING_NFT,
  BASE_PROPYKEYS_NFT,
  // BASE_PROPYKEYS_STAKING_NFT,
} from '../utils/constants';

import {
  getResolvableIpfsLink,
} from '../utils';

import PropyKeyRepossessionABI from '../abi/PropyKeyRepossessionABI.json';
import PropyNFTABI from '../abi/PropyNFTABI.json';

import { PropsFromRedux } from '../containers/PropyKeyRepossessionContainer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      marginTop: theme.spacing(4),
    },
    sectionSpacer: {
      marginTop: theme.spacing(4),
    },
    sectionSpacerSmall: {
      marginTop: theme.spacing(2),
    },
    submitButtonContainer: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-end',
    },
    submitButton: {
      width: '100%',
    },
  }),
);

interface IPropyKeyRepossession {
  propyKeyTokenId: string | undefined
}

const PropyKeyRepossession = (props: PropsFromRedux & IPropyKeyRepossession) => {

  const {
    propyKeyTokenId,
  } = props;

  const classes = useStyles();

  const { data: blockNumber } = useBlockNumber({ watch: true })

  const [metadataIpfsLink, setMetadataIpfsLink] = useState<undefined | string>();
  const [isMarkedForRepossession, setIsMarkedForRepossession] = useState(false);
  const [ogCountForPropyKey, setOgCountForPropyKey] = useState<number | false>(false);
  const [isOwnerOfPropyKey, setIsOwnerOfPropyKey] = useState(false);
  const [isRepossessionContractApproved, setIsRepossessionContractApproved] = useState(false);

  const [tokenImage, setTokenImage] = useState(PlaceholderImage);
  const [tokenTitle, setTokenTitle] = useState('');

  // const {
  //   isConsideredMobile,
  //   isConsideredMedium,
  // } = props;

  const { 
    address,
  } = useAccount();

  const {
    data: dataRepossessionConfig,
    refetch: refetchDataRepossessionConfig,
  } = useReadContract<any[], any, any>({
    address: PROPY_KEY_REPOSSESSION_CONTRACT,
    abi: PropyKeyRepossessionABI,
    functionName: 'tokenIdToRepossessionConfiguration',
    //watch: true,
    args: [propyKeyTokenId],
  })

  useEffect(() => {
    console.log({dataRepossessionConfig})
    if(dataRepossessionConfig?.[0]) {
      setIsMarkedForRepossession(true);
    } else {
      setIsMarkedForRepossession(false);
    }
    if(dataRepossessionConfig?.[3]) {
      setOgCountForPropyKey(dataRepossessionConfig?.[3]);
    } else {
      setOgCountForPropyKey(false);
    }
    if(dataRepossessionConfig?.[1] && (dataRepossessionConfig?.[1]?.indexOf("ipfs://") > -1)) {
      let metadataResolveLink = getResolvableIpfsLink(dataRepossessionConfig?.[1]);
      setMetadataIpfsLink(metadataResolveLink);
    }
  }, [dataRepossessionConfig])

  const { 
    data: ogMetadata,
    // isLoading: isLoadingOgMetadata,
  } = useQuery({
    queryKey: ['fetchIpfsMetadata', metadataIpfsLink],
    queryFn: async () => {
      if(metadataIpfsLink) {
        let metadata = await fetch(metadataIpfsLink).then((res) => res.json());
        return metadata;
      }
      return null;
    },
    gcTime: 60, // Cache the data indefinitely
    staleTime: 60, // Data is always considered fresh
  });

  useEffect(() => {
    if(ogMetadata?.image) {
      let imageResolveLink = getResolvableIpfsLink(ogMetadata?.image);
      if(imageResolveLink) {
        setTokenImage(imageResolveLink);
      } else {
        setTokenImage(PlaceholderImage);
      }
    } else {
      setTokenImage(PlaceholderImage);
    }
    if(ogMetadata?.name) {
      setTokenTitle(ogMetadata?.name);
    } else {
      setTokenTitle('')
    }

  }, [ogMetadata])

  const { 
    data: approvedTokenController,
    refetch: refetchApprovedTokenController,
  } = useReadContract({
    address: BASE_PROPYKEYS_NFT,
    abi: PropyNFTABI,
    functionName: 'getApproved',
    //watch: true,
    args: [propyKeyTokenId],
  });

  useEffect(() => {
    if(approvedTokenController === PROPY_KEY_REPOSSESSION_CONTRACT) {
      setIsRepossessionContractApproved(true);
    } else {
      setIsRepossessionContractApproved(false);
    }
  }, [approvedTokenController])

  const { 
    data: tokenOwner,
    refetch: refetchTokenOwner,
  } = useReadContract({
    address: BASE_PROPYKEYS_NFT,
    abi: PropyNFTABI,
    functionName: 'ownerOf',
    //watch: true,
    args: [propyKeyTokenId],
  });

  useEffect(() => {
    refetchTokenOwner();
    refetchDataRepossessionConfig();
    refetchApprovedTokenController();
  }, [
    blockNumber,
    refetchTokenOwner,
    refetchDataRepossessionConfig,
    refetchApprovedTokenController,
  ])

  useEffect(() => {
    console.log({tokenOwner, address});
    if(tokenOwner === address) {
      setIsOwnerOfPropyKey(true);
    } else {
      setIsOwnerOfPropyKey(false);
    }
  }, [tokenOwner, address])

  const getClaimButtonText = (waitingForWallet: boolean, waitingForTransaction: boolean) => {
    if(waitingForWallet) {
      return "Please Check Wallet...";
    }
    if(waitingForTransaction) {
      return "Awaiting Transaction";
    }
    return "Claim";
  }

  const getApproveButtonText = (waitingForWallet: boolean, waitingForTransaction: boolean) => {
    if(waitingForWallet) {
      return "Please Check Wallet...";
    }
    if(waitingForTransaction) {
      return "Awaiting Transaction";
    }
    return "Approve Redemption";
  }

  const getNotOwnerButtonText = () => {
    if(tokenOwner === PROPY_KEY_REPOSSESSION_CONTRACT) {
      return "Redemption Complete";
    }
    return "Not PropyKey Owner";
  }

  const { 
    executeTransaction: executeApprovalTx,
    isAwaitingWalletInteraction: isAwaitingWalletInteractionApprovalTx,
    isAwaitingTx: isAwaitingApprovalTx,
    isLoading: isLoadingApprovalTx,
  } = useUnifiedWriteContract({
    contractConfig: {
      args: [
        PROPY_KEY_REPOSSESSION_CONTRACT,
        propyKeyTokenId,
      ],
      address: BASE_PROPYKEYS_NFT,
      abi: PropyNFTABI,
      functionName: 'approve',
    },
    successToastMessage: 'Approval success! You may now run the redemption.',
  });

  const { 
    executeTransaction: executeRedemptionTx,
    isAwaitingWalletInteraction: isAwaitingWalletInteractionRedemptionTx,
    isAwaitingTx: isAwaitingRedemptionTx,
    isLoading: isLoadingRedemptionTx,
  } = useUnifiedWriteContract({
    contractConfig: {
      args: [
        propyKeyTokenId,
      ],
      address: PROPY_KEY_REPOSSESSION_CONTRACT,
      abi: PropyKeyRepossessionABI,
      functionName: 'depositPropyKey',
    },
    successToastMessage: `Redemption success!`,
  });

  return (
    <div className={classes.root}>
      {!isMarkedForRepossession &&
        <div>
          <Typography 
            variant={"h3"}
            style={{textAlign: 'center'}}
          >
            PropyOG Claim
          </Typography>
          <Typography 
            variant={"h6"}
            style={{textAlign: 'center', maxWidth: 800, marginLeft: 'auto', marginRight: 'auto'}}
            className={classes.sectionSpacerSmall}
          >
            PropyKey #{propyKeyTokenId} has not been marked for repossession.
          </Typography>
        </div>
      }
      {isMarkedForRepossession &&
        <div>
          <Typography 
            variant={"h3"}
            style={{textAlign: 'center'}}
          >
            PropyOG Claim
          </Typography>
          <Typography 
            variant={"h6"}
            style={{textAlign: 'center', maxWidth: 800, marginLeft: 'auto', marginRight: 'auto'}}
            className={classes.sectionSpacerSmall}
          >
            {(tokenOwner === PROPY_KEY_REPOSSESSION_CONTRACT) &&
              <>
                PropyKey #{propyKeyTokenId} has been exchanged for {ogCountForPropyKey} PropyOG token{(Number(ogCountForPropyKey) > 1) ? "s" : ""}
              </>
            }
            {(tokenOwner !== PROPY_KEY_REPOSSESSION_CONTRACT) &&
              <>
                PropyKey #{propyKeyTokenId} may be exchanged for {ogCountForPropyKey} PropyOG token{(Number(ogCountForPropyKey) > 1) ? "s" : ""}
              </>
            }
          </Typography>
          <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 30 }} style={{display: 'flex', justifyContent: 'center'}} className={classes.sectionSpacerSmall}>
            <Grid item xs={4} sm={4} md={6} lg={5} xl={6}>
              <SingleTokenCardBaseline
                subtleDisableInteraction={true}
                tokenLink={''}
                tokenImage={tokenImage}
                tokenStandard={'ERC-721'}
                tokenId={''}
                tokenCollectionName={'PropyOG'}
                tokenContractAddress={BASE_OG_STAKING_NFT}
                tokenNetwork={undefined}
                tokenTitle={tokenTitle}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 30 }} style={{display: 'flex', justifyContent: 'center'}} className={classes.sectionSpacerSmall}>
            <Grid item xs={4} sm={4} md={6} lg={5} xl={6}>
              {isOwnerOfPropyKey && isRepossessionContractApproved &&
                <FloatingActionButton
                  className={classes.submitButton}
                  buttonColor="secondary"
                  disabled={isAwaitingWalletInteractionRedemptionTx || isAwaitingRedemptionTx || isLoadingRedemptionTx}
                  onClick={() => executeRedemptionTx()}
                  showLoadingIcon={isAwaitingWalletInteractionRedemptionTx || isAwaitingRedemptionTx || isLoadingRedemptionTx}
                  text={getClaimButtonText(isAwaitingWalletInteractionRedemptionTx, isAwaitingRedemptionTx)}
                />
              }
              {isOwnerOfPropyKey && !isRepossessionContractApproved &&
                <FloatingActionButton
                  className={classes.submitButton}
                  buttonColor="secondary"
                  disabled={isAwaitingWalletInteractionApprovalTx || isAwaitingApprovalTx || isLoadingApprovalTx}
                  onClick={() => executeApprovalTx()}
                  showLoadingIcon={isAwaitingWalletInteractionApprovalTx || isAwaitingApprovalTx || isLoadingApprovalTx}
                  text={getApproveButtonText(isAwaitingWalletInteractionApprovalTx, isAwaitingApprovalTx)}
                />
              }
              {!isOwnerOfPropyKey &&
                <FloatingActionButton
                  className={classes.submitButton}
                  buttonColor="secondary"
                  disabled={true}
                  onClick={() => {}}
                  showLoadingIcon={false}
                  text={getNotOwnerButtonText()}
                />
              }
            </Grid>
          </Grid>
        </div>
      }
    </div>
  )
}

export default PropyKeyRepossession;