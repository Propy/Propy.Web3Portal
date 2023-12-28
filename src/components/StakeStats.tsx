import React, { useState, useRef, useEffect } from 'react';

import { animated, useSpring } from '@react-spring/web';

import { PieChart } from '@mui/x-charts/PieChart';

import { utils } from 'ethers';

import BigNumber from 'bignumber.js';

import { toast } from 'sonner';

import * as yup from 'yup';

import EastIcon from '@mui/icons-material/East';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { useAccount, useBalance, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';

import { Formik, Form, Field, FormikProps } from 'formik';
import { TextField } from 'formik-mui';

import { PropsFromRedux } from '../containers/BridgeFormContainer';

import EthLogo from '../assets/img/ethereum-web3-modal.png';
import BaseLogo from '../assets/img/base-solid.png';

import FloatingActionButton from './FloatingActionButton';

import { SupportedNetworks } from '../interfaces';

import {
  priceFormat,
} from '../utils';

import {
  NETWORK_NAME_TO_DISPLAY_NAME,
  PROPY_LIGHT_BLUE,
} from '../utils/constants';

import ERC20ABI from '../abi/ERC20ABI.json';
import L1StandardBridgeABI from '../abi/L1StandardBridgeABI.json';
import L2StandardBridgeABI from '../abi/L2StandardBridgeABI.json';

BigNumber.config({ EXPONENTIAL_AT: [-1e+9, 1e+9] });

interface IStakeStats {

}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
    },
    card: {
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
    },
    cardInner: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: theme.spacing(4),
      width: '100%',
    },
  }),
);

interface IPieChartEntry {
  id: number
  value: number
  label: string
}

const StakeStats = (props: PropsFromRedux & IStakeStats) => {

  let {

  } = props;

  const classes = useStyles();

  const { 
    address,
  } = useAccount();

  const [pieChartData, setPieChartData] = useState<false | IPieChartEntry[]>(false);

  const originSpring = useSpring({
    from: {
      transform: 'translateX(25%)',
    },
    to: {
      transform: 'translateX(0%)',
    },
  })

  const destinationSpring = useSpring({
    from: {
      transform: 'translateX(-25%)',
    },
    to: {
      transform: 'translateX(0%)',
    },
  })

  const arrowSpring = useSpring({
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
    delay: 150,
  })

  useEffect(() => {
    let newPieChartData = [];

    if(address) {
      newPieChartData.push({ id: 1, value: 5, label: 'Your Stake' });
    }

    newPieChartData.push({ id: 0, value: 100, label: address ? 'Other\'s Stake' : 'Network Stake' });

    setPieChartData(newPieChartData);

  }, [address])

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <Card className={classes.card}>
            <div className={classes.cardInner}>
              {pieChartData && 
                <PieChart
                  series={[
                    {
                      data: pieChartData,
                    },
                  ]}
                  width={400}
                  height={200}
                />
              }
            </div>
          </Card>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Card className={classes.card}>
            <div className={classes.cardInner}>
              <div style={{height: 290}} />
            </div>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

export default StakeStats;