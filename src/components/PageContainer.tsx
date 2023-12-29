import React, {useState, useLayoutEffect} from 'react';
import {Routes, Route} from 'react-router-dom';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Navigation from './Navigation';
import NavigationLeftSideBarDesktopContainer from '../containers/NavigationLeftSideBarDesktopContainer';

import HomePage from '../pages/HomePage';
import AccountTokensPage from '../pages/AccountTokensPage';
import SingleTokenPage from '../pages/SingleTokenPage';
import RecentlyMintedPage from '../pages/RecentlyMintedPage';
import CollectionPage from '../pages/CollectionPage';
import CollectionsPage from '../pages/CollectionsPage';
import StakePage from '../pages/StakePage';
// import BridgeOptionsPage from '../pages/BridgeOptionsPage';
// import BridgePage from '../pages/BridgePage';

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
    } = props;

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

    return (
        <Navigation>
            <div className={[classes.root, isConsideredMobile ? classes.rootMobile : ""].join(" ")}>
                {showDesktopMenu && <NavigationLeftSideBarDesktopContainer/>}
                {isLayoutInitialized &&
                  <Routes>
                      <Route path="/" element={<HomePage/>} />
                      <Route path="/my-assets" element={<AccountTokensPage/>} />
                      <Route path="/token/:network/:tokenAddress" element={<SingleTokenPage/>} />
                      <Route path="/token/:network/:tokenAddress/:tokenId" element={<SingleTokenPage/>} />
                      <Route path="/account/:accountAddress" element={<AccountTokensPage/>} />
                      <Route path="/collections" element={<CollectionsPage/>} />
                      <Route path="/collection/:network/:contractNameOrCollectionNameOrAddress" element={<CollectionPage/>} />
                      <Route path="/recently-minted" element={<RecentlyMintedPage/>} />
                      <Route path="/stake" element={<StakePage/>} />
                      {/* <Route path="/bridge" element={<BridgeOptionsPage />} />
                      <Route path="/bridge/:bridgeSelection" element={<BridgePage />} /> */}
                  </Routes>
                }
            </div>
        </Navigation>
    )
}

export default PageContainer;