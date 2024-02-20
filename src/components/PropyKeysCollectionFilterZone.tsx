import React from 'react'

import Button from '@mui/material/Button';
import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import FilterListIcon from '@mui/icons-material/FilterList';

import PropyKeysCollectionFilterZoneInner from './PropyKeysCollectionFilterZoneInner';

import { PropsFromRedux } from '../containers/CollectionBannerContainer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    filterButtonSpacerMobile: {
      marginTop: theme.spacing(1),
    }
  }),
);

interface ICollectionFilterZone {
  collectionSlug: string
  contractNameOrCollectionNameOrAddress: string
  network: string
  isLoading: boolean
}

const PropyKeysCollectionFilterZone = (props: ICollectionFilterZone & PropsFromRedux) => {

  const classes = useStyles();

  let {
    collectionSlug,
    network,
    contractNameOrCollectionNameOrAddress,
    isLoading,
    isConsideredMobile,
  } = props;

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  return (
    <>
      <Button className={isConsideredMobile ? classes.filterButtonSpacerMobile : ''} disabled={isLoading} variant={'outlined'} color={"primary"} onClick={() => handleClickOpen()} startIcon={<FilterListIcon />}>{"Filters"}</Button>
      {open &&
        <PropyKeysCollectionFilterZoneInner isConsideredMobile={isConsideredMobile} isLoading={isLoading} collectionSlug={collectionSlug} contractNameOrCollectionNameOrAddress={contractNameOrCollectionNameOrAddress} network={network} open={open} setOpen={setOpen} />
      }
    </>
  )
}

export default PropyKeysCollectionFilterZone;