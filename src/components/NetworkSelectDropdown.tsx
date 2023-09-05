import React from 'react';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Typography from '@mui/material/Typography';

import { PropsFromRedux } from '../containers/NetworkSelectDropdownContainer';

import EthLogo from '../assets/img/eth.png';
import ArbitrumLogo from '../assets/img/arbitrum.png';
import { SupportedNetworks } from '../interfaces';

const NetworkSelectDropdown = (props: PropsFromRedux) => {

  let {
    activeNetwork,
    setActiveNetwork,
  } = props;

  const handleChange = (event: SelectChangeEvent) => {
    setActiveNetwork(event.target.value as SupportedNetworks);
  };

  return (
    <Box sx={{ minWidth: 151 }}>
      <FormControl fullWidth size="small">
        {/* <InputLabel id="network-selection-dropdown-label">Network</InputLabel> */}
        <Select
          labelId="network-selection-dropdown-label"
          id="network-selection-dropdown"
          value={activeNetwork}
          // label="Network"
          onChange={handleChange}
          // renderValue={(value) => {
          //   if(value === 'arbitrum') {
          //     return (
          //       <div style={{ display: "flex", alignItems: 'center', justifyContent: 'center' }}>
          //         <img src={ArbitrumLogo} style={{height: 23}} alt="Arbitrum Network" />
          //       </div>
          //     );
          //   }
          //   return (
          //     <div style={{ display: "flex", alignItems: 'center', justifyContent: 'center' }}>
          //       <img src={EthLogo} style={{height: 23}} alt="Ethereum Network" />
          //     </div>
          //   )
          // }}
        >
          <MenuItem value={'ethereum'}>
            <Box sx={{ display: "flex", gap: 0.5, alignItems: 'center' }}>
              <img src={EthLogo} style={{height: 23, marginRight: 8}} alt="Ethereum Network" />
              <Typography>
                Ethereum
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem value={'arbitrum'}>
            <Box sx={{ display: "flex", gap: 0.5, alignItems: 'center' }}>
              <img src={ArbitrumLogo} style={{height: 23, marginRight: 8}} alt="Arbitrum Network" />
              <Typography>
                Arbitrum
              </Typography>
            </Box>
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}

export default NetworkSelectDropdown;