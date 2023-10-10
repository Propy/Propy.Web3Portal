import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Typography from '@mui/material/Typography';
import Check from '@mui/icons-material/Check';

import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

import { ITokenMetadataTimelineEntry } from '../interfaces';

// import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';

import { styled } from '@mui/material/styles';
import { StepIconProps } from '@mui/material/StepIcon';

import { PROPY_LIGHT_BLUE } from '../utils/constants';

dayjs.extend(advancedFormat);

// const QontoConnector = styled(StepConnector)(({ theme }) => ({
//   [`&.${stepConnectorClasses.alternativeLabel}`]: {
//     top: 10,
//     left: 'calc(-50% + 16px)',
//     right: 'calc(50% + 16px)',
//   },
//   [`&.${stepConnectorClasses.active}`]: {
//     [`& .${stepConnectorClasses.line}`]: {
//       borderColor: '#784af4',
//     },
//   },
//   [`&.${stepConnectorClasses.completed}`]: {
//     [`& .${stepConnectorClasses.line}`]: {
//       borderColor: '#784af4',
//     },
//   },
//   [`& .${stepConnectorClasses.line}`]: {
//     borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
//     borderTopWidth: 3,
//     borderRadius: 1,
//   },
// }));

const QontoStepIconRoot = styled('div')<{ ownerState: { active?: boolean } }>(
  ({ theme, ownerState }) => ({
    color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#bdbdbd',
    display: 'flex',
    height: 22,
    marginLeft: 8,
    alignItems: 'center',
    ...(ownerState.active && {
    //   color: PROPY_LIGHT_BLUE,
    }),
    '& .QontoStepIcon-completedIcon': {
      color: PROPY_LIGHT_BLUE,
      zIndex: 1,
      fontSize: 18,
    },
    '& .QontoStepIcon-circle': {
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: 'currentColor',
    },
  }),
);

function QontoStepIcon(props: StepIconProps) {
  const { active, completed, className } = props;

  return (
    <QontoStepIconRoot ownerState={{ active }} className={className}>
      {completed ? (
        <Check className="QontoStepIcon-completedIcon" />
      ) : (
        <div className="QontoStepIcon-circle" />
      )}
    </QontoStepIconRoot>
  );
}

interface ITokenMetadataTimeline {
  timeline: ITokenMetadataTimelineEntry[]
}

export default function VerticalLinearStepper(props: ITokenMetadataTimeline) {

  let {
    timeline,
  } = props;

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    setActiveStep(0);
  }, [timeline])

  return (
    <Box sx={{ maxWidth: 400 }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {timeline.map((timelineEntry, index) => (
          <Step key={timelineEntry.milestone} expanded={true} completed={timelineEntry.complete}>
            <StepLabel StepIconComponent={QontoStepIcon} sx={{
              '& .MuiStepLabel-labelContainer': {
                color: "#212121"
              }
            }}>
              <Typography variant="subtitle1">{timelineEntry.milestone}</Typography>
            </StepLabel>
            <StepContent>
              {timelineEntry.due_date && <Typography variant="subtitle2">{timelineEntry.milestone === "Transaction created" ? "At" : "By"} {dayjs.unix(Number(timelineEntry.due_date)).format('MMM-D-YYYY hh:mm A')}</Typography>}
              {!timelineEntry.due_date && <Typography variant="subtitle2">Date estimation pending</Typography>}
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
