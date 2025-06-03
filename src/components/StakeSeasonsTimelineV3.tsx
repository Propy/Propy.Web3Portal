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
    startDate: "2025-06-05T00:00:00.000Z",
    endDate: "2025-06-30T23:59:59.999Z",
    startDateEnrollment: "2025-06-05T00:00:00.000Z",
    endDateEnrollment: "2025-06-12T23:59:59.999Z",
    rewardDate: "2025-06-30T00:00:00.000Z",
    rewardAmount: 75000
  },
  {
    startDate: "2025-07-01T00:00:00.000Z",
    endDate: "2025-07-31T23:59:59.999Z",
    startDateEnrollment: "2025-07-01T00:00:00.000Z",
    endDateEnrollment: "2025-07-08T23:59:59.999Z",
    rewardDate: "2025-07-31T00:00:00.000Z",
    rewardAmount: 75000
  },
  {
    startDate: "2025-08-01T00:00:00.000Z",
    endDate: "2025-08-31T23:59:59.999Z",
    startDateEnrollment: "2025-08-01T00:00:00.000Z",
    endDateEnrollment: "2025-08-08T23:59:59.999Z",
    rewardDate: "2025-08-29T00:00:00.000Z",
    rewardAmount: 75000
  },
  {
    startDate: "2025-09-01T00:00:00.000Z",
    endDate: "2025-09-30T23:59:59.999Z",
    startDateEnrollment: "2025-09-01T00:00:00.000Z",
    endDateEnrollment: "2025-09-08T23:59:59.999Z",
    rewardDate: "2025-09-30T00:00:00.000Z",
    rewardAmount: 75000
  },
  {
    startDate: "2025-10-01T00:00:00.000Z",
    endDate: "2025-11-02T23:59:59.999Z",
    startDateEnrollment: "2025-10-01T00:00:00.000Z",
    endDateEnrollment: "2025-10-08T23:59:59.999Z",
    rewardDate: "2025-10-31T00:00:00.000Z",
    rewardAmount: 75000
  },
  {
    startDate: "2025-11-03T00:00:00.000Z",
    endDate: "2025-11-30T23:59:59.999Z",
    startDateEnrollment: "2025-11-03T00:00:00.000Z",
    endDateEnrollment: "2025-11-09T23:59:59.999Z",
    rewardDate: "2025-11-28T00:00:00.000Z",
    rewardAmount: 75000
  },
  {
    startDate: "2025-12-01T00:00:00.000Z",
    endDate: "2026-01-04T23:59:59.999Z",
    startDateEnrollment: "2025-12-01T00:00:00.000Z",
    endDateEnrollment: "2025-12-08T23:59:59.999Z",
    rewardDate: "2026-01-02T00:00:00.000Z",
    rewardAmount: 75000
  },
  {
    startDate: "2026-01-05T00:00:00.000Z",
    endDate: "2026-02-01T23:59:59.999Z",
    startDateEnrollment: "2026-01-05T00:00:00.000Z",
    endDateEnrollment: "2026-01-12T23:59:59.999Z",
    rewardDate: "2026-01-30T00:00:00.000Z",
    rewardAmount: 75000
  },
  {
    startDate: "2026-02-02T00:00:00.000Z",
    endDate: "2026-03-01T23:59:59.999Z",
    startDateEnrollment: "2026-02-02T00:00:00.000Z",
    endDateEnrollment: "2026-02-09T23:59:59.999Z",
    rewardDate: "2026-02-27T00:00:00.000Z",
    rewardAmount: 75000
  },
  {
    startDate: "2026-03-02T00:00:00.000Z",
    endDate: "2026-03-31T23:59:59.999Z",
    startDateEnrollment: "2026-03-02T00:00:00.000Z",
    endDateEnrollment: "2026-03-09T23:59:59.999Z",
    rewardDate: "2026-03-31T00:00:00.000Z",
    rewardAmount: 75000
  },
  {
    startDate: "2026-04-01T00:00:00.000Z",
    endDate: "2026-04-30T23:59:59.999Z",
    startDateEnrollment: "2026-04-01T00:00:00.000Z",
    endDateEnrollment: "2026-04-08T23:59:59.999Z",
    rewardDate: "2026-04-30T00:00:00.000Z",
    rewardAmount: 75000
  },
  {
    startDate: "2026-05-01T00:00:00.000Z",
    endDate: "2026-06-01T23:59:59.999Z",
    startDateEnrollment: "2026-05-01T00:00:00.000Z",
    endDateEnrollment: "2026-05-08T23:59:59.999Z",
    rewardDate: "2026-06-01T00:00:00.000Z",
    rewardAmount: 175000
  }
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