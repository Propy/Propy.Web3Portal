import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';

import 'maplibre-gl/dist/maplibre-gl.css';

interface ILeafletMapLibreLayer {
  styleUrl: string
}

function LeafletMapLibreLayer(props: ILeafletMapLibreLayer) {

  const { styleUrl } = props;

  const mMap = useMap();

  useEffect(() => {
    // attribution is picked up from the style's sources once it loads
    const layer = maplibreGL({ style: styleUrl }).addTo(mMap);
    return () => {
      layer.remove();
    };
  }, [mMap, styleUrl]);

  return (
    <></>
  )
}

export default LeafletMapLibreLayer;
