import { useEffect, useCallback } from "react";
import { useMap } from "react-leaflet";
import { useDebouncedCallback } from 'use-debounce';

interface ILeafletMapTrackBounds {
  onBoundsUpdate?: (boundsRect: string) => void,
  onZoomUpdate?: (zoom: number) => void,
}

function LeafletMapTrackBounds(props: ILeafletMapTrackBounds) {

  const { onBoundsUpdate, onZoomUpdate } = props;

  const mMap = useMap();

  const debouncedUpdate = useDebouncedCallback(
    (bounds: string, zoom: number) => {
      let defaultZoom = 2;
      let defaultBounds = "-180,-90,180,90";
      let useBounds = defaultBounds;
      let useZoom = defaultZoom;
      if(zoom >= 9) {
        useBounds = bounds;
        useZoom = zoom;
      }
      if(onBoundsUpdate) {
        onBoundsUpdate(useBounds);
      }
      if(onZoomUpdate) {
        onZoomUpdate(useZoom);
      }
    },
    // delay in ms
    150
  );

  const instantUpdate = useCallback((bounds: string, zoom: number) => {
    let defaultZoom = 2;
    let defaultBounds = "-180,-90,180,90";
    let useBounds = defaultBounds;
    let useZoom = defaultZoom;
    if(zoom >= 10) {
      useBounds = bounds;
      useZoom = zoom;
    }
    if(onBoundsUpdate) {
      onBoundsUpdate(useBounds);
    }
    if(onZoomUpdate) {
      onZoomUpdate(useZoom);
    }
  }, [onBoundsUpdate, onZoomUpdate])

  useEffect(() => {
    if (!mMap) return;
    // let coordinatesInit = mMap.getBounds();
    // console.log({coordinatesInit});
    // let boundsRect = coordinatesInit.toBBoxString();
    // if(onBoundsUpdate) {
    //   onBoundsUpdate(boundsRect);
    // }

    mMap.on("zoomend", function () {
      let coordinates = mMap.getBounds();
      let zoom = mMap.getZoom();
      console.log(mMap.getBounds());
      console.log({coordinates: coordinates.toBBoxString(), zoom: mMap.getZoom()});
      let boundsRect = coordinates.toBBoxString();
      if(zoom >= 10) {
        debouncedUpdate(boundsRect, zoom);
      } else {
        instantUpdate(boundsRect, zoom);
      }
    });

    mMap.on("moveend", function () {
      let coordinates = mMap.getBounds();
      let zoom = mMap.getZoom();
      console.log(mMap.getBounds());
      console.log({coordinates: coordinates.toBBoxString(), zoom: mMap.getZoom()});
      let boundsRect = coordinates.toBBoxString();
      if(zoom >= 10) {
        debouncedUpdate(boundsRect, zoom);
      } else {
        instantUpdate(boundsRect, zoom);
      }
    });
  }, [mMap, onBoundsUpdate, debouncedUpdate, instantUpdate, onZoomUpdate]);

  return (
    <></>
  )
}

export default LeafletMapTrackBounds;