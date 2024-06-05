import React, { useState, useEffect } from 'react';

import { useParams } from 'react-router-dom';

import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Typography from '@mui/material/Typography';

import { useAccount } from 'wagmi';

import {
  isAddress,
} from '../utils';

import GenericPageContainer from '../containers/GenericPageContainer';
import AccountTokensBannerContainer from '../containers/AccountTokensBannerContainer';

import Jazzicon from '../components/Jazzicon';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
        minWidth: 275,
        marginBottom: 15,
        marginTop: 15,
    },
    imageContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '250px',
    },
    exampleImage: {
        width: '30%',
        margin: theme.spacing(4),
    },
    sectionSpacer: {
        marginBottom: theme.spacing(6),
    },
    titleContainer: {
      marginBottom: theme.spacing(4),
      marginTop: theme.spacing(6),
      paddingBottom: theme.spacing(2),
      borderBottom: '2px solid #DBDBDB',
    },
    titleContainerMobile: {
      marginBottom: theme.spacing(4),
      marginTop: theme.spacing(4),
      paddingBottom: theme.spacing(2),
      borderBottom: '2px solid #DBDBDB',
    },
    title: {
      fontWeight: 500,
    },
    topRowZoneDesktop: {
      display: 'flex',
    },
    topRowZoneMobile: {
      display: 'flex',
      flexDirection: 'column',
    },
    profilePictureContainer: {
      width: '250px',
      display: 'flex',
    },
    profilePicture: {
      borderRadius: 50,
      overflow: 'hidden',
    },
    profileHighlightsContainer: {
      display: 'flex',
      flexDirection: 'column',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    profileHighlightsDesktop: {
      width: 'calc(100% - 250px)',
      paddingLeft: theme.spacing(2),
      paddingTop: theme.spacing(2),
    },
    profileHighlightsMobile: {
      width: '100%',
      paddingTop: theme.spacing(2),
    }
  }),
);

interface IProps {
  darkMode?: boolean;
  isConsideredMobile: boolean;
}

const PropyProfilePage = (
  props: IProps
) => {

    let {
      isConsideredMobile,
    } = props;

    const classes = useStyles();

    let { 
      profileAddressOrUsername,
    } = useParams();

    const { 
      address,
    } = useAccount();

    const [profileAddress, setProfileAddress] = useState<false | `0x${string}`>(false);

    useEffect(() => {
      if(!profileAddressOrUsername) {
        if(!address) {
          setProfileAddress(false);
        } else {
          setProfileAddress(address);
        }
      } else if (isAddress(profileAddressOrUsername)) {
        //@ts-ignore
        setProfileAddress(profileAddressOrUsername);
      }
    }, [address, profileAddressOrUsername])

    return (
        <>
            <GenericPageContainer
                // title="Dashboard"
            >
              {profileAddress && 
                <>
                  <div className={[classes.sectionSpacer, isConsideredMobile ? classes.topRowZoneMobile : classes.topRowZoneDesktop].join(" ")}>
                    <div className={classes.profilePictureContainer}>
                      <div className={classes.profilePicture}>
                        {profileAddress && 
                          <Jazzicon address={profileAddress} diameter={250} />
                        }
                      </div>
                    </div>
                    <div className={[classes.profileHighlightsContainer, isConsideredMobile ? classes.profileHighlightsMobile : classes.profileHighlightsDesktop].join(" ")}>
                      <Typography variant="subtitle1">
                        Account Info
                      </Typography>
                      <Typography variant="h6" component="h3">
                        {profileAddress}
                      </Typography>
                    </div>
                  </div>
                  <Typography variant="h3" component="h2" className={isConsideredMobile ? classes.titleContainerMobile : classes.titleContainer}>
                    Account Assets
                  </Typography>
                  <AccountTokensBannerContainer maxRecords={20} showPagination={true} account={profileAddress} />
                  {/* {!accountAddress && !address &&
                      <>
                          <Typography variant="h6" style={{marginBottom: 16, fontWeight: 400}}>
                              Please connect your wallet to view your assets
                          </Typography>
                          <Web3ModalButtonWagmi variant="outlined" overrideConnectText={"Connect Wallet"} darkMode={darkMode} hideNetworkSwitch={true}/>
                      </>
                  } */}
                </>
              }
            </GenericPageContainer>
        </>
    )
};

export default PropyProfilePage;