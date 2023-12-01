import React, { useState, useEffect } from 'react'

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';

import LeafletMapContainer from '../containers/LeafletMapContainer';

import {
  ILeafletMapMarker,
} from '../interfaces';

import LinkWrapper from './LinkWrapper';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    actionArea: {
      height: '100%',
    },
  }),
);

interface IMapCardProps {
  height?: string | number
  width?: string | number
  zoom?: number
  zoomControl?: boolean
  dragging?: boolean
  doubleClickZoom?: boolean
  scrollWheelZoom?: boolean
  markers?: ILeafletMapMarker[]
  center?: [number, number]
}

const MapCard = (props: IMapCardProps) => {

  const {
    height = "290px",
    width = "100%",
    zoom = 6,
    zoomControl = true,
    dragging = true,
    doubleClickZoom = true,
    scrollWheelZoom = true,
    markers = [],
    center,
  } = props;

  const classes = useStyles();

  return (
    <Card style={{width, height}}>
      {/* <LinkWrapper link={`./`}> */}
        {/* <CardActionArea className={classes.actionArea}> */}
          <LeafletMapContainer 
            zoom={zoom}
            zoomControl={zoomControl}
            dragging={dragging}
            doubleClickZoom={doubleClickZoom}
            scrollWheelZoom={scrollWheelZoom}
            markers={markers}
            center={center}
          />
        {/* </CardActionArea> */}
      {/* </LinkWrapper> */}
    </Card>
  )
}

export default MapCard;