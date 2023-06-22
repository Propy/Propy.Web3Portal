import React from 'react';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Typography from '@mui/material/Typography';

import { PropsFromRedux } from '../containers/GenericPageContainer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    childrenContainer: {
      position: 'relative',
      margin: theme.spacing(8),
    },
    childContainerLarge: {
      margin: theme.spacing(8),
      marginTop: 0,
    },
    childContainerMedium: {
      margin: theme.spacing(4),
      marginTop: 0,
    },
    childContainerMobile: {
      margin: theme.spacing(2),
      marginTop: 0,
    },
    titleContainer: {
      marginBottom: theme.spacing(4),
      marginTop: theme.spacing(6),
      paddingBottom: theme.spacing(2),
      borderBottom: '2px solid #DBDBDB',
    },
    noTitleContainer: {
      marginTop: theme.spacing(7),
    },
    title: {
      fontWeight: 500,
    }
  }),
);

interface IGenericBannerPage {
  title?: string,
  children: React.ReactNode,
}

const GenericBannerPage = (props: PropsFromRedux & IGenericBannerPage) => {

  const classes = useStyles();

  const {
    title,
    children,
    isConsideredMobile,
    isConsideredMedium,
  } = props;

  const getChildContainerClass = (isMobile: boolean, isMedium: boolean, title: string | undefined) => {
    let childClasses = [`${classes.childrenContainer}`];
    if(isMobile) {
      childClasses.push(classes.childContainerMobile);
    } else if(isMedium) {
      childClasses.push(classes.childContainerMedium);
    } else {
      childClasses.push(classes.childContainerLarge);
    }
    if(!title) {
      childClasses.push(classes.noTitleContainer);
    }
    return childClasses.join(" ");
  }

  return (
    <div className={classes.root}>
      <div className={getChildContainerClass(isConsideredMobile, isConsideredMedium, title)}>
        {title &&
          <div className={classes.titleContainer}>
            <Typography variant="h2" component="h2" className={[classes.title].join(" ")}>
              {title}
            </Typography>
          </div>
        }
        {children}
      </div>
    </div>
  )
}

export default GenericBannerPage;