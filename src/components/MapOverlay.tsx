
import React, { useState } from 'react';

import { animated, useSpring } from '@react-spring/web';

import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

import Button from '@mui/material/Button';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mapOverlayContainer: {
      position: 'absolute',
      zIndex: '100',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffffb0',
    }
  }),
);

const MapOverlay = () => {

  const [showFullMapLink, setShowFullMapLink] = useState(false);

  const mapOverlaySpring = useSpring({
    from: {
      opacity: 0,
    },
    to: {
      opacity: showFullMapLink ? 1 : 0,
    },
  })

  const classes = useStyles();

  return (
    <animated.div
      className={classes.mapOverlayContainer}
      style={mapOverlaySpring}
      onMouseEnter={() => setShowFullMapLink(true)}
      onMouseLeave={() => setShowFullMapLink(false)}
      onClick={() => setShowFullMapLink(true)}
      onTouchStart={() => setShowFullMapLink(true)}
    >
      <Button style={{color: 'white'}} variant="contained">View Full Map</Button>
    </animated.div>
  )
};

export default MapOverlay;