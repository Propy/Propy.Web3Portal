import React, { useState, useEffect } from 'react';

import { animated, useSpring } from '@react-spring/web';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';

import EastIcon from '@mui/icons-material/East';

import EthLogo from '../assets/img/ethereum-web3-modal.png';
import BaseLogo from '../assets/img/base-solid.png';

import { PropsFromRedux } from '../containers/BridgeOptionsContainer';
import LinkWrapper from '../components/LinkWrapper';

import BridgeTransactionHistoryContainer from '../containers/BridgeTransactionHistoryContainer';

import {
  PRO_ETHEREUM_L1_ADDRESS,
  PRO_BASE_L2_ADDRESS,
  BASE_BRIDGE_L1_NETWORK,
  BASE_BRIDGE_L2_NETWORK,
} from '../utils/constants';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      fontWeight: '500',
    },
    subtitle: {
      // marginBottom: theme.spacing(2),
    },
    titleSpacing: {
      marginBottom: theme.spacing(2),
    },
    sectionSpacer: {
      marginBottom: theme.spacing(4),
    },
    bridgeIconContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    },
    cardInner: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: theme.spacing(4),
    },
    cardTitle: {

    },
    cardTitleNetworks: {

    },
    cardSubtitle: {
      marginBottom: theme.spacing(3),
    },
    bridgeIllustration: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    singleBridgeIcon: {
      fontSize: '40px',
    },
    networkLogo: {
      borderRadius: '50%',
      height: 125,
    },
    networkLogoRight: {
      marginLeft: theme.spacing(2),
    },
    networkLogoLeft: {
      marginRight: theme.spacing(2),
    },
    sectionSpacerTop: {
      marginTop: theme.spacing(4),
    },
  }),
);

const BridgingPage = (props: PropsFromRedux) => {

    const [triggerUpdateIndex, setTriggerUpdateIndex] = useState(0);

    const classes = useStyles();

    const originSpring = useSpring({
      from: {
        transform: 'translateX(25%)',
      },
      to: {
        transform: 'translateX(0%)',
      },
    })
  
    const destinationSpring = useSpring({
      from: {
        transform: 'translateX(-25%)',
      },
      to: {
        transform: 'translateX(0%)',
      },
    })

    const arrowSpring = useSpring({
      from: {
        opacity: 0,
      },
      to: {
        opacity: 1,
      },
      delay: 150,
    })

    useEffect(() => {
      // Using ReturnType to infer the type returned by setInterval
      let intervalId: ReturnType<typeof setInterval>;
  
      intervalId = setInterval(() => {
        // This will trigger a rerender every 10 seconds
        setTriggerUpdateIndex(triggerUpdateIndex + 1);
      }, 15000);
  
      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }, [triggerUpdateIndex]);

    return (
      <>
        <Grid 
          className={classes.sectionSpacer}
          container
          spacing={4} 
          columns={{ xs: 4, sm: 8, md: 10, lg: 12, xl: 12 }}
        >
          <Grid item xs={4} sm={8} md={10} lg={6} xl={6}>
            <LinkWrapper link="bridge/ethereum-to-base">
              <Card>
                <CardActionArea>
                  <div className={classes.cardInner}>
                    {/* <Typography variant="h6" className={classes.cardTitle}>Bridge</Typography> */}
                    <Typography variant="h5" className={classes.cardTitleNetworks}><span style={{fontWeight: 'bold'}}>Ethereum</span> to <span style={{fontWeight: 'bold'}}>Base</span></Typography>
                    <Typography variant="subtitle1" className={classes.cardSubtitle}>Bridge time: ~ 20 minutes</Typography>
                    <div className={classes.bridgeIllustration}>
                      <animated.img style={originSpring} className={[classes.networkLogo, classes.networkLogoLeft].join(" ")} src={EthLogo} alt="Ethereum" />
                      <animated.div style={arrowSpring}>
                        <EastIcon className={classes.singleBridgeIcon} />
                      </animated.div>
                      <animated.img style={destinationSpring} className={[classes.networkLogo, classes.networkLogoRight].join(" ")} src={BaseLogo} alt="Base" />
                    </div>
                  </div>
                </CardActionArea>
              </Card>
            </LinkWrapper>
          </Grid>
          <Grid item xs={4} sm={8} md={10} lg={6} xl={6}>
            <LinkWrapper link="bridge/base-to-ethereum">
              <Card>
                <CardActionArea>
                  <div className={classes.cardInner}>
                    {/* <Typography variant="h6" className={classes.cardTitle}>Bridge</Typography> */}
                    <Typography variant="h5" className={classes.cardTitleNetworks}><span style={{fontWeight: 'bold'}}>Base</span> to <span style={{fontWeight: 'bold'}}>Ethereum</span></Typography>
                    <Typography variant="subtitle1" className={classes.cardSubtitle}>Bridge time: ~ 1 week</Typography>
                    <div className={classes.bridgeIllustration}>
                      <animated.img style={originSpring}  className={[classes.networkLogo, classes.networkLogoLeft].join(" ")} src={BaseLogo} alt="Base" />
                      <animated.div style={arrowSpring}>
                        <EastIcon className={classes.singleBridgeIcon} />
                      </animated.div>
                      <animated.img style={destinationSpring} className={[classes.networkLogo, classes.networkLogoRight].join(" ")} src={EthLogo} alt="Ethereum" />
                    </div>
                  </div>
                </CardActionArea>
              </Card>
            </LinkWrapper>
          </Grid>
          {/* 
          TODO section for ALL bridge txs, handling withdrawals first since they are the main ones required
          <Grid item xs={4} sm={8} md={10} lg={12} xl={12}>
            <BridgeTransactionHistoryContainer
              mode={'all'}
              l1Network={BASE_BRIDGE_L1_NETWORK}
              l2Network={BASE_BRIDGE_L2_NETWORK}
              l1TokenAddress={PRO_ETHEREUM_L1_ADDRESS}
              l2TokenAddress={PRO_BASE_L2_ADDRESS}
            />
          </Grid> */}
          <Grid item xs={4} sm={8} md={10} lg={12} xl={12}>
            <BridgeTransactionHistoryContainer
              mode={"all"}
              l1Network={BASE_BRIDGE_L1_NETWORK}
              l2Network={BASE_BRIDGE_L2_NETWORK}
              l1TokenAddress={PRO_ETHEREUM_L1_ADDRESS}
              l2TokenAddress={PRO_BASE_L2_ADDRESS}
              triggerUpdateIndex={triggerUpdateIndex}
            />
          </Grid>
        </Grid>
      </>
    )
};

export default BridgingPage;