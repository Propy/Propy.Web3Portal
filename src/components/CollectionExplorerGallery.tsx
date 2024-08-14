import React, { useState, useId } from 'react';

import { animated, useTransition } from '@react-spring/web';

import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Fab from '@mui/material/Fab';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import ArrowNext from '@mui/icons-material/ArrowForwardIos';
import ArrowPrevious from '@mui/icons-material/ArrowBackIosNew';

import { getResolvableIpfsLink, priceFormat } from '../utils';

import LinkWrapper from '../components/LinkWrapper';

import NFTLikeZoneContainer from '../containers/NFTLikeZoneContainer';
import PropyKeysHomeListingLikeZoneContainer from '../containers/PropyKeysHomeListingLikeZoneContainer';
import GenericTitleContainer from '../containers/GenericTitleContainer';

import BathroomIcon from '../assets/svg/bathroom-icon.svg';
import BedroomIcon from '../assets/svg/bedroom-icon.svg';
import LotSizeIcon from '../assets/svg/lot-size-icon.svg';

import { PropsFromRedux } from '../containers/CollectionExplorerGalleryContainer'

import {
  IExplorerGalleryEntry,
} from '../interfaces';

import {
  PROPY_LIGHT_BLUE,
} from '../utils/constants';

import PlaceholderImage from '../assets/img/placeholder.webp';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    rootDesktop: {
      width: '100%',
      height: '512px',  // Adjust as needed
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    rootMobile: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    rootChild: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    rootChildDesktop: {
      flexDirection: "row",
    },
    rootChildMobile: {
      flexDirection: "column",
    },
    carouselContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      boxShadow: '0px 0px 5px -1px rgba(0, 0, 0, 0.5)',
      borderRadius: 15,
      position: 'relative',
      border: '4px solid white',
    },
    carouselContainerDesktop: {
      width: '512px',
      height: '512px',
    },
    carouselContainerMobile: {
      width: '100%',
      aspectRatio: '1 / 1',
    },
    image: {
      position: 'absolute',
      height: '100%',  // Adjust as needed
      objectFit: 'contain',
      transition: 'all 0.3s ease',
      borderRadius: 10,
    },
    controlsOverlayContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing(2),
    },
    controlsOverlayContainerOption2: {
      position: 'absolute',
      top: 0,
      left: '-45px',
      width: '600px',
      height: '512px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing(2),
    },
    infoZoneDesktop: {
      paddingLeft: theme.spacing(4),
      width: 'calc(100% - 512px)',
      alignSelf: 'flex-start',
    },
    infoZoneMobile: {
      marginTop: theme.spacing(2),
      width: 'calc(100%)',
      alignSelf: 'flex-start',
    },
    animatedTitle: {
      position: 'absolute',
    },
    likeContainer: {
      marginTop: theme.spacing(2),
    },
    descriptionSpacerMobile: {
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
    descriptionSpacerDesktop: {
      marginBottom: theme.spacing(2),
    },
    placeholderImage: {
      maxWidth: '100%',
      maxHeight: '100%',
    }
  }),
)

interface ICollectionExplorerGallery {
  explorerEntries: IExplorerGalleryEntry[],
  fullWidth: boolean,
  overrideTitle?: string,
  overrideSlug?: string,
  isLoading?: boolean,
}

