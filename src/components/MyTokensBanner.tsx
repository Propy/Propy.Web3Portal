import React from 'react';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Card from '@mui/material/Card';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
  }),
);

const MyTokensBanner = () => {

    const classes = useStyles();

    return (
      <Card
          style={{width: '100%', height: '300px', marginTop: '30px'}}
      />
    )
}

export default MyTokensBanner;