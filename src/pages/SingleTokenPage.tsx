import React, { useState } from 'react';

import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import Grid from '@mui/material/Grid';

import { useParams } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { toast } from 'sonner'

import GenericPageContainer from '../containers/GenericPageContainer';
import TokenInfoAccordionContainer from '../containers/TokenInfoAccordionContainer';
import GenericTitleContainer from '../containers/GenericTitleContainer';
import EventHistoryContainer from '../containers/EventHistoryContainer';
import TokenMetadataTimelineContainer from '../containers/TokenMetadataTimelineContainer';
import SignalInterestContainer from '../containers/SignalInterestContainer';
import OfferListContainer from '../containers/OfferListContainer';
import NFTLikeZoneContainer from '../containers/NFTLikeZoneContainer';

import LinkWrapper from '../components/LinkWrapper';
import SingleListingCard from '../components/SingleListingCard';

import PlaceholderImage from '../assets/img/placeholder.webp';
import DefaultTokenImage from '../assets/img/default-token.webp';

import RefreshIcon from '@mui/icons-material/Refresh';

import {
  NFTService,
} from '../services/api';

import {
  IAssetRecord,
  ITokenMetadata,
  ITransferEventERC20Record,
  ITransferEventERC721Record,
  IOfferRecord,
  TokenStandard,
  IPropyKeysHomeListingRecord,
} from '../interfaces';

import {
  API_ENDPOINT,
  TOKEN_NAME_PREFIX,
  TOKEN_NAME_HIDE_ID,
  PROPY_LIGHT_BLUE,
  MINT_AN_ADDRESS_NFT_ADDRESSES,
  COLLECTIONS_PAGE_ENTRIES,
} from '../utils/constants';

import {
  getResolvableIpfsLink,
  // priceFormat,
} from '../utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
        minWidth: 275,
        marginBottom: 15,
        marginTop: 15,
    },
    tokenImage: {
      paddingTop: '100%',
      backgroundPosition: 'center',
      backgroundSize: 'contain',
      borderRadius: 20,
    },
    sectionSpacer: {
      marginTop: theme.spacing(2),
    },
    actionInfoContainer: {

    },
    actionInfoEntry: {
      display: 'flex',
      alignItems: 'center',
    },
    actionInfoEntryIcon: {
      marginRight: 4,
    },
    actionInfoProgressIcon: {
      marginRight: 10,
    },
    actionInfoEntryText: {
      fontWeight: 500,
    },
    likeContainer: {
      marginTop: theme.spacing(3),
    },
    descriptionSpacerMobile: {
      marginBottom: theme.spacing(2),
    }
  }),
);

const MetadataPRO = {
  name: "PRO",
  image: '',
  attributes: [
    {
      trait_type: 'Standard',
      value: 'ERC-20',
    },
    {
      trait_type: 'Max Supply',
      value: '100,000,000',
    },
    {
      // TODO index circ supply on backend
      trait_type: 'Circulating Supply',
      value: '57,896,591',
    }
  ]
}

const getTimelineTitle = (tokenAddress: string | undefined) => {
  if(tokenAddress && MINT_AN_ADDRESS_NFT_ADDRESSES.indexOf(tokenAddress) > -1) {
    return "Timeline";
  }
  return "Transaction Timeline";
}

interface ISingleTokenPage {
  isConsideredMobile: boolean,
}

