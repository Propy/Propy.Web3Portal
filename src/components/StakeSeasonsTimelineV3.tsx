import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

const steps = [
  '',
  '',
  '',
  '',
  '',
  '',
  // '',
  // '',
  // '',
  // '',
  // '',
  // '',
];

interface IStakeSeasonsTimelineV3 {
  activeSeason: number
}

const StakeSeasonsTimelineV3 = (props: IStakeSeasonsTimelineV3) => {

  const {
    activeSeason,
  } = props;

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeSeason - 1} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}

export default StakeSeasonsTimelineV3;