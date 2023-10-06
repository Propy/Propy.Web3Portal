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

import useWindowSize from '../hooks/useWindowSize';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
  }),
);

const PageContainer = () => {

    const classes = useStyles();

    const windowSize = useWindowSize();

    const [showDesktopMenu, setShowDesktopMenu] = useState(true);

    useLayoutEffect(() => {
        let sizeShowDesktopMenu = 1000;
        if (windowSize.width && (windowSize.width <= sizeShowDesktopMenu)) {
          setShowDesktopMenu(false);
        }else{
          setShowDesktopMenu(true);
        }
    }, [windowSize.width, windowSize.height, setShowDesktopMenu]);

    return (
        <Navigation>
            <div className={classes.root}>
                {showDesktopMenu && <NavigationLeftSideBarDesktopContainer/>}
                <Routes>
                    <Route path="/" element={<HomePage/>} />
                    <Route path="/my-assets" element={<AccountTokensPage/>} />
                    <Route path="/token/:network/:tokenAddress" element={<SingleTokenPage/>} />
                    <Route path="/token/:network/:tokenAddress/:tokenId" element={<SingleTokenPage/>} />
                    <Route path="/account/:accountAddress" element={<AccountTokensPage/>} />
                    <Route path="/collections" element={<CollectionsPage/>} />
                    <Route path="/collection/:network/:contractNameOrCollectionNameOrAddress" element={<CollectionPage/>} />
                    <Route path="/recently-minted" element={<RecentlyMintedPage/>} />
                </Routes>
            </div>
        </Navigation>
    )
}

export default PageContainer;