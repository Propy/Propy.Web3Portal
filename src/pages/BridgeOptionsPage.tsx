import React from 'react';

import GenericPageContainer from '../containers/GenericPageContainer';

import BridgeOptionsContainer from '../containers/BridgeOptionsContainer';

const BridgeOptionsPage = () => {
    return (
      <GenericPageContainer title="Bridge">
        <BridgeOptionsContainer />
      </GenericPageContainer>
    )
};

export default BridgeOptionsPage;