import React, { useState } from 'react'

import {
  useGoogleReCaptcha
} from 'react-google-recaptcha-v3';

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-mui';

import { toast } from 'sonner';

import * as yup from 'yup';

import { PropsFromRedux } from '../containers/PropyKeysHomeListingContactFormContainer';

import { PROPYKEYS_API_ENDPOINT } from '../utils/constants';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    contactFormCard: {
      padding: theme.spacing(2)
    },
    disabledActionArea: {
      opacity: 0.5,
      pointerEvents: 'none',
    },
    subtleDisabledActionArea: {
      pointerEvents: 'none',
    },
    submitButtonContainer: {
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-start',
    },
    submitButton: {
      width: '100%',
    },
    titleSpacer: {
      marginBottom: theme.spacing(2),
    }
  }),
);

interface ContactData {
  Name: string;
  Message: string;
  ReplyTo: string;
  TokenId: number;
}

async function sendContactRequest(data: ContactData, captchaCode: string): Promise<Response> {
  const url = `${PROPYKEYS_API_ENDPOINT}/Listings/contact`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'captcha-code': captchaCode,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
}

const recaptchaActionKey = 'dapp_propykeys_home_listing_contact_form_submission';

interface IPropyKeysHomeListingContactFormProps {
  tokenId: string | number
}

const PropyKeysHomeListingContactForm = (props: IPropyKeysHomeListingContactFormProps & PropsFromRedux) => {

  const {
    tokenId,
  } = props;

  const classes = useStyles();

  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);

  const { executeRecaptcha } = useGoogleReCaptcha();

  const ValidationSchema = yup.object().shape({
    name: yup.string()
      .min(2, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Required'),
    message: yup.string()
      .min(2, 'Too Short!')
      .max(300, 'Too Long!')
      .required('Required'),
    replyTo: yup.string().email('Invalid email').required('Required'),
    hiddenField: yup.string().test('hiddenField', 'hiddenField', function (value) { setHasTriedSubmit(true); return true }),
  });

  return (
    <Card 
      className={
        [
          // disabled ? classes.disabledActionArea : "",
          classes.contactFormCard
        ].join(" ")
      }
      style={{
      width: '100%',
    }}>
        <Typography variant="h6" className={classes.titleSpacer}>
          Contact Home Owner
        </Typography>
        <Formik
        validateOnChange={hasTriedSubmit}
        validateOnBlur={hasTriedSubmit}
        initialValues={{
          name: '',
          message: '',
          replyTo: '',
          hiddenField: "hidden",
        }}
        validationSchema={ValidationSchema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          try {
            if(executeRecaptcha) {
              setSubmitting(true);
              const token = await executeRecaptcha(recaptchaActionKey);
              const contactData = {
                Name: values.name,
                Message: values.message,
                ReplyTo: values.replyTo,
                TokenId: Number(tokenId),
              }
              await sendContactRequest(contactData, token)
              .then(response => response.json())
              .then(() => {toast.success("Contact form successfully submitted");resetForm()})
              .catch(error => toast.error(`Unable to submit contact form, please try again or contract support. Error message: ${error}`));
            } else {
              toast.error("Recaptcha not available, please refresh the page");
            }
            setSubmitting(false);
          } catch(e) {
            console.log({e})
            setSubmitting(false);
            toast.error("Unable to submit contact form, please try again or contract support");
          }
        }}
      >
        {({ submitForm, isSubmitting, handleChange }) => (
          <Form>
            <Grid className={isSubmitting ? classes.disabledActionArea : ""} container spacing={3}>
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <Field
                  component={TextField}
                  fullWidth
                  required
                  name="name"
                  type="text"
                  label="Name"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    handleChange(event)
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <Field
                  component={TextField}
                  multiline
                  rows={4}
                  fullWidth
                  required
                  name="message"
                  type="text"
                  label="Message"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    handleChange(event)
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <Field
                  component={TextField}
                  rows={2}
                  fullWidth
                  required
                  name="replyTo"
                  type="text"
                  label="Email Address"
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
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <div className={classes.submitButtonContainer}>
                  <Button
                    className={classes.submitButton}
                    disabled={isSubmitting}
                    onClick={submitForm}
                    variant="contained"
                    color="secondary"
                  >
                    Submit
                  </Button>
                </div>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Card>
  )
}

export default PropyKeysHomeListingContactForm;