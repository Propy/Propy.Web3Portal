import React from 'react';

import { useParams } from 'react-router-dom';

import PropyKeysMapContainer from '../containers/PropyKeysMapContainer';

interface IPropyKeysMapPage {
  mode: "normal" | "gis"
}

const PropyKeysMapPage = (props: IPropyKeysMapPage) => {

    const { mode } = props;

    let { 
      collectionName = "propykeys",
    } = useParams();

    return (
      <>
        <PropyKeysMapContainer mode={mode} collectionName={collectionName} />
      </>
    )
};

export default PropyKeysMapPage;