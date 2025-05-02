import React, { useState } from 'react';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
// import { Typography } from '@mui/material';

import {
  BASE_L2_NETWORK,
  STAKING_V3_NETWORK,
  // PROPY_LIGHT_BLUE,
} from '../utils/constants';

import GenericPageContainer from '../containers/GenericPageContainer';
import NetworkGateContainer from '../containers/NetworkGateContainer';
import StakeStatsContainer from '../containers/StakeStatsContainer';
import StakePortalContainer from '../containers/StakePortalContainer';
import StakeStatsV3Container from '../containers/StakeStatsV3Container';
import StakePortalV3Container from '../containers/StakePortalV3Container';
import KYCWalletGateContainer from '../containers/KYCWalletGateContainer';

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
      requiredNetwork={version === 3 ? STAKING_V3_NETWORK : BASE_L2_NETWORK}
      requireConnected={true}
    >
      <>
        {Number(version) !== 3 &&
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
              {[1,2].indexOf(Number(version)) > -1 &&
                <>
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
              }
            </>
          </GenericPageContainer>
        }
        {Number(version) === 3 &&
        <>
          <KYCWalletGateContainer>
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
                {[1,2].indexOf(Number(version)) > -1 &&
                  <>
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
                }
                {(selectedTabIndex === 0) &&
                  <StakeStatsV3Container version={version} />
                }
                {(selectedTabIndex === 1) &&
                  <StakePortalV3Container mode="enter" version={version} />
                }
                {(selectedTabIndex === 2) &&
                  <StakePortalV3Container mode="leave" version={version} />
                }
              </>
            </GenericPageContainer>
          </KYCWalletGateContainer>
          </>
        }
      </>
    </NetworkGateContainer>
  )
};

export default StakePage;