import React, { useEffect, useState } from 'react';

import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import Grid from '@mui/material/Grid';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

import { useParams } from 'react-router-dom';

import { toast } from 'sonner'

import GenericPageContainer from '../containers/GenericPageContainer';
import GenericTitleContainer from '../containers/GenericTitleContainer';
import ListingGalleryContainer from '../containers/ListingGalleryContainer';
import PropyKeysHomeListingContactFormContainer from '../containers/PropyKeysHomeListingContactFormContainer';

import SingleTokenCardBaseline from '../components/SingleTokenCardBaseline';

import LinkWrapper from '../components/LinkWrapper';

import BathroomIcon from '../assets/svg/bathroom-icon.svg';
import BedroomIcon from '../assets/svg/bedroom-icon.svg';
// import FloorSizeIcon from '../assets/svg/floor-size-icon.svg';
import LotSizeIcon from '../assets/svg/lot-size-icon.svg';

import RefreshIcon from '@mui/icons-material/Refresh';

import {
  PropyKeysListingService,
} from '../services/api';

import {
  IPropyKeysHomeListingRecord,
  INFTRecord,
} from '../interfaces';

import {
  API_ENDPOINT,
  PROPY_LIGHT_BLUE,
  RECAPTCHA_KEY,
} from '../utils/constants';

import {
  priceFormat,
  getResolvableIpfsLink,
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

    },
    descriptionSpacerDesktop: {
      marginBottom: theme.spacing(2),
    },
    priceZone: {
      marginTop: theme.spacing(2),
    },
    quickSpecsZone: {
      marginTop: theme.spacing(2),
      display: 'flex',
    },
    quickSpecsZoneMobile: {
      marginBottom: theme.spacing(2),
    },
    quickSpecEntry: {
      display: 'flex',
      alignItems: 'center',
      marginRight: theme.spacing(2)
    },
    quickSpecEntryIcon: {
      height: 30,
      marginRight: theme.spacing(1),
    },
    quickSpecEntryText: {
      textTransform: 'none',
      fontSize: '1rem',
    },
  }),
);

interface ISingleListingPage {
  isConsideredMobile: boolean,
}

