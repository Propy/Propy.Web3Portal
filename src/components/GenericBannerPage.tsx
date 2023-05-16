import React from 'react';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import { PropsFromRedux } from '../containers/GenericBannerPageContainer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      
    },
  }),
);

interface IGenericBannerPage {
  title: string,
  img: string,
}

const GenericBannerPage = (props: PropsFromRedux) => {

    const classes = useStyles();

    const {
      isConsideredMobile,
      isConsideredMedium,
    } = props;

    return (
      <div className={classes.root}>
            
      </div>
    )
}

export default GenericBannerPage;