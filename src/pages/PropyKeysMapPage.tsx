import React from 'react';

import PropyKeysMapContainer from '../containers/PropyKeysMapContainer';

interface IPropyKeysMapPage {
  mode: "normal" | "gis"
}

const PropyKeysMapPage = (props: IPropyKeysMapPage) => {

    const { mode } = props;

    return (
      <>
        <PropyKeysMapContainer mode={mode} />
      </>
    )
};

export default PropyKeysMapPage;