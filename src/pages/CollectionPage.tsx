import React from 'react';

import { useParams } from 'react-router-dom';

import GenericPageContainer from '../containers/GenericPageContainer';
import CollectionBannerContainer from '../containers/CollectionBannerContainer';

const CollectionPage = () => {

    let { 
      network,
      contractNameOrCollectionNameOrAddress,
    } = useParams();

    return (
        <GenericPageContainer>
          {network && contractNameOrCollectionNameOrAddress &&
            <CollectionBannerContainer showFilters={true} maxRecords={20} showPagination={true} showTitle={true} network={network} contractNameOrCollectionNameOrAddress={contractNameOrCollectionNameOrAddress} collectionSlug={contractNameOrCollectionNameOrAddress} />
          }
        </GenericPageContainer>
    )
};

export default CollectionPage;