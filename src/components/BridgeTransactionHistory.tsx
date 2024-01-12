import React, { useEffect, useState } from 'react';

import dayjs from 'dayjs';

import { useAccount } from 'wagmi';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import { utils } from "ethers";

import Button from '@mui/material/Button';

import EastIcon from '@mui/icons-material/East';

import LinkWrapper from './LinkWrapper';

import EthLogo from '../assets/img/ethereum-web3-modal.png';
import BaseLogo from '../assets/img/base-solid.png';

import { PropsFromRedux } from '../containers/BridgeTransactionHistoryContainer';

import {
  L1Networks,
  L2Networks,
} from '../interfaces';

import {
  BridgeService,
} from '../services/api';

import {
  IBaseWithdrawalProvenEvent,
  IBaseWithdrawalFinalizedEvent,
} from '../interfaces';

import SortableTable from './SortableTable';

import {
  capitalizeFirstLetter,
  priceFormat,
  centerShortenLongString,
} from '../utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    titleContainer: {
      marginBottom: theme.spacing(2),
      marginTop: theme.spacing(2),
      display: 'flex',
      justifyContent: 'space-between',
    },
    title: {
      fontWeight: '500',
      // color: 'white',
    },
    paginationContainer: {
      display: 'flex',
      justifyContent: 'center',
    },
    transactionListContainer: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
    },
    sectionSpacer: {
      marginBottom: theme.spacing(4),
    },
    bridgeIllustration: {
      // width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    bridgeIllustrationTable: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: theme.spacing(2),
      fontSize: '25px',
      fontWeight: '300',
    },
    networkLogo: {
      borderRadius: '50%',
      height: 50,
    },
    networkLogoTable: {
      borderRadius: '50%',
      height: 30,
    },
    networkLogoRight: {
      marginLeft: theme.spacing(0.5),
    },
    networkLogoLeft: {
      marginRight: theme.spacing(0.5),
    },
    transactionCard: {
      padding: theme.spacing(2),
      width: '100%',
      maxWidth: 420,
    },
    singleBridgeIcon: {
      fontSize: '30px',
    },
    singleBridgeTableIcon: {
      fontSize: '20px',
    },
    directionIcon: {
      display: 'flex',
      alignItems: 'center',
    }
  }),
);

interface IBridgeTransactionHistory {
  mode: 'withdrawals' | 'deposits' | 'all',
  l1Network: L1Networks,
  l2Network: L2Networks,
  l1TokenAddress: `0x${string}`,
  l2TokenAddress: `0x${string}`,
  triggerUpdateIndex?: number,
}

const getTableHeading = (mode: string) => {
  let heading = "Bridge History";
  if(mode === "withdrawals") {
    heading = "Withdrawal History";
  }
  if(mode === "deposits") {
    heading = "Deposit History";
  }
  return heading;
}

const getProveWithdrawalLink = (
  transactionHash: string,
) => {
  return `bridge/base-to-ethereum/prove-withdrawal/${transactionHash}`;
}

const getFinalizeWithdrawalLink = (
  transactionHash: string,
) => {
  return `bridge/base-to-ethereum/finalize-withdrawal/${transactionHash}`;
}

