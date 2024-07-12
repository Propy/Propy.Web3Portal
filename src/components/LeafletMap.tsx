import React, { memo } from 'react';

import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import { latLngBounds, latLng } from 'leaflet';
import { animated, useSpring, config } from '@react-spring/web'

import MarkerClusterGroup from 'react-leaflet-cluster'

// import markerIconPropyBlue from "../assets/svg/map_marker_propy_blue_stroked.svg";
import markerIconPropy3D from "../assets/img/map-marker-3d-compressed.png";
import LogoDarkMode from '../assets/svg/propy-logo-house-only.svg'
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
  onZoomUpdate?: (zoom: number) => void,
  isLoading?: boolean,
  popupNode?: React.ReactNode | undefined,
  onMarkerSelection?: (marker: ILeafletMapMarker) => void
  setPopupOpen?: (status: boolean) => void
  onMapMove?: (center: [number, number]) => void
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    loadingIconContainer: {
      position: 'absolute',
      zIndex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingIcon: {
      width: 'auto',
      height: 75,
    }
  }),
);

// const createClusterCustomIcon = function (cluster: MarkerCluster) {
//   return leaflet.divIcon({
//     html: `<span>${cluster.getChildCount()}</span>`,
//     className: 'custom-marker-cluster',
//     iconSize: leaflet.point(33, 33, true),
//   })
// }

const LeafletMap = memo((props: PropsFromRedux & ILeafletMap) => {

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
    onZoomUpdate = (zoom: number) => {},
    isLoading = false,
    popupNode,
    onMarkerSelection,
    setPopupOpen,
    // onMapMove,
  } = props;

  const MapEvents = ({ onDragStart }: { onDragStart?: (e: any) => void }) => {
    useMapEvents({
      dragstart: (e) => {
        if (onDragStart) {
          onDragStart(e);
        }
      },
    });
    return null;
  };

  // zoom = 6 = US zoom on desktop
  // center = [38.171368, -95.430112] = middle area US

  const classes = useStyles();

  let corner1 = latLng(85, -180);
  let corner2 = latLng(-85, 180);
  let bounds = latLngBounds(corner1, corner2);

  const loadingSpring = useSpring({
    from: {
      scale: '1',
      opacity: '0.1'
    },
    to: {
      scale: '1.1',
      opacity: '0.6'
    },
    loop: true,
    delay: 150,
    config: config.wobbly,
  })

  const handleMarkerClick = (e: LeafletMouseEvent, marker: ILeafletMapMarker) => {
    if(marker && onMarkerSelection) {
      onMarkerSelection(marker);
    }
  }

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
      zoomDelta={2}
      zoomSnap={2}
    >
      <MapEvents 
        onDragStart={(e) => {
          if(setPopupOpen) { 
            setPopupOpen(false) 
          }
        }}
      />
      <div style={{zIndex: 9999}}>
      </div>
      {isLoading &&
        <div style={{height: "inherit", width: '100%', zIndex: 999, backgroundColor: '#ffffff5e'}} className={classes.loadingIconContainer}>
          <animated.img style={loadingSpring} className={classes.loadingIcon} src={LogoDarkMode} alt="loading icon" />
        </div>
      }
      <LeafletMapTrackBounds onBoundsUpdate={onBoundsUpdate} onZoomUpdate={onZoomUpdate} />
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
          {markers && markers.map((marker, index) =>
            <Marker 
              key={`${marker.latitude}-${marker.longitude}-${index}`}
              position={[marker.latitude, marker.longitude]} 
              icon={new Icon({iconUrl: markerIconPropy3D, iconSize: [50, 50], iconAnchor: [25, 50]})}
              eventHandlers={{
                click: (e) => {
                  if(popupNode) {
                    handleMarkerClick(e, marker);
                  } else if(marker?.link) {
                    window.open(`${window.location.origin}/#/${marker.link}`, '_blank');
                  }
                },
              }}
            >
              {popupNode && 
                <Popup 
                  className="map-popup-overlay"
                  children={popupNode}
                  eventHandlers={{
                    remove: () => {
                      if (setPopupOpen) {
                        setPopupOpen(false);
                      }
                    },
                    add: () => {
                      if (setPopupOpen) {
                        setPopupOpen(true);
                      }
                    },
                  }}
                />
              }
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
                  if(popupNode) {
                    handleMarkerClick(e, marker);
                  } else if(marker?.link) {
                    window.open(`${window.location.origin}/#/${marker.link}`, '_blank');
                  }
                },
              }}
            >
              {popupNode && 
                <Popup 
                  className="map-popup-overlay"
                  children={popupNode}
                  eventHandlers={{
                    remove: () => {
                      if (setPopupOpen) {
                        setPopupOpen(false);
                      }
                    },
                    add: () => {
                      if (setPopupOpen) {
                        setPopupOpen(true);
                      }
                    },
                  }}
                />
              }
            </Marker>
          )}
        </>
      }
    </MapContainer>
  )
})

export default LeafletMap;