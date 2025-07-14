import React, { useId } from 'react';

import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

import { shortenAddress } from '@usedapp/core'

import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import Typography from '@mui/material/Typography';
import createStyles from '@mui/styles/createStyles';

import MintIcon from '@mui/icons-material/AutoAwesome';
import BurnIcon from '@mui/icons-material/LocalFireDepartment';
import TransferIcon from '@mui/icons-material/Send';
import BridgeIcon from '@mui/icons-material/Link';

import { utils } from "ethers";

import { PropsFromRedux } from '../containers/EventHistoryContainer';

import LinkWrapper from './LinkWrapper';

import {
  ITransferEventERC721Record,
  ITransferEventERC20Record,
  NetworkName,
  IAssetRecord,
  IONFTReceivedEventRecord,
  IONFTSentEventRecord,
} from '../interfaces';

import {
  ZERO_ADDRESS,
  PROPY_LIGHT_GREY,
  NETWORK_NAME_TO_DISPLAY_NAME,
} from '../utils/constants';

import {
  centerShortenLongString,
  getEtherscanLinkByNetworkName,
  priceFormat,
  lzEidToNetworkName,
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

interface ITokenEventHistory {
  eventRecords: ITransferEventERC721Record[] | ITransferEventERC20Record[] | IONFTReceivedEventRecord[] | IONFTSentEventRecord[] | null
  assetRecord: IAssetRecord
}

const getEventIcon = (event: ITransferEventERC721Record | ITransferEventERC20Record | IONFTReceivedEventRecord | IONFTSentEventRecord) => {
  console.log("getEventIcon", event);
  // Standard transfers
  if('from' in event && 'to' in event) {
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
  } else {
    // Non-standard events e.g. LayerZero bridging
    if(["ONFTReceived", "ONFTSent"].indexOf(event.type) > -1) {
      return <BridgeIcon color="inherit" />;
    }
  }
}

const renderAddress = (value: string, networkName: NetworkName) => {
  let innerElement = <Typography variant="body1" style={{fontWeight: 'bold', lineHeight: 1}}>{shortenAddress(value)}</Typography>;
  let link = getEtherscanLinkByNetworkName(networkName, value, 'address');
  if(link) {
    return (
      <LinkWrapper external={true} link={link}>
        {innerElement}
      </LinkWrapper>
    )
  }
  return innerElement
}

const renderTxHash = (value: string, networkName: NetworkName) => {
  let innerElement = <Typography variant="body1" style={{fontWeight: 'bold', lineHeight: 1}}>0x{centerShortenLongString(value.replace('0x', ''), 8)}</Typography>;
  let link = getEtherscanLinkByNetworkName(networkName, value, 'transaction');
  if(link) {
    return (
      <LinkWrapper external={true} link={link}>
        {innerElement}
      </LinkWrapper>
    )
  }
  return innerElement
}

const getEventSummaryLineEntryOne = (event: ITransferEventERC721Record | ITransferEventERC20Record | IONFTReceivedEventRecord | IONFTSentEventRecord, assetRecord: IAssetRecord) => {
  console.log({event, assetRecord});
  // Standard Transfers
  if('from' in event && 'to' in event) {
    // mint
    if((event.from === ZERO_ADDRESS) && (event.to !== ZERO_ADDRESS)) {
      return (
        <div style={{display: 'flex'}}>
          <Typography variant="body1" style={{lineHeight: 1}}>Minted into&nbsp;</Typography>
          {renderAddress(event.to, event.network_name)}
          <Typography variant="body1" style={{lineHeight: 1}}>&nbsp;via tx&nbsp;</Typography>
          {renderTxHash(event.transaction_hash, event.network_name)}
        </div>
      );
    }
    // burn
    if((event.from !== ZERO_ADDRESS) && (event.to === ZERO_ADDRESS)) {
      return (
        <div style={{display: 'flex'}}>
          <Typography variant="body1" style={{lineHeight: 1}}>Burnt from&nbsp;</Typography>
          {renderAddress(event.from, event.network_name)}
          <Typography variant="body1" style={{lineHeight: 1}}>&nbsp;via tx&nbsp;</Typography>
          {renderTxHash(event.transaction_hash, event.network_name)}
        </div>
      );
    }
    // transfer
    if((event.from !== ZERO_ADDRESS) && (event.to !== ZERO_ADDRESS)) {
      return (
        <div style={{display: 'flex'}}>
          {assetRecord?.standard === "ERC-721" &&
            <Typography variant="body1" style={{lineHeight: 1}}>Transferred from&nbsp;</Typography>
          }
          {assetRecord?.standard === "ERC-20" && event.value &&
            <Typography variant="body1" style={{lineHeight: 1}}>Transferred <strong>{priceFormat(Number(utils.formatUnits(event.value, assetRecord.decimals)), 2, assetRecord.symbol, false)}</strong> from&nbsp;</Typography>
          }
          {renderAddress(event.from, event.network_name)}
          <Typography variant="body1" style={{lineHeight: 1}}>&nbsp;to&nbsp;</Typography>
          {renderAddress(event.to, event.network_name)}
          <Typography variant="body1" style={{lineHeight: 1}}>&nbsp;via tx&nbsp;</Typography>
          {renderTxHash(event.transaction_hash, event.network_name)}
        </div>
      );
    }
  } else {
    // Non-standard events, e.g. LayerZero Bridging
    if(event.type === "ONFTSent" && 'dst_eid' in event) {
      return (
        <div style={{display: 'flex'}}>
          {assetRecord?.standard === "ERC-721" &&
            <Typography variant="body1" style={{lineHeight: 1}}>Bridged from&nbsp;</Typography>
          }
          <Typography variant="body1" style={{lineHeight: 1, fontWeight: 'bold'}}>{NETWORK_NAME_TO_DISPLAY_NAME[event?.network_name]}</Typography>
          <Typography variant="body1" style={{lineHeight: 1}}>&nbsp;to&nbsp;</Typography>
          <Typography variant="body1" style={{lineHeight: 1, fontWeight: 'bold'}}>{lzEidToNetworkName(Number(event?.dst_eid)) ? NETWORK_NAME_TO_DISPLAY_NAME[lzEidToNetworkName(Number(event?.dst_eid))] : lzEidToNetworkName(Number(event?.dst_eid))}</Typography>
          <Typography variant="body1" style={{lineHeight: 1}}>&nbsp;via tx&nbsp;</Typography>
          {renderTxHash(event.transaction_hash, event.network_name)}
        </div>
      );
    }
    if(event.type === "ONFTReceived" && 'src_eid' in event) {
      return (
        <div style={{display: 'flex'}}>
          {assetRecord?.standard === "ERC-721" &&
            <Typography variant="body1" style={{lineHeight: 1}}>Bridged from&nbsp;</Typography>
          }
          <Typography variant="body1" style={{lineHeight: 1, fontWeight: 'bold'}}>{NETWORK_NAME_TO_DISPLAY_NAME[event?.network_name]}</Typography>
          <Typography variant="body1" style={{lineHeight: 1}}>&nbsp;to&nbsp;</Typography>
          <Typography variant="body1" style={{lineHeight: 1, fontWeight: 'bold'}}>{lzEidToNetworkName(Number(event?.src_eid)) ? NETWORK_NAME_TO_DISPLAY_NAME[lzEidToNetworkName(Number(event?.src_eid))] : lzEidToNetworkName(Number(event?.src_eid))}</Typography>
          <Typography variant="body1" style={{lineHeight: 1}}>&nbsp;via tx&nbsp;</Typography>
          {renderTxHash(event.transaction_hash, event.network_name)}
        </div>
      );
    }
  }
}

const getEventSummaryLineEntryTwo = (event: ITransferEventERC721Record | ITransferEventERC20Record | IONFTReceivedEventRecord | IONFTSentEventRecord) => {
  return (
    <div style={{display: 'flex'}}>
      <Typography variant="overline" style={{lineHeight: 1, textTransform: 'none'}}>{event.evm_transaction ? dayjs.unix(Number(event.evm_transaction.block_timestamp)).format('MMM-D-YYYY hh:mm A') : 'loading...'}</Typography>
    </div>
  );
}

const EventHistory = (props: PropsFromRedux & ITokenEventHistory) => {
    const classes = useStyles();

    const {
      eventRecords,
      assetRecord,
    } = props;

    const uniqueId = useId();

    return (
        <>
          <div className={classes.root}>
              <div className={classes.content}>
                {eventRecords && eventRecords.sort((a, b) => {
                  return Number(b.evm_transaction?.block_timestamp) - Number(a.evm_transaction?.block_timestamp)
                }).map((eventRecord, index) => 
                  <div className={classes.eventRecord} key={`${uniqueId}-event-history-${eventRecord.transaction_hash}-${index}`}>
                    <div className={classes.eventIconOuterContainer}>
                      <div className={classes.eventIconInnerContainer}>
                        {getEventIcon(eventRecord)}
                      </div>
                    </div>
                    <div className={classes.eventRecordSummaryContainer}>
                      <div className={classes.eventRecordSummaryLineOne}>
                        {getEventSummaryLineEntryOne(eventRecord, assetRecord)}
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