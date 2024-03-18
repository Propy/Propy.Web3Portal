import React, { memo } from 'react'

import Card from '@mui/material/Card';

import LeafletMapContainer from '../containers/LeafletMapContainer';

import {
  ILeafletMapMarker,
} from '../interfaces';

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
  disableBorderRadius?: boolean
}

const MapCard = (props: IMapCardProps) => {

  const {
    height = "320px",
    width = "100%",
    zoom = 2,
    zoomControl = true,
    dragging = true,
    doubleClickZoom = true,
    scrollWheelZoom = true,
    markers = [],
    center,
    disableBorderRadius = false,
  } = props;

  return (
    <Card style={{width, height, zIndex: 0, ...(disableBorderRadius && {borderRadius: 0})}}>
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

export default memo(MapCard);