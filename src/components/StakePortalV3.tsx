import React, { useState, useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useParams, useNavigate } from 'react-router-dom';

import BigNumber from 'bignumber.js';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import MoneyIcon from '@mui/icons-material/Paid';
import FireIcon from '@mui/icons-material/LocalFireDepartment';
import BackIcon from '@mui/icons-material/KeyboardBackspace';

import RaTier2Icon from '../assets/svg/ra_tier_2.svg';

import { PropsFromRedux } from '../containers/StakeStatsContainer';

import LinkWrapper from './LinkWrapper';

import {
  STAKING_ORIGIN_COUNTRY_BLACKLIST,
  PROPY_LIGHT_BLUE,
} from '../utils/constants';

import {
  GeoService,
} from '../services/api';

import StakePortalV3LPModule from './StakePortalV3LPModule';
import StakePortalV3PROModule from './StakePortalV3PROModule';
import StakePortalV3PropyKeysModule from './StakePortalV3PropyKeysModule';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

interface IStakeEnter {
  mode: "enter" | "leave"
  postStakeSuccess?: () => void
  version: number
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      lineHeight: 0,
      flexDirection: 'column'
    },
    card: {
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
    },
    cardInner: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: theme.spacing(4),
      width: '100%',
    },
    personalStatsSpacer: {
      marginBottom: theme.spacing(2),
    },
    floatingActionZone: {
      position: 'fixed',
      maxWidth: '400px',
      width: 'calc(100% - 16px)',
      transform: 'translateY(0%)',
      textAlign: 'center',
      zIndex: 1200,
    },
    floatingActionZoneCard: {
      padding: theme.spacing(2),
      // border: `2px solid ${PROPY_LIGHT_BLUE}`,
    },
    submitButtonContainer: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-end',
    },
    topSpacer: {
      marginTop: theme.spacing(2),
    },
    proStakeAmountFieldContainer: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-end',
    },
    submitButton: {
      width: '100%',
    },
    stepContainer: {
      width: '100%',
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
    },
    selectionOptionsContainer: {
      width: '100%',
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(2),
    },
    selectionOptionsSpacer: {
      maxWidth: '350px',
      display: 'flex',
      justifyContent: 'space-evenly',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    buttonSubtitle: {
      marginTop: theme.spacing(1.5),
      fontWeight: 400,
    },
    buttonSubtitleBottomSpacer: {
      marginBottom: theme.spacing(1.5),
      fontWeight: 400,
    },
    buttonSubtitleError: {
      marginTop: theme.spacing(1.5),
      fontWeight: 400,
      color: 'red',
      maxHeight: '100px',
      overflowY: 'scroll',
    },
    buttonTitle: {
      marginBottom: theme.spacing(1),
    },
    buttonTitleSmallSpacing: {
      marginBottom: theme.spacing(0.5),
    },
    loadingZone: {
      opacity: 0.5,
    },
    loadMoreButtonContainer: {
      marginTop: theme.spacing(4),
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
    },
    actionArea: {
      padding: theme.spacing(2),
      textAlign: 'center',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'start',
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
    moduleIconContainer: {
      height: 100,
      width: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: theme.spacing(1),
    },
    tierIcon: {
      maxWidth: '100%',
      maxHeight: '100%',
    },
  }),
);

