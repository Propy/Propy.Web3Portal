import React, { useState, useEffect } from 'react';

import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { PropsFromRedux } from '../containers/ReserveAnAddressHomeBannerContainer';

import LinkWrapper from './LinkWrapper';
import MapCard from './MapCard';

import RaTier1Icon from '../assets/svg/ra_tier_1.svg';
import RaTier2Icon from '../assets/svg/ra_tier_2.svg';
import RaTier3Icon from '../assets/svg/ra_tier_3.svg';

import {
  NFTService,
} from '../services/api';

import {
  COLLECTIONS_PAGE_ENTRIES,
  MINT_AN_ADDRESS_LINK,
} from '../utils/constants';

import {
  ICoordinate,
  INFTCoordinateResponse,
} from '../interfaces';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    sectionSpacerMini: {
      marginBottom: theme.spacing(3),
    },
    title: {
      fontWeight: '500',
    },
    subtitle: {
      // marginBottom: theme.spacing(2),
    },
    titleSpacing: {
      marginBottom: theme.spacing(2),
    },
    actionArea: {
      padding: theme.spacing(2),
      textAlign: 'center',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'start',
    },
    card: {
      height: '100%',
      width: '100%',
    },
    cardTitle: {
      marginBottom: theme.spacing(2),
    },
    cardSubtitle: {
      marginBottom: theme.spacing(2),
    },
    cardDescription: {
      marginBottom: theme.spacing(2),
      maxWidth: 350
    },
    tierIconContainer: {
      height: 64,
      width: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: theme.spacing(1),
    },
    tierIcon: {
      maxWidth: '100%',
      maxHeight: '100%',
    }
  }),
);

const maxEntries = 10000;

const ReserveAnAddressHomeBanner = (props: PropsFromRedux) => {

  let {
    isConsideredMobile,
  } = props;

  let collectionConfigEntry = COLLECTIONS_PAGE_ENTRIES.find((entry) => entry.slug === (process?.env?.REACT_APP_ENV === 'prod' ? 'propykeys' : 'propy-home-nft-dev-base-testnet'));

  const [nftCoordinates, setNftCoordinates] = useState<ICoordinate[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchCollection = async () => {
      if(collectionConfigEntry) {
        let collectionResponse = await NFTService.getCoordinatesPaginated(
          collectionConfigEntry.network,
          collectionConfigEntry.address,
          1000,
          1,
        )
        // setIsLoading(false);
        if(collectionResponse?.status && collectionResponse?.data && isMounted) {
          let renderResults : ICoordinate[] = [];
          let apiResponseData : INFTCoordinateResponse = collectionResponse.data;
          if(collectionResponse?.status && apiResponseData?.data) {
            for(let nftRecord of apiResponseData?.data) {
              if(nftRecord.longitude && nftRecord.latitude && (renderResults.length < maxEntries)) {
                renderResults.push({
                  latitude: Number(nftRecord.latitude),
                  longitude: Number(nftRecord.longitude)
                });
              }
            }
          }
          setNftCoordinates(renderResults);
        } else {
          setNftCoordinates([]);
        }
      }else {
        setNftCoordinates([]);
      }
    }
    fetchCollection();
    return () => {
      isMounted = false;
    }
  }, [collectionConfigEntry])

  const classes = useStyles();

  return (
    <>
      <div className={classes.sectionSpacerMini}>
        <Typography variant="h4" className={[classes.title, isConsideredMobile ? "full-width" : ""].join(" ")}>
          Home Address Registry
        </Typography>
        <Typography variant="h6" className={[classes.subtitle, isConsideredMobile ? "full-width" : ""].join(" ")}>
          Become part of a world-first movement of creating an on-chain registry of homes
        </Typography>
        <Typography variant="body1" className={[classes.titleSpacing, isConsideredMobile ? "full-width" : ""].join(" ")}>
          Inching closer to a future where tokenized real-estate could be used as collateral in on-chain protocols
        </Typography>
        <MapCard 
          height="550px"
          zoom={2}
          zoomControl={true}
          dragging={true}
          doubleClickZoom={true}
          scrollWheelZoom={true}
          // center={[38.171368, -95.430112]} // US center
          center={[24.424473, -80]}
          markers={nftCoordinates}
      />
      </div>
      <div>
        <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 30, xl: 30 }}>
          <Grid item xs={4} sm={8} md={6} lg={10} xl={10}>
            <Card className={classes.card}>
              <LinkWrapper link={MINT_AN_ADDRESS_LINK} external={true}>
                <CardActionArea className={classes.actionArea}>
                  <div className={classes.tierIconContainer}>
                    <img src={RaTier1Icon} className={classes.tierIcon}  alt="Tier 1 NFT" />
                  </div>
                  <Typography variant="h4" className={classes.cardTitle}>
                    Tier 1
                  </Typography>
                  <Typography variant="h5" className={classes.cardSubtitle}>
                    Mint Address
                  </Typography>
                  <Typography variant="subtitle1" className={classes.cardDescription}>
                    Create an on-chain token which symbolically represents the chosen address
                  </Typography>
                  <Button variant="outlined" color="secondary">
                    50 PRO
                  </Button>
                </CardActionArea>
              </LinkWrapper>
            </Card>
          </Grid>
          <Grid item xs={4} sm={8} md={6} lg={10} xl={10}>
            <Card className={classes.card}>
              <LinkWrapper link={MINT_AN_ADDRESS_LINK} external={true}>
                <CardActionArea className={classes.actionArea}>
                  <div className={classes.tierIconContainer}>
                    <img src={RaTier2Icon} className={classes.tierIcon}  alt="Tier 2 NFT" />
                  </div>
                  <Typography variant="h4" className={classes.cardTitle}>
                    Tier 2
                  </Typography>
                  <Typography variant="h5" className={classes.cardSubtitle}>
                    Upload Deed
                  </Typography>
                  <Typography variant="subtitle1" className={classes.cardDescription}>
                    Have your deed record uploaded to IPFS and associated with your NFT
                  </Typography>
                  <Button variant="outlined" color="secondary">
                    500 PRO
                  </Button>
                </CardActionArea>
              </LinkWrapper>
            </Card>
          </Grid>
          <Grid item xs={4} sm={8} md={12} lg={10} xl={10}>
            <Card className={classes.card}>
              <LinkWrapper link={MINT_AN_ADDRESS_LINK} external={true}>
                <CardActionArea className={classes.actionArea}>
                  <div className={classes.tierIconContainer}>
                    <img src={RaTier3Icon} className={classes.tierIcon} alt="Tier 3 NFT" />
                  </div>
                  <Typography variant="h4" className={classes.cardTitle}>
                    Tier 3
                  </Typography>
                  <Typography variant="h5" className={classes.cardSubtitle}>
                    RWA
                  </Typography>
                  <Typography variant="subtitle1" className={classes.cardDescription}>
                    Speed up the buying & selling process, potentially use NFT as on-chain collateral
                  </Typography>
                  <Button variant="outlined" color="secondary">
                    5000 PRO
                  </Button>
                </CardActionArea>
              </LinkWrapper>
            </Card>
          </Grid>
        </Grid>
      </div>
    </>
  )
};

export default ReserveAnAddressHomeBanner;