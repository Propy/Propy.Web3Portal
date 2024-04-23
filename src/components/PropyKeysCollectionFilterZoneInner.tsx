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
  toChecksumAddress,
} from '../utils'

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
  isConsideredMobile: boolean
  setPage: (page: number) => void
}

const PropyKeysCollectionFilterZoneInner = (props: ICollectionFilterZone) => {

  let {
    open,
    setOpen,
    // isConsideredMobile,
    // setPage,
  } = props;

  let [searchParams, setSearchParams] = useSearchParams();
  let [uniqueCities, setUniqueCities] = useState<string[]>([]);
  let [uniqueCountries, setUniqueCountries] = useState<string[]>([]);
  // let [uniqueOwners, setUniqueOwners] = useState<string[]>([]);
  let [uniqueStatuses, setUniqueStatuses] = useState<string[]>([]);

  let [selectedCity, setSelectedCity] = useState<string>(searchParams.get("city") || "");
  let [selectedCountry, setSelectedCountry] = useState<string>(searchParams.get("country") || "");
  let [selectedOwner, setSelectedOwner] = useState<string>(searchParams.get("owner") || "");
  let [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get("status") || "");
  let [selectedLandmarksOnly, setSelectedLandmarksOnly] = useState<boolean>(Boolean(searchParams.get("landmark")));
  let [selectedDeedsAttachedOnly, setSelectedDeedsAttachedOnly] = useState<boolean>(Boolean(searchParams.get("attached_deed")));

  let isSomeFilterSet = Boolean(selectedCity || selectedCountry || selectedLandmarksOnly || selectedDeedsAttachedOnly || selectedOwner);

  const classes = useStyles();

  const handleClose = (event: {}, reason: "backdropClick" | "escapeKeyDown") => {
    // TODO: instead of isSomeFilterSet, check for if the filter has changed since the modal was opened, if it's changed, require an "apply" 
    // if(isSomeFilterSet) {
      if (reason && (reason === "backdropClick" || reason === "escapeKeyDown")) {
        return;
      }
    // }

    setOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedCity("");
    setSelectedCountry("");
    setSelectedOwner("");
    setSelectedStatus("");
    setSelectedLandmarksOnly(false);
    setSelectedDeedsAttachedOnly(false);
    setSearchParams((params => {
      params.delete("country");
      params.delete("city");
      params.delete("landmark");
      params.delete("attached_deed");
      params.delete("owner");
      params.delete("status");
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
      if(selectedOwner) {
        params.set("owner", toChecksumAddress(selectedOwner).toString());
      } else {
        params.delete("owner");
      }
      if(selectedStatus) {
        params.set("status", toChecksumAddress(selectedStatus).toString());
      } else {
        params.delete("status");
      }
      // params.delete("page");
      // if(setPage) {
      //   setPage(1);
      // }
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
      let [
        uniqueCityRequest,
        uniqueCountryRequest,
        // uniqueOwnerRequest,
        uniqueStatusRequest,
      ] = await Promise.all([
        NFTService.getUniqueMetadataFieldValues(network, contractNameOrCollectionNameOrAddress, "City"),
        NFTService.getUniqueMetadataFieldValues(network, contractNameOrCollectionNameOrAddress, "Country"),
        // NFTService.getUniqueMetadataFieldValues(network, contractNameOrCollectionNameOrAddress, "Owner"),
        NFTService.getUniqueMetadataFieldValues(network, contractNameOrCollectionNameOrAddress, "Status")
      ]);
      if(uniqueCityRequest?.data?.length > 0) {
        setUniqueCities(uniqueCityRequest?.data);
      }
      if(uniqueCountryRequest?.data?.length > 0) {
        setUniqueCountries(uniqueCountryRequest?.data);
      }
      // if(uniqueOwnerRequest?.data?.length > 0) {
      //   setUniqueOwners(uniqueOwnerRequest?.data);
      // }
      if(uniqueStatusRequest?.data?.length > 0) {
        setUniqueStatuses(uniqueStatusRequest?.data);
      }
    }
    fetchUniqueFieldValues();
  }, [network, contractNameOrCollectionNameOrAddress]);

  useEffect(() => {
    let isMounted = true;
    if(isMounted) {
      setSelectedCity(searchParams.get("city") || "");
      setSelectedCountry(searchParams.get("country") || "");
      setSelectedOwner(searchParams.get("owner") || "");
      setSelectedStatus(searchParams.get("status") || "");
      setSelectedLandmarksOnly(Boolean(searchParams.get("landmark")));
      setSelectedDeedsAttachedOnly(Boolean(searchParams.get("attached_deed")));
    }
    return () => {
      isMounted = false;
    }
  }, [searchParams])

  return (
    <>
      <Dialog
        open={open}
        onClose={(event, reason) => handleClose(event, reason)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
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
                disabled={uniqueCountries.length === 0}
                sx={{ width: 420, maxWidth: '100%' }}
                className={classes.inputSpacerSmall}
                renderInput={(params) => <TextField {...params} label="Country" />}
                onChange={(event, value, reason, details) => {
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
                disabled={uniqueCities.length === 0}
                sx={{ width: 420, maxWidth: '100%' }}
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
              <Autocomplete
                id="status-filter"
                options={uniqueStatuses}
                disabled={uniqueStatuses.length === 0}
                sx={{ width: 420, maxWidth: '100%' }}
                className={classes.inputSpacer}
                onChange={(event, value, reason, details) => {
                  if(value) {
                    setSelectedStatus(value);
                  } else {
                    setSelectedStatus("");
                  }
                }}
                renderInput={(params) => <TextField {...params} label="Status" />}
                value={selectedStatus}
              />
              {/* <Autocomplete
                id="owner-filter"
                options={uniqueOwners}
                disabled={uniqueOwners.length === 0}
                sx={{ width: 420, maxWidth: '100%' }}
                className={classes.inputSpacer}
                renderInput={(params) => <TextField {...params} label="Owner" />}
                onChange={(event, value, reason, details) => {
                  if(value) {
                    setSelectedOwner(value);
                  } else {
                    setSelectedOwner("");
                  }
                }}
                value={selectedOwner}
                getOptionLabel={(option: string) => toChecksumAddress(option)}
                renderOption={(props, option) => (
                  <li {...props}>
                    <span>{isConsideredMobile ? centerShortenLongString(toChecksumAddress(option), 20) : toChecksumAddress(option)}</span>
                  </li>
                )}
              /> */}
              <TextField
                id="owner-filter"
                label="Owner"
                sx={{ width: 420, maxWidth: '100%' }}
                className={classes.inputSpacer}
                value={selectedOwner}
                onChange={(event) => setSelectedOwner(event.target.value)}
                InputProps={{
                  inputComponent: (props) => (
                    <input
                      {...props}
                      value={toChecksumAddress(props.value)}
                    />
                  ),
                }}
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
          {
            (isSomeFilterSet) &&
            <Button onClick={handleClearFilters} color="error">Clear Filters</Button>
          }
          {
            (!isSomeFilterSet) &&
            <Button onClick={() => setOpen(false)}>Close</Button>
          }
          <Button onClick={() => handleApplyFilters()} autoFocus>
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default PropyKeysCollectionFilterZoneInner;