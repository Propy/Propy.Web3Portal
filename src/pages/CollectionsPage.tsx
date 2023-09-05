import React from 'react';

import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

import {
  COLLECTIONS_PAGE_ENTRIES,
} from '../utils/constants';

import GenericPageContainer from '../containers/GenericPageContainer';
import CollectionBannerContainer from '../containers/CollectionBannerContainer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    spacer: {
      marginBottom: theme.spacing(8),
    }
  }),
);

const CollectionsPage = () => {
    const classes = useStyles();

    return (
        <GenericPageContainer
          title="Token Browser"
        >
          {COLLECTIONS_PAGE_ENTRIES && COLLECTIONS_PAGE_ENTRIES.map((entry) => 
            <div className={classes.spacer}>
              <CollectionBannerContainer showCollectionLink={true} maxRecords={10} showTitle={true} network={entry.network} contractNameOrCollectionNameOrAddress={entry.address} collectionSlug={entry.slug} />
            </div>
          )}
        </GenericPageContainer>
    )
};

export default CollectionsPage;