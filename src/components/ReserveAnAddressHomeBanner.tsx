import React from 'react';

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
          Become part of a world-first movement of creating an on-chain registry of homes
        </Typography>
        <Typography variant="body1" className={[classes.titleSpacing, isConsideredMobile ? "full-width" : ""].join(" ")}>
          Inching closer to a future where tokenized real-estate could be used as collateral in on-chain protocols
        </Typography>
        <MapCard 
          height="500px"
          zoom={4}
          // zoomControl={false}
          // dragging={false}
          // doubleClickZoom={false}
          scrollWheelZoom={false}
          center={[38.171368, -95.430112]}
          markers={[
              {
                  latitude: 25.74738836656242,
                  longitude: -80.21081450527502
              },
              {
                  latitude: 27.80123919186629, 
                  longitude: -82.69137347243559,
              },
              {
                  latitude: 28.80024277241692, 
                  longitude: -81.26515531356154,
              },
              {
                  latitude: 28.771281831838856, 
                  longitude: -82.48445286471406,
              },
              {
                  latitude: 26.133741738269627,
                  longitude: -81.76728638767402,
              },
              {
                latitude: 39.634074889192846,
                longitude: -104.98173553916226
              },
              {
                latitude: 39.86900286792705,
                longitude: -105.0357852243619
              },
              {
                latitude: 38.82028017903629,
                longitude: -104.78480967285692
              },
              {
                latitude: 38.79371781343436,
                longitude: -104.8428600551695
              },
              {
                latitude: 33.43829494460039,
                longitude:  -112.13701636985634
              },
              {
                latitude: 33.3380512440426,
                longitude: -111.77467139320312
              },
              {
                latitude: 33.67367409702406,
                longitude: -112.28221200657671
              },
              {
                latitude: 45.480896580693766,
                longitude: -122.69693903068564
              }
          ]}
      />
      </div>
      <div>
        <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 30, xl: 30 }}>
          <Grid item xs={4} sm={8} md={6} lg={10} xl={10}>
            <Card className={classes.card}>
              <LinkWrapper link={``}>
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
              <LinkWrapper link={``}>
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
              <LinkWrapper link={``}>
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
                    In Development
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