import React from 'react';

import GenericPageContainer from '../containers/GenericPageContainer';
import RecentlyMintedTokensBannerContainer from '../containers/RecentlyMintedTokensBannerContainer';

const CollectionPage = () => {

    return (
        <GenericPageContainer>
          <RecentlyMintedTokensBannerContainer maxRecords={20} showPagination={true} showTitle={true}/>
        </GenericPageContainer>
    )
};

export default CollectionPage;