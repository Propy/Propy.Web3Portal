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

interface ICollectionSortZone {
  collectionSlug: string
  contractNameOrCollectionNameOrAddress: string
  network: string
  open: boolean,
  setOpen: (open: boolean) => void
  isLoading: boolean
  isConsideredMobile: boolean
  setPage: (page: number) => void
}

const GenericCollectionSortZoneInner = (props: ICollectionSortZone) => {

  let {
    open,
    setOpen,
    // isConsideredMobile,
    // setPage,
  } = props;

  let [searchParams, setSearchParams] = useSearchParams();

  let defaultOption = { label: 'Latest', id: 'latest' };

  const sortByOptions = [
    defaultOption,
    { label: 'Most Liked', id: 'most_liked' },
  ];

  let [selectedSortByOption, setSelectedSortByOption] = useState<string>(searchParams.get("sort_by") || defaultOption.id);

  let isSomeFilterSet = selectedSortByOption && selectedSortByOption !== "";

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
    setSelectedSortByOption("");
    setSearchParams((params => {
      params.delete("sort_by");
      return params;
    }));
    setOpen(false);
  }

  const handleApplySort = () => {
    setSearchParams((params => {
      if(selectedSortByOption) {
        params.set("sort_by", selectedSortByOption);
      } else {
        params.delete("sort_by");
      }
      return params;
    }));
    setOpen(false);
  }

  useEffect(() => {
    let isMounted = true;
    if(isMounted) {
      setSelectedSortByOption(searchParams.get("sort_by") || "latest");
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
          {"Collection Sorting"}
        </DialogTitle>
        <DialogContent>
          {
            <div className={classes.filterContainer}>
              <Autocomplete
                id="status-filter"
                options={sortByOptions}
                disabled={sortByOptions.length === 0}
                sx={{ width: 420, maxWidth: '100%' }}
                className={classes.inputSpacer}
                onChange={(event, value, reason, details) => {
                  if(value) {
                    setSelectedSortByOption(value.id);
                  } else {
                    setSelectedSortByOption("");
                  }
                }}
                renderInput={(params) => <TextField {...params} label="Sort By" />}
                isOptionEqualToValue={(option, value) => {console.log({option, value});return option.id === value.id}}
                value={sortByOptions.find((option) => option.id === selectedSortByOption) || defaultOption}
              />
            </div>
          }
        </DialogContent>
        <DialogActions style={{display: 'flex', justifyContent: 'space-between'}}>
          {
            (isSomeFilterSet) &&
            <Button onClick={handleClearFilters} color="error">Clear Sorting</Button>
          }
          {
            (!isSomeFilterSet) &&
            <Button onClick={() => setOpen(false)}>Close</Button>
          }
          <Button onClick={() => handleApplySort()} autoFocus>
            Apply Sort
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default GenericCollectionSortZoneInner;