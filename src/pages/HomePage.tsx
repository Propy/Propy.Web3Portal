import React from 'react';

import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Card from '@mui/material/Card';

import { useEthers } from '@usedapp/core'

import GenericPageContainer from '../containers/GenericPageContainer';
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

const HomePage = () => {
    const classes = useStyles();
    const { account } = useEthers()

    return (
        <>
            <GenericPageContainer
                title="Dashboard"
            >
                {account &&
                    <MyTokensBannerContainer maxRecords={5} showTitle={true} />
                }
            </GenericPageContainer>
        </>
    )
};

export default HomePage;