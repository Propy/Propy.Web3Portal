import React from 'react';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { latLngBounds, latLng } from 'leaflet';

import MarkerClusterGroup from 'react-leaflet-cluster'

// import markerIconPropyBlue from "../assets/svg/map_marker_propy_blue_stroked.svg";
import markerIconPropy3D from "../assets/img/map-marker-3d-compressed.png";
import {Icon} from 'leaflet'

import LeafletMapTrackBounds from './LeafletMapTrackBounds';

import {
  ILeafletMapMarker
} from '../interfaces';

import { PropsFromRedux } from '../containers/GenericPageContainer';

interface ILeafletMap {
  zoom?: number
  zoomControl?: boolean
  dragging?: boolean
  doubleClickZoom?: boolean
  scrollWheelZoom?: boolean
  markers?: ILeafletMapMarker[]
  center?: [number, number]
  disableClustering?: boolean
  onBoundsUpdate?: (boundsRect: string) => void,
}

// const createClusterCustomIcon = function (cluster: MarkerCluster) {
//   return leaflet.divIcon({
//     html: `<span>${cluster.getChildCount()}</span>`,
//     className: 'custom-marker-cluster',
//     iconSize: leaflet.point(33, 33, true),
//   })
// }

const LeafletMap = (props: PropsFromRedux & ILeafletMap) => {

  const {
    zoom = 2,
    zoomControl = true,
    dragging = true,
    doubleClickZoom = true,
    scrollWheelZoom = true,
    markers = [],
    center = [0, 0],
    disableClustering = false,
    onBoundsUpdate = (boundsRect: string) => {},
  } = props;

  // zoom = 6 = US zoom on desktop
  // center = [38.171368, -95.430112] = middle area US

  let corner1 = latLng(85, -180);
  let corner2 = latLng(-85, 180);
  let bounds = latLngBounds(corner1, corner2);

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
      minZoom={2}
      maxBoundsViscosity={0.7}
    >
      <LeafletMapTrackBounds onBoundsUpdate={onBoundsUpdate} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {!disableClustering &&
        <MarkerClusterGroup
          chunkedLoading
          // iconCreateFunction={createClusterCustomIcon}
          maxClusterRadius={(zoom: number) => {
            if(zoom === 18) {
              return 10;
            }
            return 80;
          }}
        >
          {markers && markers.map((marker) =>
            <Marker 
              position={[marker.latitude, marker.longitude]} 
              icon={new Icon({iconUrl: markerIconPropy3D, iconSize: [50, 50], iconAnchor: [25, 50]})}
              eventHandlers={{
                click: (e) => {
                  if(marker?.link) {
                    window.open(`${window.location.origin}/#/${marker.link}`, '_blank');
                  }
                },
              }}
            >
              {/* <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup> */}
            </Marker>
          )}
        </MarkerClusterGroup>
      }
      {disableClustering &&
        <>
          {markers && markers.map((marker) =>
            <Marker 
              position={[marker.latitude, marker.longitude]} 
              icon={new Icon({iconUrl: markerIconPropy3D, iconSize: [50, 50], iconAnchor: [25, 50]})}
              eventHandlers={{
                click: (e) => {
                  if(marker?.link) {
                    window.open(`${window.location.origin}/#/${marker.link}`, '_blank');
                  }
                },
              }}
            >
              {/* <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup> */}
            </Marker>
          )}
        </>
      }
    </MapContainer>
  )
}

export default LeafletMap;