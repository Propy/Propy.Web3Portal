import React from 'react';

import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

import { useAccount } from 'wagmi';

import {
    COLLECTIONS_PAGE_ENTRIES,
} from '../utils/constants';

import GenericPageContainer from '../containers/GenericPageContainer';
import AccountTokensBannerContainer from '../containers/AccountTokensBannerContainer';
import RecentlyMintedTokensBannerContainer from '../containers/RecentlyMintedTokensBannerContainer';
import CollectionBannerContainer from '../containers/CollectionBannerContainer';
import ReserveAnAddressHomeBannerContainer from '../containers/ReserveAnAddressHomeBannerContainer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
        minWidth: 275,
        marginBottom: 15,
        marginTop: 15,
    },
    title: {
        fontSize: 14,
    },
    imageContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '250px',
    },
    exampleImage: {
        width: '30%',
        margin: theme.spacing(4),
    },
    sectionSpacer: {
        marginBottom: theme.spacing(6),
    }
  }),
);

const HomePage = () => {
    const classes = useStyles();
    const { address } = useAccount();

    return (
        <>
            <GenericPageContainer
                // title="Dashboard"
            >
                <div className={classes.sectionSpacer}>
                    <ReserveAnAddressHomeBannerContainer />
                </div>
                {address &&
                    <div className={classes.sectionSpacer}>
                        <AccountTokensBannerContainer account={address} maxRecords={3} showTitle={true} />
                    </div>
                }
                <div className={classes.sectionSpacer}>
                    <RecentlyMintedTokensBannerContainer showRecentlyMintedLink={true} maxRecords={5} showTitle={true} />
                </div>
                {COLLECTIONS_PAGE_ENTRIES && COLLECTIONS_PAGE_ENTRIES.map((entry, index) => 
                    <div key={`home-page-collection-entry-${entry.address}-${index}`} className={classes.sectionSpacer}>
                        <CollectionBannerContainer
                            showCollectionLink={true}
                            maxRecords={5}
                            showTitle={true}
                            network={entry.network}
                            contractNameOrCollectionNameOrAddress={entry.address}
                            collectionSlug={entry.slug}
                        />
                    </div>
                )}
            </GenericPageContainer>
        </>
    )
};

export default HomePage;