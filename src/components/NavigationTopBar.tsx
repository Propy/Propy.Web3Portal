import React from 'react';

import { useNavigate } from "react-router-dom";

import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DarkModeIcon from '@mui/icons-material/NightsStay';
import LightModeIcon from '@mui/icons-material/WbSunny';
import MenuIcon from '@mui/icons-material/Menu';

import LogoDarkMode from '../assets/svg/propy-dark-mode.svg'
import LogoLightMode from '../assets/svg/propy-light-mode.svg'

import { Web3ModalButtonWagmi } from './Web3ModalButtonWagmi';
import { PropsFromRedux } from '../containers/NavigationTopBarContainer';

import {
  PROPY_LIGHT_BLUE,
  IS_GLOBAL_TOP_BANNER_ENABLED,
  GLOBAL_TOP_BANNER_HEIGHT,
} from '../utils/constants';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      
    },
    title: {
      flexGrow: 1,
      cursor: 'pointer',
      opacity: 0.8,
    },
    margin: {
      margin: theme.spacing(1),
    },
    appBar: {
      borderBottom: `3px solid ${PROPY_LIGHT_BLUE}`,
      borderRadius: 0,
      top: IS_GLOBAL_TOP_BANNER_ENABLED ? GLOBAL_TOP_BANNER_HEIGHT : 0,
    },
    appBarBottom: {
      top: 'auto',
      bottom: '0px',
      borderTop: `3px solid ${PROPY_LIGHT_BLUE}`,
      borderRadius: 0,
    },
    mobileToolbar: {
      display: 'flex',
      justifyContent: 'end',
    }
  }),
);

const NavigationTopBar = (props: PropsFromRedux) => {
  const classes = useStyles();

  let {
    darkMode,
    showLeftMenu,
    setShowLeftMenu,
    isConsideredMobile,
  } = props;

  let navigate = useNavigate();

  return (
    <div className={classes.root}>
      <AppBar style={{backgroundColor: darkMode ? "#141618" : "#FFFFFF", color: darkMode ? "white" : "#414141"}} className={classes.appBar} position="fixed">
        <Toolbar>
          <img onClick={() => navigate('/')} height={'28px'} style={{marginRight: '10px', cursor: 'pointer'}} src={darkMode ? LogoDarkMode : LogoLightMode} alt="logo" />
          <Typography onClick={() => navigate('/')} variant="body1" className={classes.title}>
            dApp
          </Typography>
          {!isConsideredMobile && <Web3ModalButtonWagmi darkMode={darkMode}/>}
          {process.env.REACT_ENV === 'local' && 
            <IconButton
              color="inherit"
              onClick={() => props.setDarkMode(!darkMode)}
              aria-label="delete"
              className={classes.margin}
              size="large">
              {darkMode ? <LightModeIcon/> : <DarkModeIcon />}
            </IconButton>
          }
          {isConsideredMobile &&
            <IconButton
              onClick={() => setShowLeftMenu(!showLeftMenu)}
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
              size="large">
              <MenuIcon />
            </IconButton>
          }
        </Toolbar>
      </AppBar>
      <AppBar style={{opacity: 0}} position="static">
        <Toolbar/>
      </AppBar>
      {isConsideredMobile && 
        <AppBar style={{backgroundColor: darkMode ? "#141618" : "#FFFFFF", color: darkMode ? "white" : "#414141"}} className={classes.appBarBottom} position="fixed">
          <Toolbar className={classes.mobileToolbar}>
            <Web3ModalButtonWagmi darkMode={darkMode} hideNetworkSwitch={false} showCompactNetworkSwitch={true} />
          </Toolbar>
        </AppBar>
      }
    </div>
  );
}

export default NavigationTopBar