const CollectionExplorerGallery = ({ 
  explorerEntries,
  isConsideredMobile,
  isConsideredMedium,
  fullWidth,
  overrideTitle,
  overrideSlug,
  isLoading,
}: ICollectionExplorerGallery & PropsFromRedux) => {

  const uniqueId = useId();

  const classes = useStyles()
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(0)

  const handleNext = () => {
    setSelectedEntryIndex((prevIndex) => 
      explorerEntries.length > 0 ? (prevIndex + 1) % explorerEntries.length : 0
    )
  }
  
  const handlePrevious = () => {
    setSelectedEntryIndex((prevIndex) => 
      explorerEntries.length > 0 ? (prevIndex - 1 + explorerEntries.length) % explorerEntries.length : 0
    )
  }

  const getVisibleIndices = () => {
    if (!Array.isArray(explorerEntries) || explorerEntries.length === 0) {
      return [];
    }
  
    const length = explorerEntries.length;
    const safeIndex = Math.max(0, Math.min(Math.floor(selectedEntryIndex), length - 1));
  
    const prev = (safeIndex - 1 + length) % length;
    const next = (safeIndex + 1) % length;
  
    return [prev, safeIndex, next];
  }

  const transitions = useTransition(getVisibleIndices(), {
    from: (index) => ({
      opacity: 0,
      transform: `translateX(${(index - selectedEntryIndex) * 100}%) scale(${index === selectedEntryIndex ? 1 : 0.8})`,
    }),
    enter: (index) => ({
      opacity: index === selectedEntryIndex ? 1 : 0,
      transform: `translateX(${(index - selectedEntryIndex) * 100}%) scale(${index === selectedEntryIndex ? 1 : 0.8})`,

    }),
    update: (index) => ({
      opacity: index === selectedEntryIndex ? 1 : 0,
      transform: `translateX(${(index - selectedEntryIndex) * 100}%) scale(${index === selectedEntryIndex ? 1 : 0.8})`,
    }),
    leave: { opacity: 0 },
    config: { duration: 100 },
  })

  const {
    type = false,
  } = explorerEntries[selectedEntryIndex] ? explorerEntries[selectedEntryIndex] : {};

  const listingRecord = (explorerEntries[selectedEntryIndex]?.type === "LISTING" && explorerEntries[selectedEntryIndex]?.listingRecord) ? explorerEntries[selectedEntryIndex]?.listingRecord : false;

  const {
    token_id = false,
    asset_address = false,
    network_name = false,
    metadata = false,
  } = (explorerEntries[selectedEntryIndex]?.type === "NFT" && explorerEntries[selectedEntryIndex]?.nftRecord) ? explorerEntries[selectedEntryIndex]?.nftRecord : {};

  const {
    name = false,
    collection_name = false,
    slug = false,
  } = explorerEntries[selectedEntryIndex]?.collectionRecord ? explorerEntries[selectedEntryIndex]?.collectionRecord : {};

  const renderPrimaryContentListing = () => {
    if(listingRecord) {
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
            <LinkWrapper link={`listings/${listingRecord?.network_name}/${listingRecord?.asset_address}`}>
              <Typography variant="h6" style={{color: PROPY_LIGHT_BLUE}}>
                {
                  `PropyKeys Home Listings`
                }
              </Typography>
            </LinkWrapper>
            <Typography variant="h4">
              {
                listingRecord && listingRecord?.full_address
              }
            </Typography>
            <Typography className={classes.priceZone} variant="h5" style={{fontWeight: 'bold'}}>
              {
                listingRecord?.price && priceFormat(listingRecord?.price, 2, "$")
              }
            </Typography>
            {quickSpecs.length > 0 &&
              <div className={[classes.quickSpecsZone, (isConsideredMobile || isConsideredMedium) ? classes.quickSpecsZoneMobile : ""].join(" ")}>
                {quickSpecs.map((entry) => 
                  <div className={classes.quickSpecEntry}>
                    <img alt={entry.value} className={classes.quickSpecEntryIcon} src={entry.icon} />
                    <Typography className={classes.quickSpecEntryText} variant="button">{entry.value}</Typography>
                  </div>
                )}
              </div>
            }
            {listingRecord?.id && 
              <div className={[classes.likeContainer, 'secondary-text-light-mode'].join(" ")}>
                <PropyKeysHomeListingLikeZoneContainer propyKeysHomeListingId={listingRecord?.id.toString()} />
              </div>
            }
            {
              listingRecord.token_id &&
              listingRecord.asset_address && 
              listingRecord.network_name && 
              <div style={{marginTop: 16}}>
                <LinkWrapper className={(isConsideredMobile || isConsideredMedium) ? "full-width" : ""} link={`listing/${listingRecord.network_name}/${listingRecord.asset_address}/${listingRecord.token_id}`}>
                  <Button className={(isConsideredMobile || isConsideredMedium) ? "margin-top-8" : ""} variant="contained" color="secondary">
                    View Full Details
                  </Button>
                </LinkWrapper>
              </div>
            }
          </>
        )
      }
    }
  }

  return (
    <div className={(isConsideredMobile || isConsideredMedium) ? classes.rootMobile : classes.rootDesktop}>
      <div className={[classes.rootChild, (isConsideredMobile || isConsideredMedium) ? classes.rootChildMobile : classes.rootChildDesktop].join(" ")}>
        <div className={[classes.carouselContainer, (isConsideredMobile || isConsideredMedium) ? classes.carouselContainerMobile : classes.carouselContainerDesktop].join(" ")}>
          {!isLoading && explorerEntries.length > 0 && transitions((style, index) => {
            if (typeof index !== 'number' || isNaN(index) || index < 0 || index >= explorerEntries.length) {
              return null;
            }
            return (
              <animated.img
                key={`${uniqueId}-${type}-${index}`}
                style={style}
                className={classes.image}
                src={explorerEntries[index]?.type === "NFT" ? getResolvableIpfsLink(explorerEntries[index]?.nftRecord?.metadata?.image ?? "") : explorerEntries[index]?.listingRecord?.images?.[0]}
                alt={`NFT ${index + 1}`}
              />
            );
          })}
          {(isLoading || explorerEntries?.length === 0) && 
            <img className={classes.placeholderImage} src={PlaceholderImage} alt="placeholder" />
          }
          {
            (explorerEntries.length > 1) && 
              <div className={classes.controlsOverlayContainer}>
                <Fab onClick={() => handlePrevious()} color="default" aria-label="previous">
                  <ArrowPrevious />
                </Fab>
                <Fab onClick={() => handleNext()} color="default" aria-label="next">
                  <ArrowNext />
                </Fab>
              </div>
          }
        </div>
        <div className={(isConsideredMobile || isConsideredMedium) ? classes.infoZoneMobile : classes.infoZoneDesktop}>
            {(explorerEntries[selectedEntryIndex]?.type === "NFT" || isLoading) &&
              <>
                <LinkWrapper link={`collection/${network_name}/${overrideSlug ? overrideSlug : slug}`}>
                  <Typography variant="h6" style={{color: PROPY_LIGHT_BLUE}}>
                    {!overrideTitle &&
                      `${collection_name ? collection_name : name}`
                    }
                    {overrideTitle && overrideTitle}
                  </Typography>
                </LinkWrapper>
                <Typography variant='h4'>
                  {((!isLoading && metadata) && metadata?.name) ? metadata?.name : ""}
                  {isLoading && `Loading...`}
                </Typography>
                <div className={[classes.likeContainer, 'secondary-text-light-mode'].join(" ")}>
                  <NFTLikeZoneContainer 
                    // compact={true}
                    tokenId={token_id}
                    tokenAddress={asset_address}
                    tokenNetwork={network_name}
                    isPlaceholder={isLoading}
                  />
                </div>
                {(!isLoading && metadata && metadata?.description) &&
                  <>
                    <GenericTitleContainer variant={"h5"} marginBottom={8} marginTop={16} title="Description"/>
                    <Typography variant="body1" className={(isConsideredMobile || isConsideredMedium) ? classes.descriptionSpacerMobile : ''}>{metadata?.description}</Typography>
                  </>
                }
                {isLoading &&
                  <>
                    <GenericTitleContainer variant={"h5"} marginBottom={8} marginTop={16} title="Description"/>
                    <Typography variant="body1" className={(isConsideredMobile || isConsideredMedium) ? classes.descriptionSpacerMobile : ''}>Loading Description...</Typography>
                  </>
                }
                {
                  token_id &&
                  asset_address && 
                  network_name && 
                  <div style={{marginTop: 16}}>
                    <LinkWrapper className={(isConsideredMobile || isConsideredMedium) ? "full-width" : ""} link={`token/${network_name}/${asset_address}/${token_id}`}>
                      <Button className={(isConsideredMobile || isConsideredMedium) ? "margin-top-8" : ""} variant="contained" color="secondary">
                        View Full Details
                      </Button>
                    </LinkWrapper>
                  </div>
                }
                {
                  isLoading &&
                  <div style={{marginTop: 16}}>
                    <Button className={(isConsideredMobile || isConsideredMedium) ? "margin-top-8" : ""} variant="contained" color="secondary">
                      Loading...
                    </Button>
                  </div>
                }
              </>
            }
            {explorerEntries[selectedEntryIndex]?.type === "LISTING" &&
              <>
                {renderPrimaryContentListing()}
              </>
            }
        </div>
      </div>
    </div>
  )
}

export default CollectionExplorerGallery