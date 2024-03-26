import React from 'react';

import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

import { useQuery } from '@tanstack/react-query';

import GenericPageContainer from '../containers/GenericPageContainer';
import BasicAreaChartContainer from '../containers/BasicAreaChartContainer';

import {
  priceFormat,
} from '../utils';

import {
  ITimeseries,
  ITimeseriesUTCDayAPIResponse,
} from '../interfaces';

import {
  TimeseriesService,
} from '../services/api';

import {
  BASE_L2_NETWORK,
  BASE_PROPYKEYS_STAKING_NFT,
} from '../utils/constants';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
        minWidth: 275,
        marginBottom: 15,
        marginTop: 15,
    },
    title: {
        fontSize: 14,
    },
    imageContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '250px',
    },
    exampleImage: {
        width: '30%',
        margin: theme.spacing(4),
    },
    sectionSpacer: {
        marginBottom: theme.spacing(6),
    }
  }),
);

interface IProps {
  darkMode?: boolean;
}

const AnalyticsPage = (
  props: IProps
) => {
    const classes = useStyles();

    // let {
    //   darkMode = false,
    // } = props;

    const { 
      data: propyKeysMintsTimeseries = [],
      isLoading
    } = useQuery({
      queryKey: ['propyKeysMintsTimeseries'],
      queryFn: async () => {
        let timeseriesResponse = await TimeseriesService.getPropyKeysDailyMintCounts(
          BASE_L2_NETWORK,
          BASE_PROPYKEYS_STAKING_NFT
        );
        if (timeseriesResponse?.status && timeseriesResponse?.data) {
          let renderResults: ITimeseries[] = [];
          let apiResponseData: ITimeseriesUTCDayAPIResponse = timeseriesResponse?.data?.data
            ? timeseriesResponse?.data
            : timeseriesResponse;
          if (timeseriesResponse?.status && apiResponseData?.data) {
            for (let timeseriesRecord of apiResponseData?.data) {
              renderResults.push({
                date: timeseriesRecord.utc_day,
                value: Number(timeseriesRecord.record_count),
              });
            }
          }
          return renderResults;
        }
        return [];
      },
      cacheTime: Infinity, // Cache the data indefinitely
      staleTime: Infinity, // Data is always considered fresh
    });

    return (
        <>
            <GenericPageContainer
                // title="Dashboard"
            >
                <div className={classes.sectionSpacer}>
                  <div style={{width: '100%'}}>
                    <BasicAreaChartContainer
                      chartData={propyKeysMintsTimeseries}
                      loading={isLoading}
                      leftTextTitle={`PropyKeys`}
                      leftTextSubtitle={`Daily Mints`}
                      rightTextFormatValueFn={(value: any) => priceFormat(value, 0, 'Mints', false)}
                      showChange={true}
                      changeType={"up-good"}
                      height={500}
                      formatValueFn={(value: any) => priceFormat(value, 0, "Mints", false)}
                    />
                  </div>
                </div>
            </GenericPageContainer>
        </>
    )
};

export default AnalyticsPage;