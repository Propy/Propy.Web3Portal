import React from 'react';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Typography from '@mui/material/Typography';

import { PropsFromRedux } from '../containers/GenericBannerPageContainer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    bannerImage: {
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: 220,
    },
    childrenContainer: {
      position: 'relative',
      top: -150,
      margin: theme.spacing(8),
      marginTop: 0,
    },
    titleContainer: {
      marginBottom: theme.spacing(2)
    },
    title: {
      fontWeight: 'bold',
    }
  }),
);

interface IGenericBannerPage {
  title: string,
  img: string,
  children: React.ReactNode,
}

const GenericBannerPage = (props: PropsFromRedux & IGenericBannerPage) => {

  const classes = useStyles();

  const {
    title,
    img,
    children,
    isConsideredMobile,
    isConsideredMedium,
  } = props;

  return (
    <div className={classes.root}>
      <div className={classes.bannerImage} style={{backgroundImage: `url("${img}")`}} />
      <div className={classes.childrenContainer}>
        <div className={classes.titleContainer}>
          <Typography variant="h2" component="h2" className={["text-shadow", classes.title].join(" ")}>
            {title}
          </Typography>
        </div>
        {children}
      </div>
    </div>
  )
}

export default GenericBannerPage;