const BridgeTransactionHistory = (props: IBridgeTransactionHistory & PropsFromRedux) => {

  const classes = useStyles();

  const [transactions, setTransactions] = useState([]);

  const { 
    address,
  } = useAccount();

  let {
    mode,
    l1Network,
    l2Network,
    l1TokenAddress,
    l2TokenAddress,
    triggerUpdateIndex = 0,
  } = props;

  useEffect(() => {
    let isMounted = true;
    const loadBridgeTransactionHistory = async () => {
      if(address && l1Network && l2Network && l1TokenAddress && l2TokenAddress) {
        if(mode === "withdrawals") {
          let results = await BridgeService.getBaseBridgeWithdrawalsOverviewByAccountAndTokenAddresses(l1Network, l2Network, l1TokenAddress, l2TokenAddress, address);
          if(isMounted) {
            setTransactions(results.data);
          }
        }
        if(mode === "deposits") {
          let results = await BridgeService.getBaseBridgeDepositsOverviewByAccountAndTokenAddresses(l1Network, l2Network, l1TokenAddress, l2TokenAddress, address);
          if(isMounted) {
            setTransactions(results.data);
          }
        }
        if(mode === "all") {
          let results = await BridgeService.getBaseBridgeTransactionsOverviewByAccountAndTokenAddresses(l1Network, l2Network, l1TokenAddress, l2TokenAddress, address);
          if(isMounted) {
            setTransactions(results.data);
          }
        }
      }
    };
    loadBridgeTransactionHistory();
    return () => {
      isMounted = false;
    }
  }, [address, mode, l1Network, l2Network, l1TokenAddress, l2TokenAddress, triggerUpdateIndex])

  const getColumnConfig = (mode: string) => {
    let colConfig = [
      {
        id: 'transaction_actions',
        label: 'Transaction Actions',
        valueKey: 'transaction_hash',
        numeric: false,
        disablePadding: false,
        valueFormatterKeyArgs: ['type', 'transaction_hash', 'network_name', 'withdrawal_proven_event', 'withdrawal_finalized_event'],
        valueFormatterAsElement: (
          type: string, 
          transactionHash: string, 
          networkName: string, 
          withdrawalProvenEvent?: IBaseWithdrawalProvenEvent, 
          withdrawalFinalizedEvent?: IBaseWithdrawalFinalizedEvent
        ) => {
          return (
            <>
              {type === 'withdrawal' &&
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: 210}}>
                  {!withdrawalProvenEvent && 
                    <LinkWrapper link={getProveWithdrawalLink(transactionHash)} style={{width: '100%'}}>
                      <Button variant="contained" color="primary" style={{color: 'white', width: '100%'}}>
                        Prove Withdrawal
                      </Button>
                    </LinkWrapper>
                  }
                  {withdrawalProvenEvent && !withdrawalFinalizedEvent && 
                    <LinkWrapper link={getFinalizeWithdrawalLink(transactionHash)} style={{width: '100%'}}>
                      <Button variant="contained" color="primary" style={{color: 'white', width: '100%'}}>
                        Finalize Withdrawal
                      </Button>
                    </LinkWrapper>
                  }
                  {withdrawalProvenEvent && withdrawalFinalizedEvent && 
                    <Button variant="contained" color="primary" disabled={true} style={{color: 'white', width: '100%'}}>
                      Withdrawal Complete
                    </Button>
                  }
                </div>
              }
              {type === 'deposit' &&
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: 210}}>
                  <Button variant="contained" color="primary" disabled={true} style={{color: 'white', width: '100%'}}>
                    Deposit Executed
                  </Button>
                </div>
              }
            </>
          )
        },
      },
      {
        id: 'tx-type',
        label: 'Transaction Type',
        valueKey: 'type',
        numeric: false,
        disablePadding: false,
        // tHeadStyle: {width: "200px"},
        // tCellStyle: {width: "200px"},
        valueFormatterAsElement: (value: string) => {
          return (
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 200}}>
              {capitalizeFirstLetter(value)}
              <div className={classes.bridgeIllustrationTable}>
                {`(`}
                  <img className={[classes.networkLogoTable, classes.networkLogoLeft].join(" ")} src={value === 'withdrawal' ? BaseLogo : EthLogo} alt="Base" />
                  <div className={classes.directionIcon}>
                    <EastIcon className={classes.singleBridgeTableIcon} />
                  </div>
                  <img className={[classes.networkLogoTable, classes.networkLogoRight].join(" ")} src={value === 'withdrawal' ? EthLogo : BaseLogo} alt="Ethereum" />
                {`)`}
              </div>
            </div>
          )
        },
      },
      {
        id: 'amount',
        label: 'Amount',
        valueKey: 'amount',
        numeric: true,
        disablePadding: false,
        valueFormatter: (value: string) => priceFormat(Number(utils.formatUnits(value, 8)), 2, "PRO", false),
      },
      {
        id: 'transaction_hash',
        label: 'Transaction Hash',
        valueKey: 'transaction_hash',
        numeric: false,
        disablePadding: false,
        valueFormatter: (value: string) => centerShortenLongString(value, 16),
      },
      {
        id: 'timestamp',
        label: 'Timestamp',
        valueKey: 'timestamp',
        numeric: true,
        disablePadding: false,
        valueFormatter: (value: string) => dayjs.unix(Number(value)).format('MMM-D-YYYY hh:mm A'),
      },
    ]

    return colConfig;
  }

  return (
    <>
      <div>
        <SortableTable
          tableData={transactions}
          tableHeading={getTableHeading(mode)}
          defaultSortValueKey="timestamp"
          columnConfig={getColumnConfig(mode)}
          uniqueRowKey="transaction_hash"
          loadingRows={10}
        />
      </div>
    </>
  )
}

export default BridgeTransactionHistory;