import React, { useState } from 'react';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
// import { Typography } from '@mui/material';

import {
  BASE_L2_NETWORK,
  // PROPY_LIGHT_BLUE,
} from '../utils/constants';

import GenericPageContainer from '../containers/GenericPageContainer';
import NetworkGateContainer from '../containers/NetworkGateContainer';
import StakeStatsContainer from '../containers/StakeStatsContainer';
import StakePortalContainer from '../containers/StakePortalContainer';

// import LinkWrapper from '../components/LinkWrapper';

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

interface IStakePage {
  version: number
}

const StakePage = (props: IStakePage) => {

  let {
    version,
  } = props;

  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTabIndex(newValue);
  };

  return (
    <NetworkGateContainer
      requiredNetwork={BASE_L2_NETWORK}
      requireConnected={true}
    >
      <GenericPageContainer>
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 2 }}>
            <Tabs 
              value={selectedTabIndex}
              onChange={handleChange}
              aria-label="basic tabs example"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Stats" {...a11yProps(0)} />
              <Tab label="Stake" {...a11yProps(1)} />
              <Tab label="Unstake" {...a11yProps(2)} />
            </Tabs>
          </Box>
          {(selectedTabIndex === 0) &&
            <StakeStatsContainer version={version} />
          }
          {(selectedTabIndex === 1) &&
            <StakePortalContainer mode="enter" version={version} />
          }
          {(selectedTabIndex === 2) &&
            <StakePortalContainer mode="leave" version={version} />
          }
        </>
      </GenericPageContainer>
    </NetworkGateContainer>
  )
};

export default StakePage;