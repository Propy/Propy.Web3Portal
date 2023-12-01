import React from 'react';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Typography from '@mui/material/Typography';

import leaflet from 'leaflet';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';

import MarkerClusterGroup from 'react-leaflet-cluster'

import markerIconPropyBlue from "../assets/svg/map_marker_propy_blue_stroked.svg";
import {Icon} from 'leaflet'

import {
  ILeafletMapMarker
} from '../interfaces';

import { PropsFromRedux } from '../containers/GenericPageContainer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
  }),
);

const center = [51.505, -0.09]

const multiPolygon = [
  [
    [51.51, -0.12],
    [51.51, -0.13],
    [51.53, -0.13],
  ],
  [
    [51.51, -0.05],
    [51.51, -0.07],
    [51.53, -0.07],
  ],
]

const rectangle = [
  [51.49, -0.08],
  [51.5, -0.06],
]

interface ILeafletMap {
  zoom?: number
  zoomControl?: boolean
  dragging?: boolean
  doubleClickZoom?: boolean
  scrollWheelZoom?: boolean
  markers?: ILeafletMapMarker[]
  center?: [number, number]
}

// const createClusterCustomIcon = function (cluster: MarkerCluster) {
//   return leaflet.divIcon({
//     html: `<span>${cluster.getChildCount()}</span>`,
//     className: 'custom-marker-cluster',
//     iconSize: leaflet.point(33, 33, true),
//   })
// }

const LeafletMap = (props: PropsFromRedux & ILeafletMap) => {

  // const map = useMap();

  // console.log({map})

  const classes = useStyles();

  const {
    zoom = 6,
    zoomControl = true,
    dragging = true,
    doubleClickZoom = true,
    scrollWheelZoom = true,
    markers = [],
    center = [38.171368, -95.430112]
  } = props;

  let corner1 = leaflet.latLng(53.466832, -133.789535);
  let corner2 = leaflet.latLng(21.583438, -57.764142);
  let bounds = leaflet.latLngBounds(corner1, corner2);

  return (
    <MapContainer
      style={{height: "inherit"}}
      // center={center}
      zoom={zoom}
      zoomControl={zoomControl}
      dragging={dragging}
      doubleClickZoom={doubleClickZoom}
      scrollWheelZoom={scrollWheelZoom}
      center={center}
      boundsOptions={{padding: [50, 50]}}
      maxBounds={bounds}
      minZoom={4}
      maxBoundsViscosity={0.7}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <MarkerClusterGroup
        chunkedLoading
        // iconCreateFunction={createClusterCustomIcon}
      >
        {markers && markers.map((marker) =>
          <Marker position={[marker.latitude, marker.longitude]} icon={new Icon({iconUrl: markerIconPropyBlue, iconSize: [25, 41], iconAnchor: [12, 41]})}>
            {/* <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup> */}
          </Marker>
        )}
      </MarkerClusterGroup>
    </MapContainer>
  )
}

export default LeafletMap;