import React from 'react';

import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
// import Button from '@mui/material/Button';

import { PropsFromRedux } from '../containers/ReserveAnAddressHomeBannerContainer';

import LinkWrapper from './LinkWrapper';
import PropyKeysMapCard from './PropyKeysMapCard';
import MapOverlay from './MapOverlay';

import RaTier1Icon from '../assets/svg/ra_tier_1.svg';
import RaTier2Icon from '../assets/svg/ra_tier_2.svg';
import RaTier3Icon from '../assets/svg/ra_tier_3.svg';

import {
  MINT_AN_ADDRESS_LINK,
} from '../utils/constants';

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
    },
    mapOverlayContainer: {
      position: 'absolute',
      zIndex: '100',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffffb0',
    }
  }),
);

const ReserveAnAddressHomeBanner = (props: PropsFromRedux) => {

  let {
    isConsideredMobile,
  } = props;

  const classes = useStyles();

  return (
    <>
      <div className={classes.sectionSpacerMini}>
        <Typography variant="h4" className={[classes.title, isConsideredMobile ? "full-width" : ""].join(" ")}>
          Home Address Registry
        </Typography>
        <Typography variant="h6" className={[classes.subtitle, isConsideredMobile ? "full-width" : ""].join(" ")}>
          Become part of a world-first movement of creating an onchain registry of homes
        </Typography>
        <Typography variant="body1" className={[classes.titleSpacing, isConsideredMobile ? "full-width" : ""].join(" ")}>
          Inching closer to a future where tokenized real-estate could be used as collateral in onchain protocols
        </Typography>
        <div
          style={{position: 'relative'}}
        >
          <LinkWrapper link="map/propykeys">
            <MapOverlay />
            <PropyKeysMapCard 
              height="550px"
              zoom={2}
              zoomControl={true}
              dragging={true}
              doubleClickZoom={true}
              scrollWheelZoom={true}
              // center={[38.171368, -95.430112]} // US center
              center={[24.424473, isConsideredMobile ? -80 : 10]}
            />
          </LinkWrapper>
        </div>
      </div>
      <div>
        <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 30, xl: 30 }}>
          <Grid item xs={4} sm={8} md={6} lg={10} xl={10}>
            <Card className={classes.card}>
              <LinkWrapper link={MINT_AN_ADDRESS_LINK} external={true}>
                <CardActionArea className={classes.actionArea}>
                  <div className={classes.tierIconContainer}>
                    <img src={RaTier1Icon} className={classes.tierIcon}  alt="Tier 1 Address Onchain" />
                  </div>
                  <Typography variant="h4" className={classes.cardTitle}>
                    Tier 1
                  </Typography>
                  <Typography variant="h5" className={classes.cardSubtitle}>
                    Address Onchain
                  </Typography>
                  <Typography variant="subtitle1" className={classes.cardDescription}>
                    Create an onchain token which symbolically represents the chosen address
                  </Typography>
                  {/* <Button variant="outlined" color="secondary">
                    10 PRO
                  </Button> */}
                </CardActionArea>
              </LinkWrapper>
            </Card>
          </Grid>
          <Grid item xs={4} sm={8} md={6} lg={10} xl={10}>
            <Card className={classes.card}>
              <LinkWrapper link={MINT_AN_ADDRESS_LINK} external={true}>
                <CardActionArea className={classes.actionArea}>
                  <div className={classes.tierIconContainer}>
                    <img src={RaTier2Icon} className={classes.tierIcon}  alt="Tier 2 Deed Onchain" />
                  </div>
                  <Typography variant="h4" className={classes.cardTitle}>
                    Tier 2
                  </Typography>
                  <Typography variant="h5" className={classes.cardSubtitle}>
                    Deed Onchain
                  </Typography>
                  <Typography variant="subtitle1" className={classes.cardDescription}>
                    Have your deed record uploaded to IPFS and associated with your NFT
                  </Typography>
                  {/* <Button variant="outlined" color="secondary">
                    50 PRO
                  </Button> */}
                </CardActionArea>
              </LinkWrapper>
            </Card>
          </Grid>
          <Grid item xs={4} sm={8} md={12} lg={10} xl={10}>
            <Card className={classes.card}>
              <LinkWrapper link={MINT_AN_ADDRESS_LINK} external={true}>
                <CardActionArea className={classes.actionArea}>
                  <div className={classes.tierIconContainer}>
                    <img src={RaTier3Icon} className={classes.tierIcon} alt="Tier 3 Asset Onchain" />
                  </div>
                  <Typography variant="h4" className={classes.cardTitle}>
                    Tier 3
                  </Typography>
                  <Typography variant="h5" className={classes.cardSubtitle}>
                    Asset Onchain
                  </Typography>
                  <Typography variant="subtitle1" className={classes.cardDescription}>
                    Speed up the buying & selling process, potentially use asset as onchain collateral
                  </Typography>
                  {/* <Button variant="outlined" color="secondary">
                    2000 PRO
                  </Button> */}
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