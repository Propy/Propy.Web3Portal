
import React, { useEffect, useState } from 'react';

import dayjs from 'dayjs';

import { utils } from "ethers";

import StakeIcon from '@mui/icons-material/MoveToInbox';
import UnstakeIcon from '@mui/icons-material/Outbox';
import EarlyUnstakeIcon from '@mui/icons-material/HighlightOff';

import LinkWrapper from './LinkWrapper';

import {
  StakeService,
} from '../services/api';

import {
  NetworkName,
} from '../interfaces';

import PaginationTable from './PaginationTable';

import {
  priceFormat,
  centerShortenLongString,
  getEtherscanLinkByNetworkName,
} from '../utils';

import {
  ENV,
} from '../utils/constants'

const getTableHeading = (mode?: string) => {
  let heading = "Staking Event History";
  if(mode === "withdrawals") {
    heading = "Withdrawal History";
  }
  if(mode === "deposits") {
    heading = "Deposit History";
  }
  return heading;
}

const getTableSubtitle = (mode?: string) => {
  let subTitle = "Updates may take a few minutes to reflect";
  // if(mode === "withdrawals") {
  //   heading = "Withdrawal History";
  // }
  // if(mode === "deposits") {
  //   heading = "Deposit History";
  // }
  return subTitle;
}

interface IStakingEventsV3 {

}

