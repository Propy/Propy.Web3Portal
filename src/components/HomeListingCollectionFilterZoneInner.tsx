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
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';

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
      alignItems: 'center',
    },
    rangeText: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
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
  nftContractAddress?: string
  setPage: (page: number) => void
}

const HomeListingCollectionFilterZoneInner = (props: ICollectionFilterZone) => {

  let {
    open,
    setOpen,
    // isConsideredMobile,
    // setPage,
  } = props;

  let [searchParams, setSearchParams] = useSearchParams();
  let [uniqueCities, setUniqueCities] = useState<string[]>([]);
  let [uniqueCountries, setUniqueCountries] = useState<string[]>([]);

  let [selectedCity, setSelectedCity] = useState<string>(searchParams.get("city") || "");
  let [selectedCountry, setSelectedCountry] = useState<string>(searchParams.get("country") || "");
  let [selectedMinPrice, setSelectedMinPrice] = useState<string>(searchParams.get("min_price") || "");
  let [selectedMaxPrice, setSelectedMaxPrice] = useState<string>(searchParams.get("max_price") || "");
  let [selectedMinBedrooms, setSelectedMinBedrooms] = useState<string>(searchParams.get("min_bedrooms") || "");
  let [selectedMinBathrooms, setSelectedMinBathrooms] = useState<string>(searchParams.get("min_bathrooms") || "");
  let [selectedMinLotSize, setSelectedMinLotSize] = useState<string>(searchParams.get("min_lot_size") || "");

  let isSomeFilterSet = Boolean(selectedCity || selectedCountry || selectedMinPrice || selectedMaxPrice || selectedMinBedrooms || selectedMinBathrooms || selectedMinLotSize);

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
    setSearchParams((params => {
      params.delete("country");
      params.delete("city");
      params.delete("min_price");
      params.delete("max_price");
      params.delete("min_bathrooms");
      params.delete("min_bedrooms");
      params.delete("min_lot_size");
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
      if(selectedMinPrice) {
        params.set("min_price", selectedMinPrice);
      } else {
        params.delete("min_price");
      }
      if(selectedMaxPrice) {
        params.set("max_price", selectedMaxPrice);
      } else {
        params.delete("max_price");
      }
      if(selectedMinBedrooms) {
        params.set("min_bedrooms", selectedMinBedrooms);
      } else {
        params.delete("min_bedrooms");
      }
      if(selectedMinBathrooms) {
        params.set("min_bathrooms", selectedMinBathrooms);
      } else {
        params.delete("min_bathrooms");
      }
      if(selectedMinLotSize) {
        params.set("min_lot_size", selectedMinLotSize);
      } else {
        params.delete("min_lot_size");
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
    nftContractAddress,
  } = props;

  useEffect(() => {
    const fetchUniqueFieldValues = async () => {
      let useAsNftAddress = nftContractAddress ? nftContractAddress : contractNameOrCollectionNameOrAddress;
      let [
        uniqueCityRequest,
        uniqueCountryRequest,
        // uniqueOwnerRequest,
      ] = await Promise.all([
        NFTService.getUniqueMetadataFieldValuesWithListingAttached(network, useAsNftAddress, "City"),
        NFTService.getUniqueMetadataFieldValuesWithListingAttached(network, useAsNftAddress, "Country"),
      ]);
      if(uniqueCityRequest?.data?.length > 0) {
        setUniqueCities(uniqueCityRequest?.data);
      }
      if(uniqueCountryRequest?.data?.length > 0) {
        setUniqueCountries(uniqueCountryRequest?.data);
      }
    }
    fetchUniqueFieldValues();
  }, [network, contractNameOrCollectionNameOrAddress, nftContractAddress]);

  useEffect(() => {
    let isMounted = true;
    if(isMounted) {
      setSelectedCity(searchParams.get("city") || "");
      setSelectedCountry(searchParams.get("country") || "");
      setSelectedMinPrice(searchParams.get("min_price") || "");
      setSelectedMaxPrice(searchParams.get("max_price") || "");
      setSelectedMinBathrooms(searchParams.get("min_bathrooms") || "");
      setSelectedMinBedrooms(searchParams.get("min_bedrooms") || "");
      setSelectedMinLotSize(searchParams.get("min_lot_size") || "");
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
              <div className={classes.inputSpacer} style={{display: 'flex', maxWidth: 420, width: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
                <TextField
                  id="min-price-filter"
                  label="Min Price"
                  sx={{ width: 'calc(50% - 8px)' }}
                  value={selectedMinPrice}
                  onChange={(event) => setSelectedMinPrice(event.target.value)}
                  type="number"
                />
                <Typography variant="subtitle1" className={[classes.rangeText].join(" ")}>
                  to
                </Typography>
                <TextField
                  id="max-price-filter"
                  label="Max Price"
                  sx={{ width: 'calc(50% - 8px)' }}
                  value={selectedMaxPrice}
                  type="number"
                  onChange={(event) => setSelectedMaxPrice(event.target.value)}
                />
              </div>
              <div className={classes.inputSpacer} style={{display: 'flex', maxWidth: 420, width: '100%', justifyContent: 'space-between', alignItems: 'center'}}>
                <Autocomplete
                  id="bedroom-filter"
                  options={Array.from({length: 10}).map((entry, index) => { return { label: `${index + 1}+`, id:  `${index + 1}`}})}
                  sx={{ width: 'calc(33% - 8px)' }}
                  onChange={(event, value, reason, details) => {
                    if(value) {
                      setSelectedMinBedrooms(value.id);
                    } else {
                      setSelectedMinBedrooms("");
                    }
                  }}
                  renderInput={(params) => <TextField {...params} label="Min Bed" />}
                  value={selectedMinBedrooms ? {id: selectedMinBedrooms, label: `${selectedMinBedrooms}+`} : {id: "", label: ""}}
                />
                <Autocomplete
                  id="bathroom-filter"
                  options={Array.from({length: 10}).map((entry, index) => { return { label: `${index + 1}+`, id:  `${index + 1}`}})}
                  sx={{ width: 'calc(33% - 8px)' }}
                  onChange={(event, value, reason, details) => {
                    if(value) {
                      setSelectedMinBathrooms(value.id);
                    } else {
                      setSelectedMinBathrooms("");
                    }
                  }}
                  renderInput={(params) => <TextField {...params} label="Min Bath" />}
                  value={selectedMinBathrooms ? {id: selectedMinBathrooms, label: `${selectedMinBathrooms}+`} : {id: "", label: ""}}
                />
                <Autocomplete
                  id="lot-size-filter"
                  options={Array.from({length: 10}).map((entry, index) => { return { label: `${(index + 1) * 1000}+`, id:  `${(index + 1) * 1000}`}})}
                  sx={{ width: 'calc(33% - 8px)' }}
                  onChange={(event, value, reason, details) => {
                    if(value) {
                      setSelectedMinLotSize(value.id);
                    } else {
                      setSelectedMinLotSize("");
                    }
                  }}
                  renderInput={(params) => <TextField {...params} label="Min Lot" />}
                  value={selectedMinLotSize ? {id: selectedMinLotSize, label: `${selectedMinLotSize}+`} : {id: "", label: ""}}
                />
              </div>
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

export default HomeListingCollectionFilterZoneInner;