const SingleListingPage = (props: ISingleListingPage) => {

    const {
      isConsideredMobile,
    } = props;

    const classes = useStyles();

    const [listingRecord, setListingRecord] = useState<IPropyKeysHomeListingRecord | null>(null);
    const [fetchIndex, setFetchIndex] = useState<number>(0);
    const [isMetadataRefreshing, setIsMetadataRefreshing] = useState<boolean>(false);
    const [nftRecord, setNftRecord] = useState<null | INFTRecord>(null);

    let { 
      network,
      tokenAddress,
      tokenId,
    } = useParams();

    useEffect(() => {
      let isMounted = true;
      const fetchListing = async () => {
        let queryUrl = `${API_ENDPOINT}/listing/propykeys/${network}/${tokenAddress}/${tokenId}`;
        let listingRecordQueryResponse = await fetch(queryUrl).then(resp => resp.json());
        if(listingRecordQueryResponse?.status && listingRecordQueryResponse?.data && isMounted) {
          setListingRecord(listingRecordQueryResponse?.data);
          if(listingRecordQueryResponse?.data?.nft) {
            setNftRecord(listingRecordQueryResponse?.data?.nft);
          } else {
            setNftRecord(null);
          }
        } else if(isMounted) {
          setListingRecord(null);
          setNftRecord(null);
        }
      }
      fetchListing();
      return () => {
        isMounted = false;
      }
    }, [network, tokenAddress, tokenId, fetchIndex])

    const refreshTokenMetadata = async () => {
      if(network && tokenAddress && tokenId) {
        try {
          setIsMetadataRefreshing(true);
          let refreshMetadataResponse = await PropyKeysListingService.refreshMetadata(network, tokenAddress, tokenId);
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
      let quickSpecs = [];

      if(listingRecord?.bathrooms) {
        quickSpecs.push({
          icon: BathroomIcon,
          value: `${listingRecord?.bathrooms} ba`
        })
      }

      if(listingRecord?.bedrooms) {
        quickSpecs.push({
          icon: BedroomIcon,
          value: `${listingRecord?.bedrooms} bd`
        })
      }

      if(listingRecord?.lot_size) {
        quickSpecs.push({
          icon: LotSizeIcon,
          value: `${listingRecord?.lot_size} ft²`
        })
      }

      if(listingRecord) {
        return (
          <>
            <LinkWrapper link={`listings/${listingRecord.network_name}/${listingRecord.asset_address}`}>
              <Typography variant="h6" style={{color: PROPY_LIGHT_BLUE}}>
                {
                  `PropyKeys Home Listings`
                }
              </Typography>
            </LinkWrapper>
            <Typography variant="h3" style={{fontWeight: 'bold'}}>
              {
                listingRecord && listingRecord.full_address
              }
            </Typography>
            <div className={[classes.actionInfoContainer, 'secondary-text-light-mode'].join(" ")}>
              <div className={[classes.actionInfoEntry, 'clickable', isMetadataRefreshing ? 'disable-click' : ''].join(" ")} onClick={() => refreshTokenMetadata()}>
                {!isMetadataRefreshing && <RefreshIcon className={classes.actionInfoEntryIcon} />}
                {isMetadataRefreshing && <CircularProgress className={classes.actionInfoProgressIcon} style={{width: 18, height: 18}} color="inherit"/>}
                <Typography variant="body1" className={classes.actionInfoEntryText}>Refresh Listing Data</Typography>
              </div>
            </div>
            <Typography className={classes.priceZone} variant="h5" style={{fontWeight: 'bold'}}>
              {
                listingRecord?.price && priceFormat(listingRecord.price, 2, "$")
              }
            </Typography>
            {quickSpecs.length > 0 &&
              <div className={[classes.quickSpecsZone, isConsideredMobile ? classes.quickSpecsZoneMobile : ""].join(" ")}>
                {quickSpecs.map((entry) => 
                  <div className={classes.quickSpecEntry}>
                    <img alt={entry.value} className={classes.quickSpecEntryIcon} src={entry.icon} />
                    <Typography className={classes.quickSpecEntryText} variant="button">{entry.value}</Typography>
                  </div>
                )}
              </div>
            }
          </>
        )
      }
    }

    const renderSecondaryContent = () => {

      if(listingRecord) {
        return (
          <>
            {/* {tokenId && tokenAddress && network && 
              <div className={[classes.likeContainer, 'secondary-text-light-mode'].join(" ")}>
                <NFTLikeZoneContainer onSuccess={() => setFetchIndex(fetchIndex + 1)} tokenId={tokenId} tokenAddress={tokenAddress} tokenNetwork={network} />
              </div>
            } */}
            {listingRecord?.description &&
              <>
                <GenericTitleContainer variant={"h5"} paddingBottom={8} marginTop={24} title="Description"/>
                <Typography variant="body1" className={isConsideredMobile ? classes.descriptionSpacerMobile : classes.descriptionSpacerDesktop}>{listingRecord?.description}</Typography>
              </>
            }
          </>
        )
      }
    }

    return (
        <GenericPageContainer>
          <Grid container spacing={6} columns={12}>
            <Grid item xs={12} sm={12} md={12} lg={7}>
              {isConsideredMobile && renderPrimaryContent()}
              <ListingGalleryContainer images={listingRecord?.images ? listingRecord?.images : []} />
              {isConsideredMobile && renderSecondaryContent()}
              {/* {tokenMetadata?.attributes && tokenMetadata?.attributes?.length > 0 && 
                <div className={classes.sectionSpacer}>
                  <TokenInfoAccordionContainer tokenRecord={tokenRecord} tokenMetadata={tokenMetadata} />
                </div>
              } */}
              {nftRecord &&
                <>
                <GenericTitleContainer variant={"h5"} paddingBottom={8} marginTop={24} title="Associated PropyKeys Record"/>
                  <div style={{maxWidth: 350}}>
                    <SingleTokenCardBaseline
                      tokenLink={`token/${nftRecord?.network_name}/${nftRecord.asset_address}/${nftRecord.token_id}`}
                      tokenImage={nftRecord?.metadata?.image ? getResolvableIpfsLink(nftRecord.metadata.image) : undefined}
                      tokenStandard={nftRecord?.asset?.standard}
                      tokenId={nftRecord?.token_id}
                      tokenCollectionName={nftRecord?.asset?.collection_name}
                      tokenContractAddress={nftRecord?.asset_address}
                      tokenNetwork={nftRecord?.network_name}
                      tokenTitle={nftRecord?.metadata?.name ? nftRecord?.metadata?.name : ""}
                    />
                  </div>
                </>
              }
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={5}>
              {listingRecord &&
                <>
                  {!isConsideredMobile && renderPrimaryContent()}
                  {!isConsideredMobile && renderSecondaryContent()}
                  {/* {tokenMetadata?.timeline && tokenMetadata?.timeline.length > 0 &&
                    <>
                      <GenericTitleContainer variant={"h5"} paddingBottom={8} marginTop={24} title={getTimelineTitle(tokenAddress)} />
                      <TokenMetadataTimelineContainer timeline={tokenMetadata?.timeline} />
                    </>
                  } */}
                  {/* <GenericTitleContainer variant={"h5"} paddingBottom={8} marginTop={24} marginBottom={12} title="History"/>
                  {tokenEventRecord && <EventHistoryContainer eventRecords={tokenEventRecord} assetRecord={tokenRecord} />}
                  {allowSignalInterest && tokenId && tokenAddress && network && 
                    <>
                      <GenericTitleContainer variant={"h5"} paddingBottom={8} marginTop={24} marginBottom={12} title="Offers" actionComponent={<SignalInterestContainer onSuccess={() => setFetchIndex(fetchIndex + 1)} tokenId={tokenId} tokenAddress={tokenAddress} tokenNetwork={network} />}/>
                      <div className={classes.sectionSpacer}>
                        {tokenEventRecord && <OfferListContainer offerRecords={tokenOfferList} />}
                      </div>
                    </>
                  } */}
                  {RECAPTCHA_KEY && tokenId &&
                    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_KEY}>
                      <PropyKeysHomeListingContactFormContainer tokenId={tokenId} />
                    </GoogleReCaptchaProvider>
                  }
                </>
              }
            </Grid>
          </Grid>
        </GenericPageContainer>
    )
};

export default SingleListingPage;