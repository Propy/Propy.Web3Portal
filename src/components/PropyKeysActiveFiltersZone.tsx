import React, { useId } from 'react'

import { useSearchParams, URLSearchParamsInit, NavigateOptions } from "react-router-dom";

import Chip from '@mui/material/Chip';

import {
  ICollectionQueryFilter,
} from "../interfaces";

import { PropsFromRedux } from '../containers/CollectionBannerContainer';

import { capitalizeEachFirstLetterWithDelimiter } from '../utils';

interface IPropyKeysActiveFiltersZone {
  isLoading?: boolean
  activeFilters: ICollectionQueryFilter[]
}

declare type SetURLSearchParams = (nextInit?: URLSearchParamsInit | ((prev: URLSearchParams) => URLSearchParamsInit), navigateOpts?: NavigateOptions) => void;

const activeFilterToDisplayName = (activeFilter: ICollectionQueryFilter) => {
  switch(activeFilter.filter_type) {
    case "landmark": 
      return "Only Landmarks";
    case "attached_deed":
      return "Only Attached Deeds";
    default:
      return `${capitalizeEachFirstLetterWithDelimiter(activeFilter.filter_type, '_')}: ${activeFilter.value}`;
  }
}

const renderActiveFilter = (activeFilter: ICollectionQueryFilter, setSearchParams: SetURLSearchParams, uniqueId: string) => {
  return (
    <Chip color="primary" variant="outlined" key={`${uniqueId}-active-filter-${activeFilter.filter_type}-${activeFilter.value}`} style={{marginRight: 8, marginBottom: 8}} label={activeFilterToDisplayName(activeFilter)} onDelete={() => {
      setSearchParams((params => {
        params.delete(activeFilter.filter_type);
        return params;
      }));
    }} />
  )
}

const PropyKeysActiveFiltersZone = (props: IPropyKeysActiveFiltersZone & PropsFromRedux) => {

  let {
    activeFilters,
  } = props;

  const uniqueId = useId();

  // eslint-disable-next-line
  let [searchParams, setSearchParams] = useSearchParams();

  return (
    <>
      {activeFilters && activeFilters.map((activeFilter) => renderActiveFilter(activeFilter, setSearchParams, uniqueId))}
    </>
  )
}

export default PropyKeysActiveFiltersZone;