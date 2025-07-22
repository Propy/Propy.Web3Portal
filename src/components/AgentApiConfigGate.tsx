import React from 'react';

import { animated, useSpring } from '@react-spring/web'

import { toast } from 'sonner';

import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';

import HelpIcon from '@mui/icons-material/Help';

import * as yup from 'yup';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-mui';

import ApiIcon from '@mui/icons-material/Key';

import {
  GLOBAL_PAGE_HEIGHT,
} from '../utils/constants';

import { PropsFromRedux } from '../containers/AgentApiConfigGateContainer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column'
    },
    title: {
      fontWeight: '500',
      marginBottom: theme.spacing(1),
      // color: 'white',
    },
    sectionSpacer: {
      marginBottom: theme.spacing(4),
    },
    sectionSpacerSmall: {
      marginBottom: theme.spacing(2),
    },
    mainGraphic: {
      width: 250,
      height: 250,
      opacity: 0.15
    },
  }),
);

interface IAgentApiConfigGate {
  children: React.ReactElement,
}

export const AgentApiKeyGate = (props: PropsFromRedux & IAgentApiConfigGate) => {

  let {
    children,
    agentApiConfig,
    setAgentApiConfig,
  } = props;

  const classes = useStyles();

  const addConfigSpring = useSpring({
    from: {
      opacity: 0,
      transform: 'rotate(-22deg)',
    },
    to: {
      opacity: (!agentApiConfig?.key || !agentApiConfig?.provider) ? 1 : 0,
      transform: (!agentApiConfig?.key || !agentApiConfig?.provider) ? 'rotate(0deg)' : 'rotate(-22deg)',
    },
  })

  const validationSchema = yup.object().shape({
    apiKeyOpenAI: yup.string()
    .required('API key is required')
    .matches(
      /^sk-[A-Za-z0-9_-]/,
      'API key appears to be invalid.'
    )
    .min(40)
  });

  return (
    <>
      {(!agentApiConfig?.key || !agentApiConfig?.provider) &&
        <div className={classes.root} style={{minHeight: GLOBAL_PAGE_HEIGHT, width: '100%'}}>
          <animated.div className={classes.sectionSpacer} style={addConfigSpring}>
            <ApiIcon className={classes.mainGraphic} />
          </animated.div>
          <Typography variant="h4" style={{textAlign: 'center'}} className={classes.title}>
            Provide API Key
          </Typography>
          <Typography style={{textAlign: 'center', display: 'flex', alignItems: 'center'}} variant="h6" className={[classes.sectionSpacerSmall, "secondary-text-light-mode", "light-text"].join(" ")}>
            Please provide your OpenAI API Key in order to use the Web3 Agent
            <Tooltip placement="top" title={`Propy's Web3 Agent runs directly in your browser, this means that you can leverage the Propy Web3 Agent without granting any third-party access to your Web3 wallet. In order to do this, you need to use your own OpenAI API Key to interact with your Web3 connection. In short, this keeps things more decentralized and secure.`}>
              <HelpIcon className={'tooltip-helper-icon'} />
            </Tooltip>
          </Typography>
          <Formik
            initialValues={{ apiKeyOpenAI: '' }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              console.log({values})
              try {
                setAgentApiConfig({
                  provider: "OpenAI",
                  key: values.apiKeyOpenAI
                });
              } catch (error) {
                console.error('Form submission error:', error);
                toast.error('Failed to submit Open AI API Key');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ submitForm, isSubmitting, handleChange, values }) => (
              <Form style={{ width: '100%', maxWidth: '400px' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Field
                      component={TextField}
                      fullWidth
                      required
                      name="apiKeyOpenAI"
                      type="text"
                      label="Open AI API Key"
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        handleChange(event);
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} style={{display: 'flex', justifyContent: 'center'}}>
                    <Button disabled={isSubmitting} variant={'outlined'} color={"primary"} onClick={() => submitForm()}>{"Save API Key"}</Button>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </div>
      }
      {(agentApiConfig?.key && agentApiConfig?.provider) &&
        <>
          {children}
        </>
      }
    </>
  )
}