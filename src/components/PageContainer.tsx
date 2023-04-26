import React, {useState, useLayoutEffect} from 'react';
import {Routes, Route} from 'react-router-dom';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Navigation from './Navigation';
import NavigationLeftSideBarDesktopContainer from '../containers/NavigationLeftSideBarDesktopContainer';
import HomePage from '../pages/HomePage';
import ExamplePage from '../pages/ExamplePage';

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
        let sizeShowDesktopMenu = 1100;
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
                    <Route path="/example" element={<ExamplePage/>} />
                </Routes>
            </div>
        </Navigation>
    )
}

export default PageContainer;