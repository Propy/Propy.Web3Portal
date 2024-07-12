import React from 'react'

import Button from '@mui/material/Button';
import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import FilterListIcon from '@mui/icons-material/FilterList';

import HomeListingCollectionFilterZoneInner from './HomeListingCollectionFilterZoneInner';

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

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  return (
    <>
      <Button className={isConsideredMobile ? classes.filterButtonSpacerMobile : ''} disabled={isLoading} variant={'outlined'} color={"primary"} onClick={() => handleClickOpen()} startIcon={<FilterListIcon />}>{"Filters"}</Button>
      <HomeListingCollectionFilterZoneInner open={open} nftContractAddress={nftContractAddress} setPage={setPage} isConsideredMobile={isConsideredMobile} isLoading={isLoading} collectionSlug={collectionSlug} contractNameOrCollectionNameOrAddress={contractNameOrCollectionNameOrAddress} network={network} setOpen={setOpen} />
    </>
  )
}

export default HomeListingCollectionFilterZone;