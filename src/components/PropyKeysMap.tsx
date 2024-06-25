import React from 'react';

import { PropsFromRedux } from '../containers/PropyKeysMapContainer';

import PropyKeysMapCard from './PropyKeysMapCard';
import PropyKeysMapCardPostGIS from './PropyKeysMapCardPostGIS';

import {
  GLOBAL_PAGE_HEIGHT,
} from '../utils/constants';

interface IPropyKeysMap {
  mode: "normal" | "gis"
  collectionName?: string
}

const PropyKeysMap = (props: PropsFromRedux & IPropyKeysMap) => {

  let {
    isConsideredMobile,
    mode = "normal",
    collectionName,
    propyKeysMapFilterOptions,
  } = props;

  return (
    <>
      {mode === "normal" &&
        <PropyKeysMapCard 
          height={GLOBAL_PAGE_HEIGHT}
          zoom={2}
          zoomControl={true}
          dragging={true}
          doubleClickZoom={true}
          scrollWheelZoom={true}
          disableBorderRadius={true}
          // center={[38.171368, -95.430112]} // US center
          center={[24.424473, isConsideredMobile ? -80 : 10]}
          propyKeysMapFilterOptions={propyKeysMapFilterOptions}
          collectionName={collectionName}
        />
      }
      {mode === "gis" &&
        <PropyKeysMapCardPostGIS 
          height={GLOBAL_PAGE_HEIGHT}
          zoom={2}
          zoomControl={true}
          dragging={true}
          doubleClickZoom={true}
          scrollWheelZoom={true}
          disableBorderRadius={true}
          // center={[38.171368, -95.430112]} // US center
          center={[24.424473, isConsideredMobile ? -80 : 10]}
          propyKeysMapFilterOptions={propyKeysMapFilterOptions}
          collectionName={collectionName}
        />
      }
    </>
  )
};

export default PropyKeysMap;