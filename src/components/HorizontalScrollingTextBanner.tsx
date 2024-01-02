import React from 'react'

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';
import { Typography } from '@mui/material';

import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';

import Marquee from "react-fast-marquee";

import LinkWrapper from './LinkWrapper';

import {
  GLOBAL_TOP_BANNER_HEIGHT
} from '../utils/constants';

import {
  IHorizontalScrollingTextEntry,
} from '../interfaces';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: 'black',
      color: 'white',
    },
    marqueeContainer: {
      // max-width: 100%;
      // overflow: hidden;
      zIndex: 2000,
      position: 'fixed',
      backgroundColor: 'black',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      minWidth: '100%',
    }
  }),
);

interface IHorizontalScrollingTextBannerProps {
  entries: IHorizontalScrollingTextEntry[]
}

const HorizontalScrollingTextBanner = (props: IHorizontalScrollingTextBannerProps) => {

  const {
    entries
  } = props;

  const classes = useStyles();

  return (
    <div className={classes.marqueeContainer} style={{height: GLOBAL_TOP_BANNER_HEIGHT}}>
      <Marquee
        speed={25}
        pauseOnHover={true}
      >
        {entries && entries.map((entry, index) => 
          <div style={{display: 'flex', alignItems: 'center'}}>
            &nbsp;&nbsp;<DoubleArrowIcon style={{fontSize: 14}}/>&nbsp;&nbsp;
            <LinkWrapper link={entry.link}>
              <Typography variant="body1" style={{fontSize: '0.8rem', fontWeight: 'bold'}} key={`horizontal-text-scroller-banner-entry-${index}`} className="marquee-proto-span">
                {entry.string}
              </Typography>
            </LinkWrapper>
            &nbsp;&nbsp;<DoubleArrowIcon style={{transform: 'rotate(-180deg)', fontSize: 14}}/>&nbsp;&nbsp;
          </div>
         )}
      </Marquee>
    </div>
  )
}

export default HorizontalScrollingTextBanner;