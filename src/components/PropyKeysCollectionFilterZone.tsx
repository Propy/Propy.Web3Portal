import React from 'react'

import Button from '@mui/material/Button';

import FilterListIcon from '@mui/icons-material/FilterList';

import PropyKeysCollectionFilterZoneInner from './PropyKeysCollectionFilterZoneInner';

import { PropsFromRedux } from '../containers/CollectionBannerContainer';

interface ICollectionFilterZone {
  collectionSlug: string
  contractNameOrCollectionNameOrAddress: string
  network: string
  isLoading: boolean
}

const PropyKeysCollectionFilterZone = (props: ICollectionFilterZone & PropsFromRedux) => {

  let {
    collectionSlug,
    network,
    contractNameOrCollectionNameOrAddress,
    isLoading,
  } = props;

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  return (
    <>
      <Button disabled={isLoading} variant={'outlined'} color={"primary"} onClick={() => handleClickOpen()} startIcon={<FilterListIcon />}>{"Filters"}</Button>
      {open &&
        <PropyKeysCollectionFilterZoneInner isLoading={isLoading} collectionSlug={collectionSlug} contractNameOrCollectionNameOrAddress={contractNameOrCollectionNameOrAddress} network={network} open={open} setOpen={setOpen} />
      }
    </>
  )
}

export default PropyKeysCollectionFilterZone;