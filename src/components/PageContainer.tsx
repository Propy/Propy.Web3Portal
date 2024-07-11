import React, {useState, useLayoutEffect, useEffect} from 'react';
import {Routes, Route, useLocation} from 'react-router-dom';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Navigation from './Navigation';
import NavigationLeftSideBarDesktopContainer from '../containers/NavigationLeftSideBarDesktopContainer';
import FullScreenGalleryContainer from '../containers/FullScreenGalleryContainer';

import HomePage from '../pages/HomePage';
import AccountTokensPage from '../pages/AccountTokensPage';
import SingleTokenPage from '../pages/SingleTokenPage';
import SingleListingPage from '../pages/SingleListingPage';
import RecentlyMintedPage from '../pages/RecentlyMintedPage';
import CollectionPage from '../pages/CollectionPage';
import CollectionsPage from '../pages/CollectionsPage';
import ListingCollectionPage from '../pages/ListingCollectionPage';
import StakePage from '../pages/StakePage';
import BridgeOptionsPage from '../pages/BridgeOptionsPage';
import BridgePage from '../pages/BridgePage';
import BridgeTransactionActionPage from '../pages/BridgeTransactionActionPage';
import PropyKeysMapPage from '../pages/PropyKeysMapPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import PropyKeyRepossessionPage from '../pages/PropyKeyRepossessionPage';
import PropyProfilePage from '../pages/PropyProfilePage';

import useWindowSize from '../hooks/useWindowSize';

import { PropsFromRedux } from '../containers/PageContainerContainer';

import {
  IS_GLOBAL_TOP_BANNER_ENABLED,
  GLOBAL_TOP_BANNER_HEIGHT,
} from '../utils/constants';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      position: 'relative',
      top: IS_GLOBAL_TOP_BANNER_ENABLED ? GLOBAL_TOP_BANNER_HEIGHT : 0,
    },
    rootMobile: {
      marginBottom: 50,
    }
  }),
);

const PageContainer = (props: PropsFromRedux) => {

    const {
      isConsideredMobile,
      darkMode,
    } = props;

    const { pathname } = useLocation();

    const classes = useStyles();

    const windowSize = useWindowSize();

    const [showDesktopMenu, setShowDesktopMenu] = useState(false);
    const [isLayoutInitialized, setIsLayoutInitialized] = useState(false);

    useLayoutEffect(() => {
        let sizeShowDesktopMenu = 1000;
        if (windowSize.width && (windowSize.width <= sizeShowDesktopMenu)) {
          setShowDesktopMenu(false);
        }else{
          setShowDesktopMenu(true);
        }
        if(windowSize.width && windowSize.height) {
          setIsLayoutInitialized(true);
        }
    }, [windowSize.width, windowSize.height, setShowDesktopMenu]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <Navigation>
            <div className={[classes.root, isConsideredMobile ? classes.rootMobile : ""].join(" ")}>
                {showDesktopMenu && <NavigationLeftSideBarDesktopContainer/>}
                {isLayoutInitialized &&
                  <Routes>
                      <Route path="/" element={<HomePage/>} />
                      <Route path="/my-assets" element={<AccountTokensPage darkMode={darkMode}/>} />
                      <Route path="/token/:network/:tokenAddress" element={<SingleTokenPage isConsideredMobile={isConsideredMobile} />} />
                      <Route path="/token/:network/:tokenAddress/:tokenId" element={<SingleTokenPage isConsideredMobile={isConsideredMobile}/>} />
                      <Route path="/account/:accountAddress" element={<AccountTokensPage darkMode={darkMode} />} />
                      <Route path="/analytics" element={<AnalyticsPage darkMode={darkMode} />} />
                      <Route path="/analytics/:analyticsType" element={<AnalyticsPage darkMode={darkMode} />} />
                      <Route path="/collections" element={<CollectionsPage/>} />
                      <Route path="/collection/:network/:contractNameOrCollectionNameOrAddress" element={<CollectionPage/>} />
                      <Route path="/recently-minted" element={<RecentlyMintedPage/>} />
                      <Route path="/stake/v1" element={<StakePage version={1} />} />
                      <Route path="/stake/v2" element={<StakePage version={2} />} />
                      <Route path="/bridge" element={<BridgeOptionsPage isConsideredMobile={isConsideredMobile} />} />
                      <Route path="/bridge/:bridgeSelection" element={<BridgePage />} />
                      <Route path="/bridge/:bridgeSelection/:bridgeAction/:transactionHash" element={<BridgeTransactionActionPage />} />
                      {/* <Route path="/map/propykeys" element={<PropyKeysMapPage mode="normal" />} /> */}
                      <Route path="/map/:collectionName" element={<PropyKeysMapPage mode="gis" />} />
                      <Route path="/propykey-og-claim/:propyKeyTokenId" element={<PropyKeyRepossessionPage />} />
                      <Route path="/profile" element={<PropyProfilePage isConsideredMobile={isConsideredMobile} />} />
                      <Route path="/profile/:profileAddressOrUsername" element={<PropyProfilePage isConsideredMobile={isConsideredMobile} />} />
                      <Route path="/listings/:network/:contractNameOrCollectionNameOrAddress" element={<ListingCollectionPage/>} />
                      <Route path="/listing/:network/:tokenAddress/:tokenId" element={<SingleListingPage isConsideredMobile={isConsideredMobile}/>} />
                  </Routes>
                }
            </div>
            <FullScreenGalleryContainer />
        </Navigation>
    )
}

export default PageContainer;