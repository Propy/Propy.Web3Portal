import React from 'react';

import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

import { useEthers } from '@usedapp/core'

import GenericBannerPageContainer from '../containers/GenericBannerPageContainer';
import MyTokensBannerContainer from '../containers/MyTokensBannerContainer';

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
    }
  }),
);

const MyTokensPage = () => {
    const classes = useStyles();
    const { account } = useEthers()

    return (
        <>
            <GenericBannerPageContainer 
                img="https://propy.com/home/static/media/phone-banner-background-newsletter.5fd9eb54d501e24b3281.webp"
                title="My Tokens"
            >
                {account &&
                    <MyTokensBannerContainer />
                }
            </GenericBannerPageContainer>
        </>
    )
};

export default MyTokensPage;