const StakingEventsV3 = (props: IStakingEventsV3) => {

  const [isFetchingTransactions, setIsFetchingTransactions] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // refactor into react-query
  useEffect(() => {
    let isMounted = true;
    const loadStakingEventsV3 = async () => {
      let results = await StakeService.getStakingEventsV3Paginated(page, perPage, ENV !== 'prod' ? 'testnet' : undefined);
      if(isMounted) {
        setTransactions(results.data?.data);
        setTotalRecords(results?.data?.metadata?.pagination?.total);
      }
      if(isMounted) {
        setIsFetchingTransactions(false);
      }
    };
    loadStakingEventsV3();
    return () => {
      isMounted = false;
    }
  }, [page, perPage])

  const getColumnConfig = (
    // mode?: string
  ) => {
    let colConfig = [
      {
        id: 'type',
        label: 'Event Type',
        valueKey: 'type',
        numeric: true,
        disablePadding: false,
        tCellStyle: {display: 'flex', alignItems: 'center'},
        valueFormatterAsElement: (value: string) => {
          let result;
          let icon;
          if (value === 'EnteredStakingERC20') {
            icon = <StakeIcon style={{marginRight: '8px'}} />
            result = 'Stake (PRO)';
          } else if(value === 'EarlyLeftStakingERC20') {
            icon = <EarlyUnstakeIcon style={{marginRight: '8px'}} />
            result = 'Early Unstake (PRO)';
          } else if (value === 'LeftStakingERC20') {
            icon = <UnstakeIcon style={{marginRight: '8px'}} />
            result = 'Unstake (PRO)';
          } else if (value === 'EnteredStakingLP') {
            icon = <StakeIcon style={{marginRight: '8px'}} />
            result = 'Stake (LP NFT)'
          } else if (value === 'LeftStakingLP') {
            icon = <UnstakeIcon style={{marginRight: '8px'}} />
            result = 'Unstake (LP NFT)'
          } else if (value === 'EarlyLeftStakingLP') {
            icon = <EarlyUnstakeIcon style={{marginRight: '8px'}} />
            result = 'Early Unstake (LP NFT)'
          } else if (value === 'EnteredStakingPropyKeys') {
            icon = <StakeIcon style={{marginRight: '8px'}} />
            result = 'Stake (PropyKey)';
          } else if (value === 'LeftStakingPropyKeys') {
            icon = <UnstakeIcon style={{marginRight: '8px'}} />
            result = 'Unstake (PropyKey)';
          }
          if(result) {
            return (
              <>
                {icon}
                <span style={{fontWeight: 'bold'}}>
                  {result}
                </span>
              </>
            )
          }
          return result;
        },
      },
      {
        id: 'staker',
        label: 'Staker',
        valueKey: 'staker',
        numeric: false,
        disablePadding: false,
        valueFormatterKeyArgs: ['staker', 'network_name'],
        valueFormatterAsElement: (staker: string, networkName: NetworkName) => {
          return (
            <LinkWrapper link={getEtherscanLinkByNetworkName(networkName, staker, 'address')} external={true}>
              <span style={{fontWeight: 'bold'}}>{centerShortenLongString(staker, 16, 2)}</span>
            </LinkWrapper>
          )
        },
      },
      {
        id: 'pro_amount_entered',
        label: 'Staked Asset Value',
        valueKey: 'pro_amount_entered',
        numeric: true,
        disablePadding: false,
        valueFormatterKeyArgs: ['type', 'pro_amount_entered', 'pro_amount_removed', 'virtual_pro_amount_entered', 'virtual_pro_amount_removed'],
        valueFormatterAsElement: (type: string, proAmountEntered: string, proAmountRemoved: string, virtualProAmountEntered: string, virtualProAmountRemoved: string) => {
          let value;
          if (type === 'EnteredStakingERC20') {
            value = priceFormat(Number(utils.formatUnits(proAmountEntered, 8)), 2, "PRO", false);
          } else if(type === 'EarlyLeftStakingERC20') {
            value = priceFormat(Number(utils.formatUnits(proAmountRemoved, 8)), 2, "PRO", false);
          } else if (type === 'LeftStakingERC20') {
            value = priceFormat(Number(utils.formatUnits(proAmountRemoved, 8)), 2, "PRO", false);
          } else if (type === 'EnteredStakingLP') {
            value = ` ~ ${priceFormat(Number(utils.formatUnits(virtualProAmountEntered, 8)), 2, "PRO", false)}`
          } else if (type === 'LeftStakingLP') {
            value = ` ~ ${priceFormat(Number(utils.formatUnits(virtualProAmountRemoved, 8)), 2, "PRO", false)}`
          } else if (type === 'EarlyLeftStakingLP') {
            value = ` ~ ${priceFormat(Number(utils.formatUnits(virtualProAmountRemoved, 8)), 2, "PRO", false)}`
          } else if (type === 'EnteredStakingPropyKeys') {
            value = ` ~ ${priceFormat(Number(utils.formatUnits(virtualProAmountEntered, 8)), 2, "PRO", false)}`
          } else if (type === 'LeftStakingPropyKeys') {
            value = ` ~ ${priceFormat(Number(utils.formatUnits(virtualProAmountRemoved, 8)), 2, "PRO", false)}`
          }
          if(value) {
            return <span style={{fontWeight: 'bold'}}>{value}</span>
          }
          return value;
        },
      },
      {
        id: 'pro_reward',
        label: 'Reward',
        valueKey: 'pro_reward',
        numeric: true,
        disablePadding: false,
        valueFormatterKeyArgs: ['type', 'pro_reward', 'pro_reward_foregone'],
        valueFormatterAsElement: (type: string, proReward: string) => {
          let value;
          if (type === 'LeftStakingERC20') {
            value = priceFormat(Number(utils.formatUnits(proReward ? proReward : 0, 8)), 2, "PRO", false);
          } else if (type === 'LeftStakingLP') {
            value = priceFormat(Number(utils.formatUnits(proReward ? proReward : 0, 8)), 2, "PRO", false);
          } else if (type === 'LeftStakingPropyKeys') {
            value = priceFormat(Number(utils.formatUnits(proReward ? proReward : 0, 8)), 2, "PRO", false);
          } else if (type === 'LeftStakingPropyKeys') {
            value = priceFormat(Number(utils.formatUnits(proReward ? proReward : 0, 8)), 2, "PRO", false);
          } else if (type === 'EarlyLeftStakingLP') {
            value = priceFormat(Number(utils.formatUnits(proReward ? proReward : 0, 8)), 2, "PRO", false);
          }  else if (type === 'EarlyLeftStakingERC20') {
            value = priceFormat(Number(utils.formatUnits(proReward ? proReward : 0, 8)), 2, "PRO", false);
          }
          if(value) {
            return <span style={{fontWeight: 'bold'}}>{value}</span>
          } else {
            return 'N/A';
          }
        },
      },
      {
        id: 'pro_reward_foregone',
        label: 'Forfeited Reward',
        valueKey: 'pro_reward_foregone',
        numeric: true,
        disablePadding: false,
        valueFormatterKeyArgs: ['type', 'pro_reward_foregone'],
        valueFormatterAsElement: (type: string, proRewardForegone: string) => {
          let value;
          if (type === 'EarlyLeftStakingLP') {
            value = priceFormat(Number(utils.formatUnits(proRewardForegone ? proRewardForegone : 0, 8)), 2, "PRO", false);
          } else if (type === 'EarlyLeftStakingERC20') {
            value = priceFormat(Number(utils.formatUnits(proRewardForegone ? proRewardForegone : 0, 8)), 2, "PRO", false);
          }
          if(value) {
            return <span style={{fontWeight: 'bold'}}>{value}</span>
          } else {
            return 'N/A';
          }
        },
      },
      {
        id: 'staking_power_issued',
        label: 'Staking Power',
        valueKey: 'staking_power_issued',
        numeric: true,
        disablePadding: false,
        valueFormatterKeyArgs: ['staking_power_issued', 'staking_power_burnt'],
        valueFormatterAsElement: (stakingPowerIssued: string, stakingPowerBurnt: string) => {
          if (stakingPowerIssued) {
            return <span style={{fontWeight: 'bold', color: 'green'}}>+ {priceFormat(Number(utils.formatUnits(stakingPowerIssued ? stakingPowerIssued : 0, 8)), 2, "pSTAKE", false)}</span>;
          } else if (stakingPowerBurnt) {
            return <span style={{fontWeight: 'bold', color: 'red'}}>- {priceFormat(Number(utils.formatUnits(stakingPowerBurnt ? stakingPowerBurnt : 0, 8)), 2, "pSTAKE", false)}</span>
          } else {
            return 'N/A';
          }
        },
      },
      {
        id: 'transaction_hash',
        label: 'Transaction Hash',
        valueKey: 'transaction_hash',
        numeric: false,
        disablePadding: false,
        valueFormatterKeyArgs: ['transaction_hash', 'network_name'],
        valueFormatterAsElement: (txHash: string, networkName: NetworkName) => {
          return (
            <LinkWrapper link={getEtherscanLinkByNetworkName(networkName, txHash, 'transaction')} external={true}>
              <span style={{fontWeight: 'bold'}}>{centerShortenLongString(txHash, 12, 2)}</span>
            </LinkWrapper>
          )
        },
      },
      {
        id: 'block_timestamp',
        label: 'Event Time',
        valueKey: 'block_timestamp',
        numeric: true,
        disablePadding: false,
        valueFormatterKeyArgs: ['block_timestamp', 'block_number', 'network_name'],
        valueFormatterAsElement: (blockTimestamp: string, blockNumber: string, networkName: NetworkName) => {
          return (
            <LinkWrapper link={getEtherscanLinkByNetworkName(networkName, blockNumber, 'block')} external={true}>
              <span style={{fontWeight: 'bold'}}>{dayjs.unix(Number(blockTimestamp)).format('MMM-D-YYYY hh:mm A')}</span>
            </LinkWrapper>
          )
        },
      },
    ]

    return colConfig;
  }

  return (
    <>
      <div>
        <PaginationTable
          tableData={transactions}
          totalRecords={totalRecords}
          onPageChange={(newPage: number) => setPage(newPage + 1)}
          onRowsPerPageChange={(newPerPage: number) => setPerPage(newPerPage)}
          tableHeading={getTableHeading()}
          tableSubtitle={getTableSubtitle()}
          columnConfig={getColumnConfig()}
          uniqueRowKey="transaction_hash"
          loadingRows={isFetchingTransactions ? 10 : 0}
          showNoRecordsFound={!isFetchingTransactions && (!transactions || transactions.length === 0)}
        />
      </div>
    </>
  )
}

export default StakingEventsV3;