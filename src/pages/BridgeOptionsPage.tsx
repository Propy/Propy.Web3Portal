import React from 'react';


import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Typography from '@mui/material/Typography';

import GenericPageContainer from '../containers/GenericPageContainer';

import BridgeOptionsContainer from '../containers/BridgeOptionsContainer';

import {
  PROPY_LIGHT_BLUE,
} from '../utils/constants';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      fontWeight: '500',
    },
    subtitle: {

    },
    titleSpacing: {
      marginBottom: theme.spacing(2),
    },
    titleContainer: {
      marginBottom: theme.spacing(4),
    }
  }),
);

interface IBridgeOptionsPage {
  isConsideredMobile: boolean,
}

const BridgeOptionsPage = (props: IBridgeOptionsPage) => {

    const {
      isConsideredMobile
    } = props;

    const classes = useStyles();

    return (
      <GenericPageContainer>
        <div className={classes.titleContainer}>
          <Typography variant="h4" className={[classes.title, isConsideredMobile ? "full-width" : ""].join(" ")}>
            Bridge
          </Typography>
          <Typography variant="h6" className={[classes.subtitle, isConsideredMobile ? "full-width" : ""].join(" ")}>
            Bridges PRO between Ethereum and Base
          </Typography>
          <Typography variant="body1" className={[classes.titleSpacing, isConsideredMobile ? "full-width" : ""].join(" ")}>
            If you are trying to bridge ETH, please use the official <a style={{color: PROPY_LIGHT_BLUE, fontWeight: 'bold'}} className="no-decorate" href="https://bridge.base.org/deposit" target="_blank" rel="noopener noreferrer">Base Bridge</a>
          </Typography>
        </div>
        <BridgeOptionsContainer />
      </GenericPageContainer>
    )
};

export default BridgeOptionsPage;