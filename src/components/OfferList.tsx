import React, { useId } from 'react';

import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

import { shortenAddress } from '@usedapp/core'

import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import Typography from '@mui/material/Typography';
import createStyles from '@mui/styles/createStyles';

import OfferIcon from '@mui/icons-material/ConnectWithoutContact';

import { utils } from "ethers";

import { PropsFromRedux } from '../containers/EventHistoryContainer';

import LinkWrapper from './LinkWrapper';

import {
  IOfferRecord,
  NetworkName,
} from '../interfaces';

import {
  PROPY_LIGHT_GREY,
} from '../utils/constants';

import {
  getEtherscanLinkByNetworkName,
  priceFormat,
} from '../utils';

dayjs.extend(advancedFormat);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
        position: 'relative',
    },
    content: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      overflowX: 'scroll',
    },
    offerRecord: {
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-start',
      marginBottom: theme.spacing(2),
    },
    eventIconOuterContainer: {
      marginRight: theme.spacing(2),
    },
    eventIconInnerContainer: {
      backgroundColor: PROPY_LIGHT_GREY,
      width: 40,
      height: 40,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '50%',
      color: '#38a5fc',
    },
    eventRecordSummaryContainer: {
      whiteSpace: 'nowrap',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    eventRecordSummaryLineOne: {
      marginBottom: theme.spacing(0.5),
    },
  }),
);

interface ITokenOfferList {
  offerRecords: IOfferRecord[] | null
}

const getOfferIcon = () => {
  return <OfferIcon color="inherit" />;
}

const renderAddress = (value: string) => {
  let innerElement = <Typography variant="body1" style={{fontWeight: 'bold', lineHeight: 1}}>{shortenAddress(value)}</Typography>;
  let link = getEtherscanLinkByNetworkName(NetworkName["ethereum"], value, 'address');
  if(link) {
    return (
      <LinkWrapper external={true} link={link}>
        {innerElement}
      </LinkWrapper>
    )
  }
  return innerElement
}

const getEventSummaryLineEntryOne = (event: IOfferRecord) => {
  // mint
  return (
    <div style={{display: 'flex'}}>
      {renderAddress(event.user_address)}
      <Typography variant="body1" style={{lineHeight: 1}}>&nbsp;offered <strong>{priceFormat(Number(utils.formatUnits(event.offer_token_amount, event.offer_token.decimals)), 2, event.offer_token.symbol, false)}</strong>&nbsp;</Typography>
    </div>
  );
}

const getEventSummaryLineEntryTwo = (event: IOfferRecord) => {
  return (
    <div style={{display: 'flex'}}>
      <Typography variant="overline" style={{lineHeight: 1, textTransform: 'none'}}>{event.timestamp_unix ? dayjs.unix(Number(event.timestamp_unix)).format('MMM-D-YYYY hh:mm A') : 'loading...'}</Typography>
    </div>
  );
}

const OfferList = (props: PropsFromRedux & ITokenOfferList) => {
    const classes = useStyles();

    const {
      offerRecords,
    } = props;

    const uniqueId = useId();

    return (
        <>
          <div className={classes.root}>
              <div className={classes.content}>
                {offerRecords && offerRecords.sort((a, b) => {
                  return Number(b.timestamp_unix) - Number(a.timestamp_unix)
                }).map((offerRecord, index) => 
                  <div className={classes.offerRecord} key={`${uniqueId}-offer-list-${index}-${offerRecord.token_id}`}>
                    <div className={classes.eventIconOuterContainer}>
                      <div className={classes.eventIconInnerContainer}>
                        {getOfferIcon()}
                      </div>
                    </div>
                    <div className={classes.eventRecordSummaryContainer}>
                      <div className={classes.eventRecordSummaryLineOne}>
                        {getEventSummaryLineEntryOne(offerRecord)}
                      </div>
                      {getEventSummaryLineEntryTwo(offerRecord)}
                    </div>
                  </div>
                )}
              </div>
          </div>
        </>
    )
};

export default OfferList;