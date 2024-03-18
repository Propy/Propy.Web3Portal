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

const StakePage = () => {

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
            <StakeStatsContainer />
          }
          {(selectedTabIndex === 1) &&
            <StakePortalContainer mode="enter" />
          }
          {(selectedTabIndex === 2) &&
            <StakePortalContainer mode="leave" />
          }
          {/* <Typography variant="h6" style={{fontWeight: 400}}>
            We are working hard to make staking live in March, please check back regularly or join our waitlist to be notified once staking goes live.
          </Typography>
          <br/>
          <Typography variant="h6" style={{color: PROPY_LIGHT_BLUE}}>
            <LinkWrapper link="https://forms.gle/xELf5i6xdMZ8Qq8h7" external={true} showExternalLinkIcon={true}>
              Join the waitlist
            </LinkWrapper>
          </Typography>
          <br/>
          <Typography variant="body1" style={{fontWeight: 400}}>
            Want to earn rewards for holding your Propy NFTs? Staking is the way to go! Simply deposit your NFTs along with some PRO into the staking contract and receive an ERC-20 token as a representation of your stake. You can withdraw your NFTs & PRO at any time after a minimum staking period, along with any accumulated PRO rewards. More details will be provided once staking goes live.
          </Typography> */}
        </>
      </GenericPageContainer>
    </NetworkGateContainer>
  )
};

export default StakePage;