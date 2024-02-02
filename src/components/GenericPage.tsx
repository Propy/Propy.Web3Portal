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
      marginBottom: theme.spacing(10),
    },
    titleContainer: {
      marginBottom: theme.spacing(4),
      marginTop: theme.spacing(6),
      paddingBottom: theme.spacing(2),
      borderBottom: '2px solid #DBDBDB',
    },
    titleContainerMobile: {
      marginBottom: theme.spacing(4),
      marginTop: theme.spacing(4),
      paddingBottom: theme.spacing(2),
      borderBottom: '2px solid #DBDBDB',
    },
    noTitleContainer: {
      marginTop: theme.spacing(7),
    },
    noTitleContainerMobile: {
      marginTop: theme.spacing(4),
    },
    title: {
      fontWeight: 500,
    },
    subtitle: {
      fontWeight: 400,
    }
  }),
);

interface IGenericBannerPage {
  title?: string,
  subtitle?: string,
  children: React.ReactNode,
}

const GenericBannerPage = (props: PropsFromRedux & IGenericBannerPage) => {

  const classes = useStyles();

  const {
    title,
    subtitle,
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
      childClasses.push(isMobile ? classes.noTitleContainerMobile : classes.noTitleContainer);
    }
    return childClasses.join(" ");
  }

  return (
    <div className={classes.root}>
      <div className={getChildContainerClass(isConsideredMobile, isConsideredMedium, title)}>
        {title &&
          <div className={isConsideredMobile ? classes.titleContainerMobile : classes.titleContainer}>
            <Typography variant="h3" component="h2" className={[classes.title].join(" ")}>
              {title}
            </Typography>
            {
              subtitle &&
              <Typography variant="h6" component="h3" className={[classes.subtitle].join(" ")}>
                {subtitle}
              </Typography>
            }
          </div>
        }
        {children}
      </div>
    </div>
  )
}

export default GenericBannerPage;