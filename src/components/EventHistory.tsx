import React from 'react';

import dayjs from 'dayjs';

import { shortenAddress } from '@usedapp/core'

import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import Typography from '@mui/material/Typography';
import createStyles from '@mui/styles/createStyles';

import MintIcon from '@mui/icons-material/AutoAwesome';
import BurnIcon from '@mui/icons-material/LocalFireDepartment';
import TransferIcon from '@mui/icons-material/Send';

import { PropsFromRedux } from '../containers/EventHistoryContainer';

import {
  ITransferEventERC721Record,
  ITransferEventERC20Record,
} from '../interfaces';

import {
  ZERO_ADDRESS,
} from '../utils/constants';

import {
  centerShortenLongString,
} from '../utils';

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
    eventRecord: {
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-start',
      marginBottom: theme.spacing(2),
    },
    eventIconOuterContainer: {
      marginRight: theme.spacing(2),
    },
    eventIconInnerContainer: {
      backgroundColor: '#e7e7e7',
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

interface ITokenEventHistory {
  eventRecords: ITransferEventERC721Record[] | ITransferEventERC20Record[] | null
}

const getEventIcon = (event: ITransferEventERC721Record | ITransferEventERC20Record) => {
  // mint
  if((event.from === ZERO_ADDRESS) && (event.to !== ZERO_ADDRESS)) {
    return <MintIcon color="inherit" />;
  }
  // burn
  if((event.from !== ZERO_ADDRESS) && (event.to === ZERO_ADDRESS)) {
    return <BurnIcon color="inherit" />;
  }
  // transfer
  if((event.from !== ZERO_ADDRESS) && (event.to !== ZERO_ADDRESS)) {
    return <TransferIcon color="inherit" />;
  }
}

const getEventSummaryLineEntryOne = (event: ITransferEventERC721Record | ITransferEventERC20Record) => {
  // mint
  if((event.from === ZERO_ADDRESS) && (event.to !== ZERO_ADDRESS)) {
    return (
      <div style={{display: 'flex'}}>
        <Typography variant="body1" style={{lineHeight: 1}}>Minted into&nbsp;</Typography>
        <Typography variant="body1" style={{fontWeight: 'bold', lineHeight: 1}}>{shortenAddress(event.to)}</Typography>
        <Typography variant="body1" style={{lineHeight: 1}}>&nbsp;via tx&nbsp;</Typography>
        <Typography variant="body1" style={{fontWeight: 'bold', lineHeight: 1}}>0x{centerShortenLongString(event.transaction_hash.replace('0x', ''), 8)}</Typography>
      </div>
    );
  }
  // burn
  if((event.from !== ZERO_ADDRESS) && (event.to === ZERO_ADDRESS)) {
    return (
      <div style={{display: 'flex'}}>
        <Typography variant="body1" style={{lineHeight: 1}}>Burnt from&nbsp;</Typography>
        <Typography variant="body1" style={{fontWeight: 'bold', lineHeight: 1}}>{shortenAddress(event.from)}</Typography>
        <Typography variant="body1" style={{lineHeight: 1}}>&nbsp;via tx&nbsp;</Typography>
        <Typography variant="body1" style={{fontWeight: 'bold', lineHeight: 1}}>0x{centerShortenLongString(event.transaction_hash.replace('0x', ''), 8)}</Typography>
      </div>
    );
  }
  // transfer
  if((event.from !== ZERO_ADDRESS) && (event.to !== ZERO_ADDRESS)) {
    return (
      <div style={{display: 'flex'}}>
        <Typography variant="body1" style={{lineHeight: 1}}>Transferred from&nbsp;</Typography>
        <Typography variant="body1" style={{fontWeight: 'bold', lineHeight: 1}}>{shortenAddress(event.from)}</Typography>
        <Typography variant="body1" style={{lineHeight: 1}}>&nbsp;to&nbsp;</Typography>
        <Typography variant="body1" style={{fontWeight: 'bold', lineHeight: 1}}>{shortenAddress(event.to)}</Typography>
        <Typography variant="body1" style={{lineHeight: 1}}>&nbsp;via tx&nbsp;</Typography>
        <Typography variant="body1" style={{fontWeight: 'bold', lineHeight: 1}}>0x{centerShortenLongString(event.transaction_hash.replace('0x', ''), 8)}</Typography>
      </div>
    );
  }
}

const getEventSummaryLineEntryTwo = (event: ITransferEventERC721Record | ITransferEventERC20Record) => {
  return (
    <div style={{display: 'flex'}}>
      <Typography variant="overline" style={{lineHeight: 1}}>{event.evm_transaction ? dayjs.unix(Number(event.evm_transaction.block_timestamp)).format('DD/MM/YYYY, hh:mm A') : 'loading...'}</Typography>
    </div>
  );
}

const EventHistory = (props: PropsFromRedux & ITokenEventHistory) => {
    const classes = useStyles();

    const { 
      isConsideredMobile,
      eventRecords,
    } = props;

    return (
        <>
          <div className={classes.root}>
              <div className={classes.content}>
                {eventRecords && eventRecords.sort((a, b) => {
                  return Number(b.evm_transaction?.block_timestamp) - Number(a.evm_transaction?.block_timestamp)
                }).map((eventRecord) => 
                  <div className={classes.eventRecord}>
                    <div className={classes.eventIconOuterContainer}>
                      <div className={classes.eventIconInnerContainer}>
                        {getEventIcon(eventRecord)}
                      </div>
                    </div>
                    <div className={classes.eventRecordSummaryContainer}>
                      <div className={classes.eventRecordSummaryLineOne}>
                        {getEventSummaryLineEntryOne(eventRecord)}
                      </div>
                      {getEventSummaryLineEntryTwo(eventRecord)}
                    </div>
                  </div>
                )}
              </div>
          </div>
        </>
    )
};

export default EventHistory;