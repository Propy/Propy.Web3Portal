import React, { useEffect, useState } from 'react'

import { useSearchParams } from "react-router-dom";

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import {
  NFTService,
} from '../services/api';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    inputSpacer: {
      marginTop: theme.spacing(2),
    },
    inputSpacerSmall: {
      marginTop: theme.spacing(1),
    },
    filterContainer: {
      display: 'flex',
      flexDirection: 'column',
    }
  }),
);

interface ICollectionFilterZone {
  collectionSlug: string
  contractNameOrCollectionNameOrAddress: string
  network: string
  open: boolean,
  setOpen: (open: boolean) => void
  isLoading: boolean
}

const PropyKeysCollectionFilterZoneInner = (props: ICollectionFilterZone) => {

  let {
    open,
    setOpen,
  } = props;

  let [searchParams, setSearchParams] = useSearchParams();
  let [uniqueCities, setUniqueCities] = useState<string[]>([]);
  let [uniqueCountries, setUniqueCountries] = useState<string[]>([]);

  let [selectedCity, setSelectedCity] = useState<string>(searchParams.get("city") || "");
  let [selectedCountry, setSelectedCountry] = useState<string>(searchParams.get("country") || "");
  let [selectedLandmarksOnly, setSelectedLandmarksOnly] = useState<boolean>(Boolean(searchParams.get("landmark")));
  let [selectedDeedsAttachedOnly, setSelectedDeedsAttachedOnly] = useState<boolean>(Boolean(searchParams.get("attached_deed")));

  const classes = useStyles();

  const handleClose = (event: {}, reason: "backdropClick" | "escapeKeyDown") => {
    if (reason && reason === "backdropClick")
        return;

    setOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedCity("");
    setSelectedCountry("");
    setSelectedLandmarksOnly(false);
    setSelectedDeedsAttachedOnly(false);
    setSearchParams((params => {
      params.delete("country");
      params.delete("city");
      params.delete("landmark");
      params.delete("attached_deed");
      return params;
    }));
    setOpen(false);
  }

  const handleApplyFilters = () => {
    setSearchParams((params => {
      if(selectedCountry) {
        params.set("country", selectedCountry);
      } else {
        params.delete("country");
      }
      if(selectedCity) {
        params.set("city", selectedCity);
      } else {
        params.delete("city");
      }
      if(selectedLandmarksOnly) {
        params.set("landmark", selectedLandmarksOnly.toString());
      } else {
        params.delete("landmark");
      }
      if(selectedDeedsAttachedOnly) {
        params.set("attached_deed", selectedDeedsAttachedOnly.toString());
      } else {
        params.delete("attached_deed");
      }
      return params;
    }));
    setOpen(false);
  }

  let {
    network,
    contractNameOrCollectionNameOrAddress,
  } = props;

  useEffect(() => {
    const fetchUniqueFieldValues = async () => {
      let [uniqueCityRequest, uniqueCountryRequest] = await Promise.all([
        NFTService.getUniqueMetadataFieldValues(network, contractNameOrCollectionNameOrAddress, "City"),
        NFTService.getUniqueMetadataFieldValues(network, contractNameOrCollectionNameOrAddress, "Country")
      ]);
      if(uniqueCityRequest?.data?.length > 0) {
        setUniqueCities(uniqueCityRequest?.data);
      }
      if(uniqueCountryRequest?.data?.length > 0) {
        setUniqueCountries(uniqueCountryRequest?.data);
      }
    }
    fetchUniqueFieldValues();
  }, [network, contractNameOrCollectionNameOrAddress]);

  return (
    <>
      <Dialog
        open={open}
        onClose={(event, reason) => handleClose(event, reason)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        disableEscapeKeyDown={true}
      >
        <DialogTitle id="alert-dialog-title">
          {"PropyKeys Collection Filters"}
        </DialogTitle>
        <DialogContent>
          {
            <div className={classes.filterContainer}>
              <Autocomplete
                id="country-filter"
                options={uniqueCountries}
                sx={{ width: 300 }}
                className={classes.inputSpacerSmall}
                renderInput={(params) => <TextField {...params} label="Country" />}
                onChange={(event, value, reason, details) => {
                  console.log({event, value, reason, details})
                  if(value) {
                    setSelectedCountry(value);
                  } else {
                    setSelectedCountry("");
                  }
                }}
                value={selectedCountry}
              />
              <Autocomplete
                id="city-filter"
                options={uniqueCities}
                sx={{ width: 300 }}
                className={classes.inputSpacer}
                onChange={(event, value, reason, details) => {
                  if(value) {
                    setSelectedCity(value);
                  } else {
                    setSelectedCity("");
                  }
                }}
                renderInput={(params) => <TextField {...params} label="City" />}
                value={selectedCity}
              />
              <FormControlLabel 
                className={classes.inputSpacerSmall}
                control={
                  <Checkbox
                    checked={selectedLandmarksOnly}
                    onChange={(event, checked) => { setSelectedLandmarksOnly(checked) }}
                  />
                }
                label="Only Landmarks"
              />
              <FormControlLabel 
                control={
                  <Checkbox
                    checked={selectedDeedsAttachedOnly} 
                    onChange={(event, checked) => { setSelectedDeedsAttachedOnly(checked) }}
                  />
                } 
                label="Only Attached Deeds"
              />
            </div>
          }
        </DialogContent>
        <DialogActions style={{display: 'flex', justifyContent: 'space-between'}}>
          <Button onClick={handleClearFilters} color="error">Clear Filters</Button>
          <Button onClick={handleApplyFilters} autoFocus>
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default PropyKeysCollectionFilterZoneInner;