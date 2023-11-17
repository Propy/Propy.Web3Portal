import React, { useState } from 'react';

import { useEthers, useSigner } from '@usedapp/core';

import { toast } from 'sonner';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';

import { utils } from "ethers";

import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-mui';

import * as yup from 'yup';

import Typography from '@mui/material/Typography';

import { Web3ModalButton } from './Web3ModalButton';
import FloatingActionButton from './FloatingActionButton';

import { PropsFromRedux } from '../containers/SignalInterestContainer';

import {
  ISignMessageError,
  INonceResponse,
} from '../interfaces';

import {
  SignerService,
} from '../services/api';

import {
  constructSignerMessage,
} from '../utils'

import {
  PRO_TOKEN_ADDRESS,
  PRO_TOKEN_DECIMALS
} from '../utils/constants';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    dialogRoot: {
      margin: theme.spacing(2),
    },
    dialogSpacer: {
      marginBottom: theme.spacing(1),
    },
    submitButtonContainer: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-end',
    },
    submitButton: {
      width: '100%',
    },
    formInfo: {
      marginBottom: theme.spacing(2),
    },
  }),
);

interface ISignalInterest {
  title?: string,
  tokenAddress: string,
  tokenId: string,
  tokenNetwork: string,
}

const SignalInterest = (props: PropsFromRedux & ISignalInterest) => {

  const classes = useStyles();

  const { account } = useEthers();

  const signer = useSigner();

  const [showDialog, setShowDialog] = useState(false);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);

  const {
    darkMode,
    tokenAddress,
    tokenId,
    tokenNetwork,
  } = props;

  const signOfferMessage = async (proAmount: string) => {
    if(signer && account) {
      let signerAccount = account;
      let nonceResponse : INonceResponse = await SignerService.getSignerNonce(account);
      let {
        data,
      } = nonceResponse;
      if(data && tokenAddress && tokenId) {
        let {
          nonce,
          salt,
        } = data;
        let messageForSigning = constructSignerMessage(
          signerAccount,
          nonce,
          salt,
          "make_offchain_offer",
          {
            token_address: tokenAddress,
            token_id: tokenId,
            token_network: tokenNetwork,
            offer_token_address: PRO_TOKEN_ADDRESS,
            offer_token_amount: utils.parseUnits(proAmount.toString(), PRO_TOKEN_DECIMALS).toString()
          }
        );
        if(messageForSigning) {
          let signedMessage = await signer.signMessage(messageForSigning).catch((e: any | ISignMessageError) => toast.error(e?.message ? e?.message : "Unable to sign offer message"));
          console.log({signedMessage, messageForSigning})
          if(typeof signedMessage === "string") {
            let triggerSignedMessageActionResponse = await SignerService.validateSignedMessageAndPerformAction(messageForSigning, signedMessage, signerAccount);
            console.log({triggerSignedMessageActionResponse});
            if(triggerSignedMessageActionResponse.status) {
              toast.success("Offer placed successfully!");
              setShowDialog(false);
            }
          }
        } else {
          toast.error("Unable to generate message for signing");
        }
      } else {
        toast.error("Unable to fetch account nonce");
      }
    }
  }

  const ValidationSchema = yup.object().shape({
    proAmount: yup.number()
      .required('Required'),
    hiddenField: yup.string().test('hiddenField', 'hiddenField', function (value) { setHasTriedSubmit(true); return true }),
  });

  return (
    <div className={classes.root}>
        {!account && 
          <Web3ModalButton variant="contained" color="secondary" darkMode={darkMode} overrideConnectText="Connect wallet" hideNetworkSwitch={true} />
        }
        {account &&
          <Button variant="contained" color="secondary" onClick={() => setShowDialog(true)}>Make an Offer</Button>
        }
        <Dialog onClose={() => setShowDialog(false)} open={showDialog}>
          <div className={classes.dialogRoot}>
            <Typography variant="h6" className={classes.dialogSpacer}>Make an Offer</Typography>
            {/* <Grid item xs={12} sm={12} md={12} lg={12}> */}
                <Typography className={classes.formInfo} variant="body1" component="div">
                  Signal your interest in this token so that we can inform you once our marketplace is live. Offers placed are non-binding and simply show the token owner that there is interest in their token.
                </Typography>
              {/* </Grid> */}
            <Formik
        validateOnChange={hasTriedSubmit}
        validateOnBlur={hasTriedSubmit}
        initialValues={{
          proAmount: "",
          hiddenField: "hidden",
        }}
        validationSchema={ValidationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            signOfferMessage(values.proAmount);
          } catch(e) {
            console.log({e})
            setSubmitting(false);
            toast.error("Unable to save progress, please try again or contract support");
            // TODO handle errors
          }
        }}
      >
        {({ submitForm, isSubmitting, handleChange, setFieldValue, errors }) => (
          <Form>
            <Grid container spacing={0}>
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <Field
                  component={TextField}
                  fullWidth
                  required
                  name="proAmount"
                  type="number"
                  label="PRO Amount"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    handleChange(event)
                  }}
                />
              </Grid>
              <div style={{display: 'none'}}>
                <Field
                  component={TextField}
                  name="hiddenField"
                  type="text"
                  label="hidden"
                />
              </div>
              {/* <Grid item xs={12} sm={12} md={12} lg={12}>
                <Typography className={classes.formInfo} variant="h6" component="div">
                  Your information is stored securely and never used to send spam. By completing this form you agree to our <ExternalLink href="https://propy.com/browse/terms-and-conditions/">Terms of Service</ExternalLink>.
                </Typography>
              </Grid> */}
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <div className={classes.submitButtonContainer}>
                  <FloatingActionButton
                    className={classes.submitButton}
                    buttonColor="secondary"
                    disabled={isSubmitting}
                    onClick={submitForm}
                    text="Create Offer"
                  />
                </div>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
            {/* <Button variant="contained" color="secondary" onClick={() => signOfferMessage()}>Create an Offer</Button> */}
          </div>
        </Dialog>
    </div>
  )
}

export default SignalInterest;