const StakePortalV3 = (props: PropsFromRedux & IStakeEnter) => {

  const {
    mode,
    postStakeSuccess,
    version,
  } = props;

  let {
    module,
  } = useParams();

  const navigate = useNavigate();

  const [selectedStakingModule, setSelectedStakingModule] = useState<false | "pro" | "lp" | "propykeys">(false);

  useEffect(() => {
    if(module && (["pro", "lp", "propykeys"].indexOf(module) > -1)) {
      //@ts-ignore
      setSelectedStakingModule(module);
    } else {
      setSelectedStakingModule(false);
    }
  }, [module])

  const classes = useStyles();

  const latestStakingVersion = 3;

  let isDeprecatedStakingVersion = false;
  
  const [isBlacklistedOrigin, setIsBlacklistedOrigin] = useState(false);

  const { 
    data: clientCountry,
    isLoading: isLoadingGeoLocation,
  } = useQuery({
    queryKey: ['stakeGeoLocation', mode],
    queryFn: async () => {
      let geoLocateResponse = await GeoService.geoLocateClient();
      if (geoLocateResponse?.status && geoLocateResponse?.data) {
        return geoLocateResponse?.data?.info?.country;
      }
      return null;
    },
  });

  useEffect(() => {
    if(STAKING_ORIGIN_COUNTRY_BLACKLIST.indexOf(clientCountry) > -1) {
      // setIsBlacklistedOrigin(true);
    } else {
      setIsBlacklistedOrigin(false);
    }
  }, [clientCountry])
  
  console.log({clientCountry})

  return (
    <>
      <div className={classes.root}>
        {(isDeprecatedStakingVersion && (mode === "enter")) &&
          <Grid className={(isLoadingGeoLocation) ? classes.loadingZone : ''} container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 30 }}>
            <Grid item xs={4} sm={8} md={12} lg={20} xl={30}>
                <Typography variant="h6" style={{textAlign: 'left'}}>
                    This version of the staking contract has been deprecated, the latest version can be found <LinkWrapper style={{color: PROPY_LIGHT_BLUE}} link={`stake/v${latestStakingVersion}`}>here</LinkWrapper>.
                </Typography>
              </Grid>
          </Grid>
        }
        {(isBlacklistedOrigin && !isDeprecatedStakingVersion && (mode === "enter")) &&
          <Grid className={(isLoadingGeoLocation) ? classes.loadingZone : ''} container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 20, xl: 30 }}>
            <Grid item xs={4} sm={8} md={12} lg={20} xl={30}>
                <Typography variant="h6" style={{textAlign: 'left'}}>
                    For regulatory reasons, entering the staking protocol is not allowed from your location.
                </Typography>
              </Grid>
          </Grid>
        }
        {!selectedStakingModule &&
          <div style={{cursor: 'pointer', color: PROPY_LIGHT_BLUE, textAlign: 'left', marginBottom: 16, display: 'flex', alignItems: 'center'}} onClick={() => {navigate(`/staking/v3`)}}>
            <BackIcon style={{marginRight: '8px'}} />
            <Typography variant="body1" style={{fontWeight: 'bold'}}>
              Back to stats
            </Typography>
          </div>
        }
        {(!isBlacklistedOrigin && !isDeprecatedStakingVersion && !selectedStakingModule) &&
          <Grid className={(isLoadingGeoLocation) ? classes.loadingZone : ''} container spacing={2} columns={{ xs: 4, sm: 8, md: 12, lg: 30, xl: 30 }}>
            <Grid item xs={4} sm={8} md={12} lg={30} xl={30}>
              <Typography variant="h5" style={{textAlign: 'center'}}>
                What would you like to {mode === "leave" ? 'unstake' : 'stake'}?
              </Typography>
            </Grid>
            <Grid item xs={4} sm={8} md={12} lg={30} xl={10}>
              <Card 
                style={{
                  width: '100%',
                  height: '100%',
                }}
                onClick={() => {
                  navigate(`/staking/v3/${mode === "enter" ? "stake" : "unstake"}/lp`)
                }}
              >
                <CardActionArea className={classes.actionArea}>
                  <div className={classes.moduleIconContainer}>
                    <AssuredWorkloadIcon style={{height: 100, width: 100, color: PROPY_LIGHT_BLUE }} />
                  </div>
                  <Typography variant="h4" className={classes.cardTitle}>
                    Uniswap NFT
                  </Typography>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <FireIcon style={{color: '#ff6f00', height: 35, width: 35, marginBottom: '16px', marginRight: '8px'}} />
                    <Typography variant="h5" className={classes.cardSubtitle}>
                      <strong>500%</strong> Base Rewards
                    </Typography>
                    <FireIcon style={{color: '#ff6f00', height: 35, width: 35, marginBottom: '16px', marginLeft: '8px'}} />
                  </div>
                  <Typography variant="subtitle1" className={classes.cardDescription}>
                    Get the <strong>highest possible staking rewards</strong> by providing liquidity to the specified PRO-WETH liquidity pool.
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={4} sm={8} md={6} lg={15} xl={10}>
            <Card 
                style={{
                  width: '100%',
                  height: '100%',
                }}
                onClick={() => {
                  navigate(`/staking/v3/${mode === "enter" ? "stake" : "unstake"}/pro`)
                }}
              >
                <CardActionArea className={classes.actionArea}>
                  <div className={classes.moduleIconContainer}>
                    <MoneyIcon style={{height: 100, width: 100, color: PROPY_LIGHT_BLUE }} />
                  </div>
                  <Typography variant="h4" className={classes.cardTitle}>
                    PRO
                  </Typography>
                  <Typography variant="h5" className={classes.cardSubtitle}>
                    <strong>100%</strong> Base Rewards
                  </Typography>
                  <Typography variant="subtitle1" className={classes.cardDescription}>
                    Straightforward PRO token staking without any additional steps to acquire PropyKey NFTs or provide liquidity to Uniswap.
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={4} sm={8} md={6} lg={15} xl={10}>
              <Card 
                style={{
                  width: '100%',
                  height: '100%',
                }}
                onClick={() => {
                  navigate(`/staking/v3/${mode === "enter" ? "stake" : "unstake"}/propykeys`)
                }}
              >
                <CardActionArea className={classes.actionArea}>
                  <div className={classes.moduleIconContainer}>
                    <img src={RaTier2Icon} className={classes.tierIcon}  alt="PropyKeys" />
                  </div>
                  <Typography variant="h4" className={classes.cardTitle}>
                    PropyKeys NFT
                  </Typography>
                  <Typography variant="h5" className={classes.cardSubtitle}>
                    <strong>100%</strong> Base Rewards
                  </Typography>
                  <Typography variant="subtitle1" className={classes.cardDescription}>
                    Stake your PropyKeys to get rewarded for being part of the community! Rewards scale according to PropyKey token tiers.
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        }
        {!isBlacklistedOrigin && !isDeprecatedStakingVersion &&
          <>
            {selectedStakingModule === "propykeys" &&
              <>
                <StakePortalV3PropyKeysModule postStakeSuccess={postStakeSuccess} selectedStakingModule={selectedStakingModule} setSelectedStakingModule={setSelectedStakingModule} mode={mode} version={version} />
              </>
            }
            {selectedStakingModule === "lp" &&
              <>
                <StakePortalV3LPModule postStakeSuccess={postStakeSuccess} selectedStakingModule={selectedStakingModule} setSelectedStakingModule={setSelectedStakingModule} mode={mode} version={version} />
              </>
            }
            {selectedStakingModule === "pro" &&
              <>
                <StakePortalV3PROModule postStakeSuccess={postStakeSuccess} selectedStakingModule={selectedStakingModule} setSelectedStakingModule={setSelectedStakingModule} mode={mode} version={version} />
              </>
            }
          </>
        }
      </div>
    </>
  );
}

export default StakePortalV3;