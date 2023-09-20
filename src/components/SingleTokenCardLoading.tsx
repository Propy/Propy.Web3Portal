import React from 'react'

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import PlaceholderImage from '../assets/img/placeholder.webp';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    actionArea: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'start',
    },
    typographyZone: {
      padding: theme.spacing(2),
      width: '100%',
    },
    title: {

    },
    collectionName: {

    },
    chipContainer: {
      position: 'absolute',
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
      padding: theme.spacing(1),
    },
    leftChips: {

    },
    rightChips: {

    },
    chip: {
      color: 'white',
      fontWeight: 'bold',
    }
  }),
);

const SingleTokenCardLoading = () => {

  const classes = useStyles();

  return (
    <Card style={{width: '100%', height: '290px'}}>
      <CardActionArea className={classes.actionArea}>
        <CardMedia
          component="img"
          height="200"
          image={PlaceholderImage}
          style={{position: 'absolute'}}
          alt="featured property media"
        />
        <div style={{height: 200}}></div>
        <div className={classes.chipContainer}>
          <div className={classes.leftChips}>
            <Chip className={classes.chip} color="primary" label={"Loading..."} size="small" />
          </div>
          <div className={classes.rightChips}>
            <Chip className={classes.chip} color="primary" label={"Loading..."} size="small" />
          </div>
        </div>
        <div className={classes.typographyZone}>
          <Typography variant="subtitle1" className={[classes.collectionName].join(" ")}>
            Loading...
          </Typography>
          <Typography variant="h5" className={[classes.title].join(" ")}>
            Loading...
          </Typography>
        </div>
      </CardActionArea>
    </Card>
  )
}

export default SingleTokenCardLoading;