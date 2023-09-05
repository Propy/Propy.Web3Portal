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

import LogoDarkMode from '../assets/svg/propy-dark-mode.svg'
import LogoLightMode from '../assets/svg/propy-light-mode.svg'

import { Web3ModalButton } from './Web3ModalButton';
import { PropsFromRedux } from '../containers/NavigationTopBarContainer';

import {
  PROPY_LIGHT_BLUE,
} from '../utils/constants';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
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
    }
  }),
);

const NavigationTopBar = (props: PropsFromRedux) => {
  const classes = useStyles();

  let {
    darkMode,
  } = props;

  let navigate = useNavigate();

  return (
    <div className={classes.root}>
      <AppBar style={{backgroundColor: darkMode ? "#141618" : "#FFFFFF", color: darkMode ? "white" : "#414141"}} className={classes.appBar} position="fixed">
        <Toolbar>
          {/* <IconButton
            onClick={() => props.setShowLeftMenu(!localShowLeftMenu)}
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            size="large">
            <MenuIcon />
          </IconButton> */}
          <img onClick={() => navigate('/')} height={'28px'} style={{marginRight: '10px', cursor: 'pointer'}} src={darkMode ? LogoDarkMode : LogoLightMode} alt="logo" />
          <Typography onClick={() => navigate('/')} variant="body1" className={classes.title}>
            dApp
          </Typography>
          <Web3ModalButton darkMode={darkMode} />
          <IconButton
            color="inherit"
            onClick={() => props.setDarkMode(!darkMode)}
            aria-label="delete"
            className={classes.margin}
            size="large">
            {darkMode ? <LightModeIcon/> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <AppBar style={{opacity: 0}} position="static">
        <Toolbar/>
      </AppBar>
    </div>
  );
}

export default NavigationTopBar