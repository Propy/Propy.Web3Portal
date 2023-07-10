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
    titleContainer: {
      marginBottom: theme.spacing(4),
      marginTop: theme.spacing(6),
      borderBottom: '2px solid #EFEFEF',
    },
    title: {
      fontWeight: 500,
    }
  }),
);

type Variant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'button'
  | 'overline';

interface IGenericBannerPage {
  title?: string,
  variant?: Variant,
  paddingBottom?: number,
  marginBottom?: number,
  marginTop?: number,
}

const GenericTitle = (props: PropsFromRedux & IGenericBannerPage) => {

  const classes = useStyles();

  const {
    title,
    variant = 'h2',
    paddingBottom = 16,
    marginBottom = 16,
    marginTop = 48,
  } = props;

  return (
    <div className={classes.root}>
        {title &&
          <div className={classes.titleContainer} style={{paddingBottom: paddingBottom, marginBottom: marginBottom, marginTop: marginTop}}>
            <Typography variant={variant} component="h2" className={[classes.title].join(" ")}>
              {title}
            </Typography>
          </div>
        }
    </div>
  )
}

export default GenericTitle;