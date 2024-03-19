import React from 'react';

import { PropsFromRedux } from '../containers/ReserveAnAddressHomeBannerContainer';

import PropyKeysMapCard from './PropyKeysMapCard';

import {
  GLOBAL_PAGE_HEIGHT,
} from '../utils/constants';

const PropyKeysMap = (props: PropsFromRedux) => {

  let {
    isConsideredMobile,
  } = props;

  return (
    <>
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
      />
    </>
  )
};

export default PropyKeysMap;