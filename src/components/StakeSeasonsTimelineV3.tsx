import React, {useEffect, useRef} from 'react';

import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

import {
  priceFormat,
} from '../utils';

const seasons = [
  {
    startDate: "2025-10-30T12:00:00.000Z",
    endDate: "2025-11-30T12:00:00.000Z",
    startDateEnrollment: "2025-10-30T12:00:00.000Z",
    endDateEnrollment: "2025-11-06T12:00:00.000Z",
    rewardDate: "2025-11-28T12:00:00.000Z",
    rewardAmount: 75000
  },
  {
    startDate: "2025-12-01T12:00:00.000Z",
    endDate: "2026-01-04T12:00:00.000Z",
    startDateEnrollment: "2025-12-01T12:00:00.000Z",
    endDateEnrollment: "2025-12-08T12:00:00.000Z",
    rewardDate: "2026-01-02T12:00:00.000Z",
    rewardAmount: 75000
  },
  {
    startDate: "2026-01-05T12:00:00.000Z",
    endDate: "2026-02-01T12:00:00.000Z",
    startDateEnrollment: "2026-01-05T12:00:00.000Z",
    endDateEnrollment: "2026-01-12T12:00:00.000Z",
    rewardDate: "2026-01-30T12:00:00.000Z",
    rewardAmount: 75000
  },
  {
    startDate: "2026-02-02T12:00:00.000Z",
    endDate: "2026-03-01T12:00:00.000Z",
    startDateEnrollment: "2026-02-02T12:00:00.000Z",
    endDateEnrollment: "2026-02-09T12:00:00.000Z",
    rewardDate: "2026-02-27T12:00:00.000Z",
    rewardAmount: 75000
  },
  {
    startDate: "2026-03-02T12:00:00.000Z",
    endDate: "2026-03-31T12:00:00.000Z",
    startDateEnrollment: "2026-03-02T12:00:00.000Z",
    endDateEnrollment: "2026-03-09T12:00:00.000Z",
    rewardDate: "2026-03-31T12:00:00.000Z",
    rewardAmount: 75000
  },
  {
    startDate: "2026-04-01T12:00:00.000Z",
    endDate: "2026-04-30T12:00:00.000Z",
    startDateEnrollment: "2026-04-01T12:00:00.000Z",
    endDateEnrollment: "2026-04-08T12:00:00.000Z",
    rewardDate: "2026-04-30T12:00:00.000Z",
    rewardAmount: 75000
  },
  {
    startDate: "2026-05-01T12:00:00.000Z",
    endDate: "2026-06-01T12:00:00.000Z",
    startDateEnrollment: "2026-05-01T12:00:00.000Z",
    endDateEnrollment: "2026-05-08T12:00:00.000Z",
    rewardDate: "2026-06-01T12:00:00.000Z",
    rewardAmount: 75000
  },
  {
    startDate: "2026-06-02T12:00:00.000Z",
    endDate: "2026-07-01T12:00:00.000Z",
    startDateEnrollment: "2026-06-02T12:00:00.000Z",
    endDateEnrollment: "2026-06-09T12:00:00.000Z",
    rewardDate: "2026-07-01T12:00:00.000Z",
    rewardAmount: 75000
  },
  {
    startDate: "2026-07-02T12:00:00.000Z",
    endDate: "2026-08-03T12:00:00.000Z",
    startDateEnrollment: "2026-07-02T12:00:00.000Z",
    endDateEnrollment: "2026-07-09T12:00:00.000Z",
    rewardDate: "2026-08-03T12:00:00.000Z",
    rewardAmount: 75000
  },
  {
    startDate: "2026-08-04T12:00:00.000Z",
    endDate: "2026-08-31T12:00:00.000Z",
    startDateEnrollment: "2026-08-04T12:00:00.000Z",
    endDateEnrollment: "2026-08-11T12:00:00.000Z",
    rewardDate: "2026-08-31T12:00:00.000Z",
    rewardAmount: 75000
  },
  {
    startDate: "2026-09-01T12:00:00.000Z",
    endDate: "2026-09-30T12:00:00.000Z",
    startDateEnrollment: "2026-09-01T12:00:00.000Z",
    endDateEnrollment: "2026-09-08T12:00:00.000Z",
    rewardDate: "2026-09-30T12:00:00.000Z",
    rewardAmount: 75000
  },
  {
    startDate: "2026-10-01T12:00:00.000Z",
    endDate: "2026-10-30T12:00:00.000Z",
    startDateEnrollment: "2026-10-01T12:00:00.000Z",
    endDateEnrollment: "2026-10-08T12:00:00.000Z",
    rewardDate: "2026-10-30T12:00:00.000Z",
    rewardAmount: 175000
  },
];

interface IStakeSeasonsTimelineV3 {
  activeSeason: number
}

const StakeSeasonsTimelineV3 = (props: IStakeSeasonsTimelineV3) => {

  const {
    activeSeason,
  } = props;

  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollActiveSeasonIntoView = (seasonIndex: number) => {
    stepRefs.current[seasonIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  };

  useEffect(() => {
    if (activeSeason >= 1 && activeSeason <= seasons.length) {
      scrollActiveSeasonIntoView(activeSeason - 1);
    }
  }, [activeSeason])

  return (
    <Box sx={{ width: '100%', overflowX: 'scroll', paddingBottom: '24px' }}>
      <Stepper activeStep={activeSeason - 1} alternativeLabel>
        {seasons.map((entry, index) => (
          <Step 
            style={{minWidth: '300px', maxWidth: '300px', fontWeight: '500'}}
            key={`${entry.startDate}-${index}`}
            ref={(el) => (stepRefs.current[index] = el)}
          >
            <StepLabel>
              Season {index + 1}<br/>
              {dayjs(entry.startDate).format('Do MMM YYYY')} - {dayjs(entry.endDate).format('Do MMM YYYY')}<br/>
              <span style={{fontSize: '0.8rem', fontWeight: 400}}>Reward: {priceFormat(entry.rewardAmount, 2, 'PRO')} on {dayjs(entry.rewardDate).format('Do MMM YYYY')}</span><br/>
              <span style={{fontSize: '0.8rem', fontWeight: 400}}>Enrollment: {dayjs(entry.startDateEnrollment).format('Do MMM YYYY')} - {dayjs(entry.endDateEnrollment).format('Do MMM YYYY')}</span>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}

export default StakeSeasonsTimelineV3;