const SingleTokenPage = (props: ISingleTokenPage) => {

    const {
      isConsideredMobile,
    } = props;

    const classes = useStyles();

    const [fetchIndex, setFetchIndex] = useState<number>(0);
    const [isMetadataRefreshing, setIsMetadataRefreshing] = useState<boolean>(false);
    const [allowSignalInterest] = useState(true);

    let { 
      network,
      tokenAddress,
      tokenId,
    } = useParams();

    const { 
      data: tokenDataTanstack,
      // isLoading: isLoadingTokenDataTanstack,
    } = useQuery({
      queryKey: ['token-page', network, tokenAddress, tokenId, fetchIndex],
      queryFn: async () => {
        let queryUrl = `${API_ENDPOINT}/asset/${network}/${tokenAddress}`;
        if(tokenId) {
          queryUrl = `${API_ENDPOINT}/nft/${network}/${tokenAddress}/${tokenId}`;
        }
        let tokenRecordQueryResponse = await fetch(queryUrl).then(resp => resp.json());
        let tokenRecord : IAssetRecord | null = null;
        let tokenStandard : TokenStandard | null = null;
        let tokenMetadata : ITokenMetadata | null =null;
        let tokenEventRecord : ITransferEventERC721Record[] | ITransferEventERC20Record[] | null = null;
        let tokenOfferList : IOfferRecord[] | null = null;
        let listingRecord : IPropyKeysHomeListingRecord | null = null;
        if(tokenRecordQueryResponse?.status && tokenRecordQueryResponse?.data) {
          tokenRecord = tokenRecordQueryResponse?.data?.asset ? tokenRecordQueryResponse?.data?.asset : tokenRecordQueryResponse?.data;
          tokenStandard = tokenRecordQueryResponse?.data?.asset ? tokenRecordQueryResponse?.data?.asset?.standard : tokenRecordQueryResponse?.data?.standard;
          // if(tokenRecordQueryResponse?.data?.transfer_event_erc20_count) {
          //   MetadataPRO.attributes.push({
          //     trait_type: "Transfers",
          //     value: priceFormat(tokenRecordQueryResponse?.data?.transfer_event_erc20_count, 0, ''),
          //   })
          // }
          if(tokenRecordQueryResponse?.data?.transfer_events_erc721) {
            tokenEventRecord = tokenRecordQueryResponse?.data?.transfer_events_erc721;
          } else if(tokenRecordQueryResponse?.data?.transfer_events_erc20) {
            tokenEventRecord = tokenRecordQueryResponse?.data?.transfer_events_erc20;
          }
          if(tokenRecordQueryResponse?.data?.offchain_offers) {
            tokenOfferList = tokenRecordQueryResponse?.data?.offchain_offers;
          }
          if(tokenRecordQueryResponse?.data?.propykeys_home_listing) {
            listingRecord = tokenRecordQueryResponse?.data?.propykeys_home_listing;
          }
          if(tokenRecordQueryResponse?.data?.metadata) {
            let metadata = tokenRecordQueryResponse?.data?.metadata ? tokenRecordQueryResponse?.data?.metadata : {};
            if(metadata && metadata.name !== null) {
              tokenMetadata = metadata;
            }
          }
        }
        return {
          tokenRecord,
          tokenStandard,
          tokenMetadata,
          tokenEventRecord,
          tokenOfferList,
          listingRecord,
        }
      },
      gcTime: 5 * 60 * 1000,
      staleTime: 60 * 1000,
    });

    const matchedListingRecord = tokenDataTanstack?.listingRecord?.asset_address ? COLLECTIONS_PAGE_ENTRIES.find((entry) => entry.address === tokenDataTanstack?.listingRecord?.asset_address) : false;

    const refreshTokenMetadata = async () => {
      if(network && tokenAddress && tokenId) {
        try {
          setIsMetadataRefreshing(true);
          let refreshMetadataResponse = await NFTService.refreshMetadata(network, tokenAddress, tokenId);
          if(refreshMetadataResponse?.data?.message) {
            await toast.success(refreshMetadataResponse?.data?.message);
            // trigger refetch of token record / metadata
            setFetchIndex(fetchIndex + 1);
          }
        } catch (e) {
          console.log({e});
        }
      }
      setIsMetadataRefreshing(false);
    }

    const renderPrimaryContent = () => {
      if(tokenDataTanstack?.tokenRecord) {
        return (
          <>
            <LinkWrapper link={`collection/${tokenDataTanstack?.tokenRecord.network_name}/${tokenDataTanstack?.tokenRecord.slug}`}>
              <Typography variant="h6" style={{color: PROPY_LIGHT_BLUE}}>
                {
                  `${tokenDataTanstack?.tokenRecord.collection_name ? tokenDataTanstack?.tokenRecord.collection_name : tokenDataTanstack?.tokenRecord.name} `
                }
              </Typography>
            </LinkWrapper>
            <Typography variant="h3" style={{fontWeight: 'bold'}}>
              {
                tokenDataTanstack?.tokenMetadata && `${TOKEN_NAME_PREFIX[tokenDataTanstack?.tokenRecord.address] ? `${TOKEN_NAME_PREFIX[tokenDataTanstack?.tokenRecord.address]} ${tokenDataTanstack?.tokenMetadata.name}` : tokenDataTanstack?.tokenMetadata.name}`
              }
              {
                TOKEN_NAME_HIDE_ID[tokenDataTanstack?.tokenRecord.address] && tokenDataTanstack?.tokenMetadata ? '' : ` #${tokenId}`
              }
            </Typography>
            <div className={[classes.actionInfoContainer, 'secondary-text-light-mode'].join(" ")}>
              <div className={[classes.actionInfoEntry, 'clickable', isMetadataRefreshing ? 'disable-click' : ''].join(" ")} onClick={() => refreshTokenMetadata()}>
                {!isMetadataRefreshing && <RefreshIcon className={classes.actionInfoEntryIcon} />}
                {isMetadataRefreshing && <CircularProgress className={classes.actionInfoProgressIcon} style={{width: 18, height: 18}} color="inherit"/>}
                <Typography variant="body1" className={classes.actionInfoEntryText}>Refresh Metadata</Typography>
              </div>
            </div>
            {tokenId && tokenAddress && network && 
              <div className={[classes.likeContainer, 'secondary-text-light-mode'].join(" ")}>
                <NFTLikeZoneContainer onSuccess={() => setFetchIndex(fetchIndex + 1)} tokenId={tokenId} tokenAddress={tokenAddress} tokenNetwork={network} />
              </div>
            }
            {tokenDataTanstack?.tokenMetadata?.description &&
              <>
                <GenericTitleContainer variant={"h5"} paddingBottom={8} marginTop={24} title="Description"/>
                <Typography variant="body1" className={isConsideredMobile ? classes.descriptionSpacerMobile : ''}>{tokenDataTanstack?.tokenMetadata?.description}</Typography>
              </>
            }
          </>
        )
      }
    }

    return (
        <GenericPageContainer>
          {(!tokenDataTanstack?.tokenStandard || tokenDataTanstack?.tokenStandard === 'ERC-721') &&
            <Grid container spacing={6} columns={12}>
              <Grid item xs={12} sm={12} md={12} lg={5}>
                {isConsideredMobile && renderPrimaryContent()}
                <div className={classes.tokenImage} style={{backgroundImage: `url("${tokenDataTanstack?.tokenMetadata?.image ? getResolvableIpfsLink(tokenDataTanstack?.tokenMetadata?.image) : PlaceholderImage}")`}}/>
                {tokenDataTanstack?.tokenMetadata?.attributes && tokenDataTanstack?.tokenMetadata?.attributes?.length > 0 && 
                  <div className={classes.sectionSpacer}>
                    <TokenInfoAccordionContainer tokenRecord={tokenDataTanstack?.tokenRecord} tokenMetadata={tokenDataTanstack?.tokenMetadata} />
                  </div>
                }
                {tokenDataTanstack?.listingRecord && tokenDataTanstack?.tokenRecord &&
                  <>
                    <GenericTitleContainer variant={"h5"} paddingBottom={8} marginTop={24} title="Associated Home Listing"/>
                    <div style={{maxWidth: 350}}>
                      <SingleListingCard 
                        listingCollectionName={matchedListingRecord && matchedListingRecord?.overrideTitle ? matchedListingRecord?.overrideTitle : ""} 
                        listingRecord={tokenDataTanstack?.listingRecord}
                        assetRecord={tokenDataTanstack?.tokenRecord}
                      />
                    </div>
                  </>
                }
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={7}>
                {tokenDataTanstack?.tokenRecord &&
                  <>
                    {!isConsideredMobile && renderPrimaryContent()}
                    {tokenDataTanstack?.tokenMetadata?.timeline && tokenDataTanstack?.tokenMetadata?.timeline.length > 0 &&
                      <>
                        <GenericTitleContainer variant={"h5"} paddingBottom={8} marginTop={24} title={getTimelineTitle(tokenAddress)} />
                        <TokenMetadataTimelineContainer timeline={tokenDataTanstack?.tokenMetadata?.timeline} />
                      </>
                    }
                    <GenericTitleContainer variant={"h5"} paddingBottom={8} marginTop={24} marginBottom={12} title="History"/>
                    {tokenDataTanstack?.tokenEventRecord && <EventHistoryContainer eventRecords={tokenDataTanstack?.tokenEventRecord} assetRecord={tokenDataTanstack?.tokenRecord} />}
                    {allowSignalInterest && tokenId && tokenAddress && network && 
                      <>
                        <GenericTitleContainer variant={"h5"} paddingBottom={8} marginTop={24} marginBottom={12} title="Offers" actionComponent={<SignalInterestContainer onSuccess={() => setFetchIndex(fetchIndex + 1)} tokenId={tokenId} tokenAddress={tokenAddress} tokenNetwork={network} />}/>
                        <div className={classes.sectionSpacer}>
                          {tokenDataTanstack?.tokenEventRecord && <OfferListContainer offerRecords={tokenDataTanstack?.tokenOfferList} />}
                        </div>
                      </>
                    }
                  </>
                }
              </Grid>
            </Grid>
          }
          {(tokenDataTanstack?.tokenStandard === 'ERC-20') &&
            <Grid container spacing={6} columns={12}>
              <Grid item xs={12} md={5}>
                <div className={classes.tokenImage} style={{backgroundImage: `url("${DefaultTokenImage}")`}}/>
                <div className={classes.sectionSpacer}>
                  <TokenInfoAccordionContainer tokenRecord={tokenDataTanstack?.tokenRecord} tokenMetadata={MetadataPRO} />
                </div>
              </Grid>
              <Grid item xs={12} md={7}>
                {tokenDataTanstack?.tokenRecord &&
                  <>
                    <Typography variant="h2" style={{fontWeight: 'bold'}}>{`PRO Token`}</Typography>
                    {/* <div className={[classes.actionInfoContainer, 'secondary-text-light-mode'].join(" ")}>
                      <div className={[classes.actionInfoEntry, 'clickable', isMetadataRefreshing ? 'disable-click' : ''].join(" ")} onClick={() => refreshTokenMetadata()}>
                        {!isMetadataRefreshing && <RefreshIcon className={classes.actionInfoEntryIcon} />}
                        {isMetadataRefreshing && <CircularProgress className={classes.actionInfoProgressIcon} style={{width: 18, height: 18}} color="inherit"/>}
                        <Typography variant="body1" className={classes.actionInfoEntryText}>Refresh Metadata</Typography>
                      </div>
                    </div> */}
                    <GenericTitleContainer variant={"h5"} paddingBottom={8} marginBottom={12} marginTop={16} title="History"/>
                    {tokenDataTanstack?.tokenRecord?.transfer_events_erc20 && <EventHistoryContainer eventRecords={tokenDataTanstack?.tokenRecord?.transfer_events_erc20} assetRecord={tokenDataTanstack?.tokenRecord} />}
                  </>
                }
              </Grid>
            </Grid>
          }
          {/* {`tokenDataTanstack?.tokenRecord:`}
          <pre style={{maxWidth: '500px', overflow: 'scroll'}}>
            {JSON.stringify(tokenDataTanstack?.tokenRecord, null, 4)}
          </pre>
          {`tokenDataTanstack?.tokenMetadata:`}
          <pre style={{maxWidth: '500px', overflow: 'scroll'}}>
            {JSON.stringify(tokenDataTanstack?.tokenMetadata, null, 4)}
          </pre> */}
        </GenericPageContainer>
    )
};

export default SingleTokenPage;