import React, { useEffect, useState } from 'react';

import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

import Typography from '@mui/material/Typography';

import Grid from '@mui/material/Grid';

import { useParams } from 'react-router-dom';

import GenericPageContainer from '../containers/GenericPageContainer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({

  }),
);

const AccountPage = () => {
    const classes = useStyles();

    let { 
      accountAddress,
    } = useParams();

    return (
        <GenericPageContainer>

        </GenericPageContainer>
    )
};

export default AccountPage;