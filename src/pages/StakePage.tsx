import React from 'react';

import Typography from '@mui/material/Typography';
import LinkWrapper from '../components/LinkWrapper';
import { PROPY_LIGHT_BLUE } from '../utils/constants';

import {
  HOME_ADDRESS_NFT_STAKING_CONTRACT_NETWORK,
} from '../utils/constants';

import GenericPageContainer from '../containers/GenericPageContainer';
import NetworkGateContainer from '../containers/NetworkGateContainer';
import StakeStatsContainer from '../containers/StakeStatsContainer';

const StakePage = () => {
    return (
      <GenericPageContainer title="Stake">
        <NetworkGateContainer
          requiredNetwork={HOME_ADDRESS_NFT_STAKING_CONTRACT_NETWORK}
          onlyGateConnected={true}
        >
          <StakeStatsContainer />
        </NetworkGateContainer>
        {/* <Typography variant="h6" style={{fontWeight: 400}}>
          We are working hard to make staking live in January, please check back regularly or join our waitlist to be notified once staking goes live.
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
      </GenericPageContainer>
    )
};

export default StakePage;