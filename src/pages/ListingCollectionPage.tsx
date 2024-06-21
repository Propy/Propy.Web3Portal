import React from 'react';

import { useParams } from 'react-router-dom';

import GenericPageContainer from '../containers/GenericPageContainer';
import ListingCollectionBannerContainer from '../containers/ListingCollectionBannerContainer';

const ListingCollectionPage = () => {

    let { 
      network,
      contractNameOrCollectionNameOrAddress,
    } = useParams();

    return (
        <GenericPageContainer>
          {network && contractNameOrCollectionNameOrAddress &&
            <ListingCollectionBannerContainer showFilters={true} maxRecords={20} showPagination={true} showTitle={true} network={network} contractNameOrCollectionNameOrAddress={contractNameOrCollectionNameOrAddress} collectionSlug={contractNameOrCollectionNameOrAddress} />
          }
        </GenericPageContainer>
    )
};

export default ListingCollectionPage;