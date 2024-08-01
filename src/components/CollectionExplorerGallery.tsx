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

import { getResolvableIpfsLink } from '../utils';

import LinkWrapper from '../components/LinkWrapper';

import NFTLikeZoneContainer from '../containers/NFTLikeZoneContainer';
import GenericTitleContainer from '../containers/GenericTitleContainer';

import { PropsFromRedux } from '../containers/CollectionExplorerGalleryContainer'

import {
  IExplorerGalleryEntry,
} from '../interfaces';

import {
  PROPY_LIGHT_BLUE,
} from '../utils/constants';

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
      marginTop: theme.spacing(1),
    },
    descriptionSpacerMobile: {
      marginBottom: theme.spacing(2),
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

  // const infoTransitions = useTransition(getVisibleIndices(), {
  //   from: (index) => ({
  //     opacity: 0,
  //     transform: `scale(${index === selectedEntryIndex ? 1 : 0.5})`,
  //     top: index === selectedEntryIndex ? `0px` : `0px`
  //   }),
  //   enter: (index) => ({
  //     opacity: index === selectedEntryIndex ? 1 : 0,
  //     transform: `scale(${index === selectedEntryIndex ? 1 : 0.5})`,
  //     top: index === selectedEntryIndex ? `0px` : `0px`,
  //   }),
  //   update: (index) => ({
  //     opacity: index === selectedEntryIndex ? 1 : 0,
  //     transform: `scale(${index === selectedEntryIndex ? 1 : 0.5})`,
  //     top: index === selectedEntryIndex ? `0px` : `0px`,
  //   }),
  //   leave: { opacity: 0 },
  //   config: { duration: 200 },
  // })

  const {
    token_id = false,
    asset_address = false,
    network_name = false,
    metadata = false,
  } = explorerEntries[selectedEntryIndex]?.nftRecord ? explorerEntries[selectedEntryIndex]?.nftRecord : {};

  const {
    name = false,
    collection_name = false,
    slug = false,
  } = explorerEntries[selectedEntryIndex]?.assetRecord ? explorerEntries[selectedEntryIndex]?.assetRecord : {};

  return (
    <div className={isConsideredMobile ? classes.rootMobile : classes.rootDesktop}>
      <div className={[classes.rootChild, isConsideredMobile ? classes.rootChildMobile : classes.rootChildDesktop].join(" ")}>
        <div className={[classes.carouselContainer, isConsideredMobile ? classes.carouselContainerMobile : classes.carouselContainerDesktop].join(" ")}>
          {!isLoading && explorerEntries.length > 0 && transitions((style, index) => {
            if (typeof index !== 'number' || isNaN(index) || index < 0 || index >= explorerEntries.length) {
              return null;
            }
            return (
              <animated.img
                key={`${uniqueId}-${index}`}
                style={style}
                className={classes.image}
                src={getResolvableIpfsLink(explorerEntries[index]?.nftRecord?.metadata?.image ?? "")}
                alt={`NFT ${index + 1}`}
              />
            );
          })}
          {isLoading && 
            <div></div>
          }
          {
            (explorerEntries.length > 0) && 
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
        <div className={isConsideredMobile ? classes.infoZoneMobile : classes.infoZoneDesktop}>
            <LinkWrapper link={`collection/${network_name}/${overrideSlug ? overrideSlug : slug}`}>
              <Typography variant="h6" style={{color: PROPY_LIGHT_BLUE}}>
                {!overrideTitle &&
                  `${collection_name ? collection_name : name}`
                }
                {overrideTitle && overrideTitle}
              </Typography>
            </LinkWrapper>
            <Typography variant='h4'>
              {metadata && metadata?.name ? metadata?.name : ""}
            </Typography>
            {
              token_id && 
              asset_address && 
              network_name && 
              <div className={[classes.likeContainer, 'secondary-text-light-mode'].join(" ")}>
                <NFTLikeZoneContainer 
                  // compact={true}
                  tokenId={token_id}
                  tokenAddress={asset_address}
                  tokenNetwork={network_name}
                />
              </div>
            }
            {metadata && metadata?.description &&
              <>
                <GenericTitleContainer variant={"h5"} marginBottom={8} marginTop={16} title="Description"/>
                <Typography variant="body1" className={isConsideredMobile ? classes.descriptionSpacerMobile : ''}>{metadata?.description}</Typography>
              </>
            }
            {
              token_id &&
              asset_address && 
              network_name && 
              <div style={{marginTop: 16}}>
                <LinkWrapper className={isConsideredMobile ? "full-width" : ""} link={`token/${network_name}/${asset_address}/${token_id}`}>
                  <Button className={isConsideredMobile ? "margin-top-8" : ""} variant="contained" color="secondary">
                    View Full Details
                  </Button>
                </LinkWrapper>
              </div>
            }
        </div>
      </div>
    </div>
  )
}

export default CollectionExplorerGallery