import React from 'react'

import Button from '@mui/material/Button';
import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import SortIcon from '@mui/icons-material/FilterList';
import FilterIcon from '@mui/icons-material/FilterAlt';

import HomeListingCollectionFilterZoneInner from './HomeListingCollectionFilterZoneInner';
import GenericCollectionSortZoneInner from './GenericCollectionSortZoneInner';

import { PropsFromRedux } from '../containers/CollectionBannerContainer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    filterButtonSpacerDesktop: {
      marginRight: theme.spacing(1),
    },
    filterButtonSpacerMobile: {
      marginRight: theme.spacing(1),
      marginTop: theme.spacing(1),
    }
  }),
);

interface ICollectionFilterZone {
  collectionSlug: string
  contractNameOrCollectionNameOrAddress: string
  network: string
  isLoading: boolean
  setPage: (arg0: number) => void
  nftContractAddress: string
}

const HomeListingCollectionFilterZone = (props: ICollectionFilterZone & PropsFromRedux) => {

  const classes = useStyles();

  let {
    collectionSlug,
    network,
    contractNameOrCollectionNameOrAddress,
    isLoading,
    isConsideredMobile,
    setPage,
    nftContractAddress,
  } = props;

  const [openFilters, setOpenFilters] = React.useState(false);
  const [openSort, setOpenSort] = React.useState(false);

  const handleClickOpenFilters = () => {
    setOpenFilters(true);
  };

  const handleClickOpenSort = () => {
    setOpenSort(true);
  };

  return (
    <>
      <Button className={isConsideredMobile ? classes.filterButtonSpacerMobile : classes.filterButtonSpacerDesktop} disabled={isLoading} variant={'outlined'} color={"primary"} onClick={() => handleClickOpenFilters()} startIcon={<FilterIcon />}>{"Filters"}</Button>
      <Button className={isConsideredMobile ? classes.filterButtonSpacerMobile : ''} disabled={isLoading} variant={'outlined'} color={"primary"} onClick={() => handleClickOpenSort()} startIcon={<SortIcon />}>{"Sorting"}</Button>
      <HomeListingCollectionFilterZoneInner open={openFilters} nftContractAddress={nftContractAddress} setPage={setPage} isConsideredMobile={isConsideredMobile} isLoading={isLoading} collectionSlug={collectionSlug} contractNameOrCollectionNameOrAddress={contractNameOrCollectionNameOrAddress} network={network} setOpen={setOpenFilters} />
      <GenericCollectionSortZoneInner open={openSort} setOpen={setOpenSort} setPage={setPage} isConsideredMobile={isConsideredMobile} isLoading={isLoading} collectionSlug={collectionSlug} contractNameOrCollectionNameOrAddress={contractNameOrCollectionNameOrAddress} network={network} />
    </>
  )
}

export default HomeListingCollectionFilterZone;