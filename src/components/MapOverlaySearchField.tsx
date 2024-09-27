import React, { useState, useEffect, useCallback, useMemo } from 'react';

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';

import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

import { latLng } from 'leaflet';

import { useMap } from 'react-leaflet';

import debounce from 'lodash/debounce';

import {
  NFTService,
} from '../services/api';

import {
  ICollectionEntry,
} from '../utils/constants';

import {
  ISelectedPopupConfig,
} from '../interfaces';

import { PropsFromRedux } from '../containers/MapOverlaySearchFieldContainer';

interface IMapOverlaySearchField {
  collectionConfigEntry: ICollectionEntry,
  setSelectedPopupConfig?: (popupConfig: ISelectedPopupConfig) => void
  setPopupOpen?: (status: boolean) => void
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      top: '16px',
      left: 'calc(50%)',
      transform: 'translateX(-50%)',
      maxWidth: '550px',
      width: '100%',
      display: 'flex',
      padding: '16px',
      zIndex: 900,
      position: 'absolute',
      alignItems: 'center',
      borderRadius: '15px',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: '#ffffffb0',
    },
    mobileRoot: {
      top: 'calc(100% - 16px)',
      left: 'calc(50%)',
      transform: 'translateX(-50%)translateY(-100%)',
      maxWidth: '550px',
      width: '100%',
      display: 'flex',
      padding: '16px',
      zIndex: 900,
      position: 'absolute',
      alignItems: 'center',
      borderRadius: '15px',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: '#ffffffb0',
    }
  }),
);

interface Option {
  id: string | number;
  label: string;
  longitude: number;
  latitude: number;
  type: "listing" | "token" | false,
  asset_address: string | false;
  network: string | false;
  token_id: string | false;
}

export default function MapOverlaySearchField(props: IMapOverlaySearchField & PropsFromRedux) {

  const {
    collectionConfigEntry,
    setSelectedPopupConfig,
    setPopupOpen,
    isConsideredMedium,
  } = props;

  const parentMap = useMap()

  const classes = useStyles();

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchFoundNoResults, setSearchFoundNoResults] = useState(false);

  const fetchOptions = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const response = await NFTService.getSearchOptionsWithPostGISPoints(
        collectionConfigEntry.network,
        collectionConfigEntry.address,
        encodeURIComponent(query)
      );
      console.log({response})
      let newOptions : any = [];
      if(response?.data?.data?.length > 0) {
        setSearchFoundNoResults(false);
        newOptions = response?.data?.data?.map((entry: any) => ({
          label: entry.metadata?.name,
          id: `${entry.metadata.token_id}-${entry.metadata?.name}`,
          longitude: entry.metadata.longitude,
          latitude: entry.metadata.latitude,
          type: 'token', // todo add support for listings
          asset_address: entry.asset_address,
          network: entry.network_name,
          token_id: entry.token_id,
        }))
      } else {
        setSearchFoundNoResults(true);
      }
      setOptions(newOptions);
    } catch (error) {
      console.error('Error fetching options:', error);
      setSearchFoundNoResults(true);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [collectionConfigEntry.address, collectionConfigEntry.network]);

  const debouncedFetchOptions = useMemo(
    () => debounce(fetchOptions, 300),
    [fetchOptions]
  );

  useEffect(() => {
    if (inputValue === '') {
      setOptions([]);
      return undefined;
    }

    debouncedFetchOptions(inputValue);

    return () => {
      debouncedFetchOptions.cancel();
    };
  }, [inputValue, debouncedFetchOptions]);

  const handleChange = (event: React.SyntheticEvent, newValue: Option | null) => {
    if(parentMap && newValue) {
      let latLngFlyTo = latLng(newValue.latitude, newValue.longitude);
      parentMap.setView(latLngFlyTo, 18, {
        animate: true,
      })
      if(setSelectedPopupConfig && setPopupOpen) {
        setSelectedPopupConfig({
          type: newValue.type,
          asset_address: newValue.asset_address,
          network: newValue.network,
          token_id: newValue.token_id,
        })
      }
    }
  };

  const getNoOptionsText = () => {
    if(searchFoundNoResults) {
      return 'No locations found'
    } else {
      return 'Type to search...'
    }
  }

  return (
    <Autocomplete
      id="debounced-autocomplete"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      inputValue={inputValue}
      className={isConsideredMedium ? classes.mobileRoot : classes.root}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      options={options}
      loading={loading}
      onChange={handleChange}
      noOptionsText={getNoOptionsText()}
      forcePopupIcon={false}
      isOptionEqualToValue={(option: any, value) => option.label === value.label}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
}