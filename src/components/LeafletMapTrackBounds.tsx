import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { useDebouncedCallback } from 'use-debounce';

interface ILeafletMapTrackBounds {
  onBoundsUpdate?: (boundsRect: string) => void,
}

function LeafletMapTrackBounds(props: ILeafletMapTrackBounds) {

  const { onBoundsUpdate } = props;

  const mMap = useMap();

  const debouncedBoundsUpdate = useDebouncedCallback(
    (value: string) => {
      if(onBoundsUpdate) {
        onBoundsUpdate(value);
      }
    },
    // delay in ms
    1500
  );

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
      console.log(mMap.getBounds());
      console.log({coordinates: coordinates.toBBoxString(), zoom: mMap.getZoom()});
      let boundsRect = coordinates.toBBoxString();
      debouncedBoundsUpdate(boundsRect);
    });

    mMap.on("moveend", function () {
      let coordinates = mMap.getBounds();
      console.log(mMap.getBounds());
      console.log({coordinates: coordinates.toBBoxString(), zoom: mMap.getZoom()});
      let boundsRect = coordinates.toBBoxString();
      debouncedBoundsUpdate(boundsRect);
    });
  }, [mMap, onBoundsUpdate, debouncedBoundsUpdate]);

  return (
    <></>
  )
}

export default LeafletMapTrackBounds;