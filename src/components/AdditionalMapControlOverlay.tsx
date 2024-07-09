
import React from 'react';

import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import { PropsFromRedux } from '../containers/AdditionalMapControlOverlayContainer';

import { IPropyKeysMapFilterOptions } from '../interfaces';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mapOverlayContainer: {
      position: 'absolute',
      zIndex: '100',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      top: theme.spacing(2),
      right: theme.spacing(2),
      backgroundColor: '#ffffffb0',
      padding: theme.spacing(2),
      borderRadius: 15,
      flexDirection: 'column',
    },
    title: {
      // marginBottom: theme.spacing(2),
    },
    optionsContainer: {
      display: 'flex',
      flexDirection: 'column',
    },
    inputSpacer: {
      marginTop: theme.spacing(2),
    },
    inputSpacerSmall: {
      marginTop: theme.spacing(1),
    },
  }),
);

interface IAdditionalMapControlOverlay {
  setPopupOpen?: (status: boolean) => void
}

const AdditionalMapControlOverlay = (props: IAdditionalMapControlOverlay & PropsFromRedux) => {

  let {
    setPropyKeysMapFilterOptions,
    propyKeysMapFilterOptions,
    setPopupOpen,
  } = props;

  const classes = useStyles();

  const setFilter = <K extends keyof IPropyKeysMapFilterOptions>(filterKey: K, value: IPropyKeysMapFilterOptions[K]) => {
    let originalFilters = Object.assign({}, propyKeysMapFilterOptions);
    originalFilters[filterKey] = value;
    if(setPopupOpen) {
      setPopupOpen(false);
    }
    setPropyKeysMapFilterOptions(originalFilters);
  }

  return (
    <div
      className={classes.mapOverlayContainer}
    >
      <Typography variant="h6" className={[classes.title].join(" ")}>
        Map Options
      </Typography>
      <div className={classes.optionsContainer}>
        <FormControlLabel 
          className={classes.inputSpacerSmall}
          control={
            <Checkbox
              checked={propyKeysMapFilterOptions?.onlyListedHomes ? propyKeysMapFilterOptions?.onlyListedHomes : false}
              onChange={(event, checked) => { setFilter('onlyListedHomes', checked) }}
            />
          }
          label="Only Listed Homes"
        />
        <FormControlLabel 
          control={
            <Checkbox
              checked={propyKeysMapFilterOptions?.onlyLandmarks ? propyKeysMapFilterOptions?.onlyLandmarks : false}
              onChange={(event, checked) => { setFilter('onlyLandmarks', checked) }}
            />
          }
          label="Only Landmarks"
        />
      </div>
    </div>
  )
};

export default AdditionalMapControlOverlay;