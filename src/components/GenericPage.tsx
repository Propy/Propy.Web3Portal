import React from 'react';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Typography from '@mui/material/Typography';

import {
  DESKTOP_MENU_WIDTH,
} from '../utils/constants';

import { PropsFromRedux } from '../containers/GenericPageContainer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    rootMobile: {
      width: '100%',
    },
    rootDesktop: {
      width: `calc(100% - ${DESKTOP_MENU_WIDTH}px)`,
    },
    childrenContainer: {
      position: 'relative',
      padding: theme.spacing(8),
    },
    childContainerLarge: {
      padding: theme.spacing(8),
      marginTop: 0,
    },
    childContainerMedium: {
      padding: theme.spacing(4),
      marginTop: 0,
    },
    childContainerMobile: {
      padding: theme.spacing(2),
      marginTop: 0,
      marginBottom: theme.spacing(10),
    },
    titleContainer: {
      marginBottom: theme.spacing(4),
      padding: theme.spacing(6),
      paddingBottom: theme.spacing(2),
      borderBottom: '2px solid #DBDBDB',
    },
    titleContainerMobile: {
      marginBottom: theme.spacing(4),
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(2),
      borderBottom: '2px solid #DBDBDB',
    },
    noTitleContainer: {
      paddingTop: theme.spacing(7),
    },
    noTitleContainerMobile: {
      paddingTop: theme.spacing(4),
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
    <div className={(!isConsideredMobile) ? classes.rootDesktop : classes.rootMobile}>
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