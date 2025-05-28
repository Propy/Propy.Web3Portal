import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import axios from 'axios';
import * as yup from 'yup';
import { Formik, Form, Field } from 'formik';
import { TextField, Select } from 'formik-mui';

import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';

import VerificationIcon from '@mui/icons-material/VerifiedUser';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { toast } from 'sonner';

import { ExternalLink } from './ExternalLink';

import {
  GLOBAL_PAGE_HEIGHT,
  PROPY_LIGHT_BLUE,
  TP_API_ENDPOINT,
  STAKING_V3_KYC_TEMPLATE_ID,
  PROPY_API_ENDPOINT,
} from '../utils/constants';

import { PropsFromRedux } from '../containers/KYCWalletGateContainer';

const KYC_TYPE = 'Staking';

// Verification status enum (matches API)
enum ApprovalStatus {
  NotVerified = "NotVerified",
  PropyIsVerifying = "PropyIsVerifying",
  VerifiedByPropy = "VerifiedByPropy",
  ActionNeeded = "ActionNeeded",
  Rejected = "Rejected",
  NotRequired = "NotRequired"
}

// Screening status enum (matches API)
enum CognitoStatus {
  Active = 'Active',
  Success = 'Success',
  Failed = 'Failed',
  Expired = 'Expired',
  Canceled = 'Canceled',
  PendingReview = 'Pending_review'
}

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
    buttonProgress: {
      marginLeft: theme.spacing(1),
    },
    statusText: {
      marginBottom: theme.spacing(1.5),
    },
    formCard: {
      padding: theme.spacing(3),
      maxWidth: 500,
      width: '100%',
      marginBottom: theme.spacing(2),
    },
    submitButtonContainer: {
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-start',
      // marginTop: theme.spacing(0),
    },
    submitButton: {
      width: '100%',
    },
    formIcon: {
      fontSize: 40,
      marginBottom: theme.spacing(2),
      opacity: 0.7
    },
    helperText: {
      marginLeft: '4px',
      marginRight: '4px',
      fontSize: '0.7rem',
    },
    selectField: {
      width: '100%',
    }
  }),
);

interface IKYCWalletGate {
  children: React.ReactElement,
  termsLink?: string,
  privacyPolicyLink?: string,
}

export const KYCWalletGate = (props: PropsFromRedux & IKYCWalletGate) => {
  const { 
    children,
    termsLink,
    privacyPolicyLink,
  } = props;

  const classes = useStyles();
  
  // References to store interval IDs
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkVerificationStatusRef = useRef<(() => Promise<void>) | null>(null);
  const checkScreeningStatusRef = useRef<(() => Promise<void>) | null>(null);
  const createScreeningRef = useRef<(() => Promise<void>) | null>(null);
  
  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { data: signatureData, isPending: isSignatureLoading, signMessage, reset } = useSignMessage();
  
  // Component states
  const [verificationStatus, setVerificationStatus] = useState<ApprovalStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingScreening, setIsLoadingScreening] = useState<boolean>(true);
  const [flowSignature, setFlowSignature] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [screeningStatus, setScreeningStatus] = useState<CognitoStatus | null>(null);
  const [messageToSign, setMessageToSign] = useState<string | null>(null);
  const [authHeader, setAuthHeader] = useState<string | null>(null);
  const [acceptsTerms, setAcceptsTerms] = useState(false);
  const [confirmFullName, setConfirmFullName] = useState(false);
  const [isUS, setIsUS] = useState<boolean | null>(true);
  // const [showPlaid, setShowPlaid] = useState(false);
  
  // Set message to sign when address changes
  useEffect(() => {
    if (address) {
      setMessageToSign(`Verify KYC for wallet ${address}`);
      
      // Reset states when address changes
      reset();
      setAuthHeader(null);
      setVerificationStatus(null);
      setScreeningStatus(null);
      setFlowSignature(null);
      setIsPolling(false);
      // setShowPlaid(false);
      
      // Clear polling interval if exists
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
    
    // Cleanup function for component unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [address, reset]);
  
  // Update auth header when signature is received
  useEffect(() => {
    if (signatureData && messageToSign) {
      setAuthHeader(`${messageToSign}::${signatureData}`);
    }
  }, [signatureData, messageToSign]);
  
  // Start polling when needed
  useEffect(() => {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // Start new polling if needed
    if (isPolling && authHeader) {
      pollingIntervalRef.current = setInterval(() => {
        if (authHeader) {
          axios.get(`${TP_API_ENDPOINT}/verifications/staking`, {
            headers: { AccountVerification: authHeader }
          })
            .then(response => {
              if (response.data) {
                setVerificationStatus(response.data.approvalStatus);
                
                if (response.data.approvalStatus === ApprovalStatus.VerifiedByPropy) {
                  setIsPolling(false);
                  if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                    pollingIntervalRef.current = null;
                  }
                }
              }
            })
            .catch(error => {
              console.error('Polling error:', error);
              setIsPolling(false);
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }
            });
        }
      }, 5000);
    }
    
    // Cleanup on effect change or unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isPolling, authHeader]);
  
  // Handle user clicking to sign message
  const handleSignMessage = () => {
    if (!address || !messageToSign) return;
    
    try {
      signMessage({ message: messageToSign });
    } catch (error) {
      console.error('Signing error:', error);
      toast.error('Failed to sign verification message');
    }
  };
  
  // Function to check verification status
  const checkVerificationStatus = useCallback(async () => {
    if (!address || !isConnected || !authHeader) return;
    
    try {
      setIsLoading(true);
      
      const response = await axios.get(`${TP_API_ENDPOINT}/verifications/staking`, {
        headers: {
          AccountVerification: authHeader
        }
      });
      
      if (response.data) {
        setVerificationStatus(response.data.approvalStatus);
        
        // If verification is in progress, start polling
        if (response.data.approvalStatus === ApprovalStatus.PropyIsVerifying) {
          setIsPolling(true);
        }
      } else {
        // No verification found, proceed to check screening
        if(checkScreeningStatusRef?.current) {
          await checkScreeningStatusRef.current();
        }
      }
    } catch (error) {
      console.error('Verification check error:', error);
      
      // Handle 400 with "Staking verification not found" - this is expected for new users
      if (axios.isAxiosError(error) && 
          error.response?.status === 400 && 
          (error.response?.data?.exceptionMessage === "Staking verification not found" || 
           error.response?.data?.error === "Staking verification not found")) {
        // This is normal - proceed to check screening status
        if(checkScreeningStatusRef?.current) {
          await checkScreeningStatusRef.current();
        }
        return;
      }

      // Handle 401 - likely need to create or check screening
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        if(checkScreeningStatusRef?.current) {
          await checkScreeningStatusRef.current();
        }
        return;
      }
      
      toast.error('Failed to check verification status');
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, authHeader, setIsLoading, setVerificationStatus, setIsPolling]);
  
  // Function to check screening status
  const checkScreeningStatus = useCallback(async () => {
    if (!address || !isConnected || !authHeader) return;
    
    try {
      setIsLoading(true);
      setIsLoadingScreening(true);
      setIsUS(null);
      
      const response = await axios.post(`${PROPY_API_ENDPOINT}/screenings/retrieve`, 
        { kycTemplateId: STAKING_V3_KYC_TEMPLATE_ID },
        {
          headers: {
            AccountVerification: authHeader
          }
        }
      );
      
      if (response.data) {
        setScreeningStatus(response.data.cognitoStatus);
        if(response.data?.address?.countryCode !== "US") {
          setIsUS(false);
        } else {
          setIsUS(true);
        }
        
        // If screening is successful, we don't immediately check verification
        // Instead, we show the legal name form
        if (response.data.cognitoStatus === CognitoStatus.Success) {
          // Keep the success status and let the user proceed to the legal name step
        } else if (response.data.cognitoStatus === CognitoStatus.Active && response.data.flowSignature) {
          setScreeningStatus(response.data.cognitoStatus);
          setFlowSignature(response.data.flowSignature);
        } else if (response.data.cognitoStatus !== CognitoStatus.PendingReview) {
          // For other statuses (except Success and PendingReview), check verification
          if(checkVerificationStatusRef?.current) {
            await checkVerificationStatusRef.current();
          }
        }
      } else {
        // No screening found, create one
        if(createScreeningRef?.current) {
          await createScreeningRef.current();
        }
      }
    } catch (error) {
      // If error, likely need to create screening
      if(createScreeningRef?.current) {
        await createScreeningRef.current();
      }
    } finally {
      setIsLoading(false);
      setIsLoadingScreening(false);
    }
  }, [address, isConnected, authHeader, setIsLoading]);
  
  // Function to create screening
  const createScreening = useCallback(async () => {
    if (!address || !isConnected || !authHeader) return;
    
    try {
      setIsLoading(true);
      
      const response = await axios.post(`${PROPY_API_ENDPOINT}/screenings`, 
        { 
          kycTemplateId: STAKING_V3_KYC_TEMPLATE_ID,
          kycType: KYC_TYPE
        },
        {
          headers: {
            AccountVerification: authHeader
          }
        }
      );
      
      if (response.data) {
        setScreeningStatus(response.data.cognitoStatus);
        setFlowSignature(response.data.flowSignature);
      }
    } catch (error) {
      console.error('Create screening error:', error);
      toast.error('Failed to create KYC screening');
    } finally {
      setIsLoading(false);
    }
  }, [address, authHeader, isConnected]);

  useEffect(() => {
    checkVerificationStatusRef.current = checkVerificationStatus;
  }, [checkVerificationStatus]);
  
  useEffect(() => {
    checkScreeningStatusRef.current = checkScreeningStatus;
  }, [checkScreeningStatus]);

  useEffect(() => {
    createScreeningRef.current = createScreening;
  }, [createScreening]);

  useEffect(() => {
    console.log({authHeader})
    if(authHeader && checkVerificationStatusRef?.current) {
      checkVerificationStatusRef.current();
    }
  }, [authHeader]);
  
  // Function to submit legal name for successful screening
  const submitLegalName = async (legalName: string, taxResidency: string) => {
    if (!address || !isConnected || !authHeader || !taxResidency) return;
    
    try {
      setIsLoading(true);
      
      const response = await axios.post(`${TP_API_ENDPOINT}/verifications/staking`, 
        { 
          legalName,
          selectedTaxResidency: taxResidency === "US" ? "US" : "NonUS",
        },
        {
          headers: {
            AccountVerification: authHeader
          }
        }
      );
      
      if (response.data) {
        toast.success('Name submitted successfully');
        // Check verification to continue the flow
        await checkVerificationStatus();
      }
    } catch (error) {
      console.error('Legal name submission error:', error);
      toast.error('Failed to submit legal name');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to submit email for pending review screening
  const submitEmail = async (email: string) => {
    if (!address || !isConnected || !authHeader || !email) return;
    
    try {
      setIsLoading(true);
      
      const response = await axios.post(`${TP_API_ENDPOINT}/verifications/staking`, 
        { 
          email,
        },
        {
          headers: {
            AccountVerification: authHeader
          }
        }
      );
      
      if (response.data) {
        toast.success('Email submitted successfully. You will be notified when your verification is complete.');
        // Check verification to continue the flow
        // await checkVerificationStatus();
      }
    } catch (error) {
      console.error('Email submission error:', error);
      toast.error('Failed to submit email');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle Plaid success
  // const handlePlaidSuccess = () => {
  //   toast.success('KYC process completed successfully');
  //   // setShowPlaid(false);
    
  //   // After successful KYC, check verification status
  //   if (authHeader) {
  //     // Add a small delay to make sure the Plaid component has time to unmount
  //     setTimeout(() => {
  //       checkVerificationStatus();
  //     }, 300);
  //   }
  // };
  
  // Handle showing the Plaid Link using vanilla JS
  const handleShowPlaidLink = () => {
    // Make sure we don't have an existing script tag
    const existingScript = document.getElementById('plaid-link-script');
    if (existingScript) {
      existingScript.remove();
    }
    
    if (!flowSignature) {
      toast.error('No flow signature available');
      return;
    }
    
    // Create script tag
    const script = document.createElement('script');
    script.id = 'plaid-link-script';
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;
    
    // When script loads, initialize Plaid
    script.onload = () => {
      try {
        // @ts-ignore
        const handler = window.Plaid.create({
          token: flowSignature,
          onSuccess: (public_token: string, metadata: any) => {
            console.log('Plaid success', metadata);
            
            // Clean up handler
            try {
              if (handler && handler.destroy) {
                handler.destroy();
              }
            } catch (e) {
              console.error('Error destroying handler', e);
            }
            
            // Call our success handler
            toast.success('KYC process completed successfully');
            
            // After successful KYC, check verification status after a delay
            if (authHeader) {
              setTimeout(() => {
                checkVerificationStatus();
              }, 500);
            }
          },
          onExit: (err: any, metadata: any) => {
            console.log('Plaid exit', err, metadata);
            
            // Clean up handler
            try {
              if (handler && handler.destroy) {
                handler.destroy();
              }
            } catch (e) {
              console.error('Error destroying handler', e);
            }
            
            if (err) {
              console.error('Plaid exit error:', err);
              toast.error('KYC process was interrupted');
            }
          },
          onEvent: (eventName: string, metadata: any) => {
            console.log('Plaid event:', eventName, metadata);
          },
        });
        
        // Open the handler immediately
        handler.open();
        
      } catch (error) {
        console.error('Error creating Plaid handler:', error);
        toast.error('Failed to initialize KYC verification');
      }
    };
    
    script.onerror = () => {
      console.error('Failed to load Plaid script');
      toast.error('Failed to load KYC verification');
    };
    
    // Add script to document
    document.body.appendChild(script);
  };
  
  // Handle Plaid exit
  // const handlePlaidExit = () => {
  //   setShowPlaid(false);
  // };
  
  // Render verification status message
  const renderStatusMessage = () => {
    if (isPolling || verificationStatus === ApprovalStatus.PropyIsVerifying) {
      return "Verification in progress. This may take a few minutes. Please wait while we complete your verification...";
    }
    
    if (screeningStatus === CognitoStatus.Failed) {
      return "Your KYC verification failed. Please try again.";
    }
    
    if (screeningStatus === CognitoStatus.Expired) {
      return "Your KYC verification has expired. Please complete the process again.";
    }
    
    if (screeningStatus === CognitoStatus.Canceled) {
      return "Your KYC verification was canceled. Please try again.";
    }
    
    if (screeningStatus === CognitoStatus.PendingReview) {
      return "Your KYC verification is pending review. Please check back later.";
    }
    
    if (!authHeader) {
      return "Please sign the message to begin the KYC verification process.";
    }
    
    return "You need to complete KYC verification to proceed. Please click the button below to start.";
  };

  const renderTitleMessage = () => {
    if (isPolling || verificationStatus === ApprovalStatus.PropyIsVerifying) {
      return "Awaiting KYC Verification";
    }
    
    // if (screeningStatus === CognitoStatus.Failed) {
    //   return "Your KYC verification failed. Please try again.";
    // }
    
    // if (screeningStatus === CognitoStatus.Expired) {
    //   return "Your KYC verification has expired. Please complete the process again.";
    // }
    
    // if (screeningStatus === CognitoStatus.Canceled) {
    //   return "Your KYC verification was canceled. Please try again.";
    // }
    
    // if (screeningStatus === CognitoStatus.PendingReview) {
    //   return "Your KYC verification is pending review. Please check back later.";
    // }
    
    // if (!authHeader) {
    //   return "Please sign the message to begin the KYC verification process.";
    // }
    
    return "KYC Verification Required";
  };
  
  // Render legal name form when screening is successful
  const renderLegalNameForm = () => {
    // Validation schema for legal name
    const nameValidationSchema = yup.object().shape({
      legalName: yup.string()
        .min(2, 'Name is too short')
        .max(50, 'Name is too long')
        .required('Full legal name is required')
    });
    
    return (
      <div className={classes.root} style={{minHeight: GLOBAL_PAGE_HEIGHT, width: '100%'}}>
        <Card className={classes.formCard}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
            <PersonIcon className={classes.formIcon} color="primary" />
            
            {(!isLoadingScreening && isUS !== null) &&
              <Formik
                initialValues={{ legalName: '', taxResidency: isUS ? 'US' : 'Non-US'}}
                validationSchema={nameValidationSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    await submitLegalName(values.legalName, values.taxResidency);
                  } catch (error) {
                    console.error('Form submission error:', error);
                    toast.error('Failed to submit name');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ submitForm, isSubmitting, handleChange, values }) => (
                  <Form style={{ width: '100%' }}>
                    <Typography variant="h5" className={classes.title} align="center">
                      {`${values?.taxResidency === 'US' ? 'W-9' : 'W-8 BEN'} Consent & Form Generation`}
                    </Typography>
                    <Typography variant="body1" className={classes.sectionSpacerSmall} align="center">
                      Please provide your full legal name & country of tax residency to complete the verification process.
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Field
                          component={Select}
                          fullWidth
                          id="tax-residency"
                          name="taxResidency"
                          labelId="tax-residency-select"
                          label="Country of Tax Residency"
                          formControl={{ sx: {width: '100%'} }}
                        >
                          <MenuItem value={'US'}>US</MenuItem>
                          <MenuItem value={'Non-US'}>Non-US</MenuItem>
                        </Field>
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          component={TextField}
                          fullWidth
                          required
                          name="legalName"
                          type="text"
                          label="Full Legal Name"
                          helperText="Signature of beneficial owner (or individual authorized to sign for beneficial owner)"
                          FormHelperTextProps={{
                            className: classes.helperText
                          }}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            handleChange(event);
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                          <div style={{padding: '8px', maxHeight: '200px', overflowY: 'scroll', backgroundColor: '#ececec', borderRadius: '12px', border: '1px solid #c4c4c4'}}>
                            {
                              values?.taxResidency === 'US'
                              ?
                                <>
                                  <Typography variant="caption" style={{display: 'block', marginBottom: '12px'}}>
                                    Request for Taxpayer Identification Number and Certification (Individuals)
                                  </Typography>
                                  <Typography variant="caption" style={{display: 'block'}}>
                                    Part I. Certification<br/>
                                    Under penalties of perjury, I certify that:
                                    <ol>
                                      <li>
                                        The number shown on this form is my correct taxpayer identification number (or I am waiting for a number to be issued to me); and
                                      </li>
                                      <li>
                                        I am not subject to backup withholding because (a) I am exempt from backup withholding, or (b) I have not been notified by the Internal Revenue Service (IRS) that I am subject to backup withholding as a result of a failure to report all interest or dividends, or (c) the IRS has notified me that I am no longer subject to backup withholding; and
                                      </li>
                                      <li>
                                        I am a U.S. citizen or other U.S. person (defined below).
                                      </li>
                                    </ol>
                                  </Typography>
                                  <Typography variant="caption" style={{display: 'block', marginBottom: '12px'}}>
                                    Furthermore, I authorize <ExternalLink className="no-decorate" style={{color: PROPY_LIGHT_BLUE}} href={"https://www.irs.gov/pub/irs-pdf/fw9.pdf"}>this form</ExternalLink> to be provided to any withholding agent that has control, receipt, or custody of the income of which I am the beneficial owner or any withholding agent that can disburse or make payments of the income of which I am the beneficial owner. I agree that I will submit a new form within 30 days if any certification made on <ExternalLink className="no-decorate" style={{color: PROPY_LIGHT_BLUE}} href={"https://www.irs.gov/pub/irs-pdf/fw9.pdf"}>this form</ExternalLink> becomes incorrect.
                                  </Typography>
                                  <Typography variant="caption" style={{display: 'block'}}>
                                    The Internal Revenue Service does not require your consent to any provisions of this document other than the certifications required to establish your status as a U.S. person and, if applicable, obtain a reduced rate of withholding.
                                  </Typography>
                                </>
                              : 
                                <>
                                  <Typography variant="caption" style={{display: 'block', marginBottom: '12px'}}>
                                    Certificate of Foreign Status of Beneficial Owner for United States Tax Withholding and Reporting (Individuals)
                                  </Typography>
                                  <Typography variant="caption" style={{display: 'block', marginBottom: '12px'}}>
                                    {values?.legalName ? values?.legalName : "{Name}"}<br/>
                                    Country of residence as declared
                                  </Typography>
                                  <Typography variant="caption" style={{display: 'block'}}>
                                    Part I. Certification<br/>
                                    Under penalties of perjury, I declare that I have examined the information on <ExternalLink className="no-decorate" style={{color: PROPY_LIGHT_BLUE}} href={"https://www.irs.gov/forms-pubs/about-form-w-8-ben"}>this form</ExternalLink> and to the best of my knowledge and belief it is true, correct, and complete. I further certify under penalties of perjury that:
                                    <ol>
                                      <li>
                                        I am the individual that is the beneficial owner (or am authorized to sign for the individual that is the beneficial owner) of all the income to which <ExternalLink className="no-decorate" style={{color: PROPY_LIGHT_BLUE}} href={"https://www.irs.gov/forms-pubs/about-form-w-8-ben"}>this form</ExternalLink> relates or am using <ExternalLink className="no-decorate" style={{color: PROPY_LIGHT_BLUE}} href={"https://www.irs.gov/forms-pubs/about-form-w-8-ben"}>this form</ExternalLink> to document myself for chapter 4 purposes,
                                      </li>
                                      <li>
                                        The person named above is not a U.S. person,
                                      </li>
                                      <li>
                                        The income to which <ExternalLink className="no-decorate" style={{color: PROPY_LIGHT_BLUE}} href={"https://www.irs.gov/forms-pubs/about-form-w-8-ben"}>this form</ExternalLink> relates is: (a) not effectively connected with the conduct of a trade or business in the United States, (b) effectively connected but is not subject to tax under an applicable income tax treaty, or (c) the partner's share of a partnership's effectively connected income,
                                      </li>
                                      <li>
                                        The person named above is a resident of the treaty country listed above within the meaning of the income tax treaty between the United States and that country, and
                                      </li>
                                      <li>
                                        For broker transactions or barter exchanges, the beneficial owner is an exempt foreign person as defined in the instructions.
                                      </li>
                                    </ol>
                                  </Typography>
                                  <Typography variant="caption" style={{display: 'block', marginBottom: '12px'}}>
                                    Furthermore, I authorize <ExternalLink className="no-decorate" style={{color: PROPY_LIGHT_BLUE}} href={"https://www.irs.gov/forms-pubs/about-form-w-8-ben"}>this form</ExternalLink> to be provided to any withholding agent that has control, receipt, or custody of the income of which I am the beneficial owner or any withholding agent that can disburse or make payments of the income of which I am the beneficial owner. I agree that I will submit a new form within 30 days if any certification made on <ExternalLink className="no-decorate" style={{color: PROPY_LIGHT_BLUE}} href={"https://www.irs.gov/forms-pubs/about-form-w-8-ben"}>this form</ExternalLink> becomes incorrect.
                                  </Typography>
                                  <Typography variant="caption" style={{display: 'block'}}>
                                    The Internal Revenue Service does not require your consent to any provisions of this document other than the certifications required to establish your status as a non-U.S. individual and, if applicable, obtain a reduced rate of withholding.
                                  </Typography>
                                </>
                            }
                          </div>
                      </Grid>
                      <Grid item xs={12}>
                        <FormGroup>
                          <FormControlLabel
                            componentsProps={{ typography: { variant: 'body2' } }}
                            control={
                              <Checkbox
                                checked={confirmFullName}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                  setConfirmFullName(event.target.checked);
                                }}
                                inputProps={{ 'aria-label': 'controlled' }}
                              />
                            } 
                            label={
                              <>
                                I agree to the terms above. I have provided my full legal name & correct country of tax residency.<span style={{color: 'red'}}> *</span>
                              </>
                            }
                          />
                        </FormGroup>
                      </Grid>
                      <Grid item xs={12}>
                        <div className={classes.submitButtonContainer}>
                          <Button
                            className={classes.submitButton}
                            disabled={isSubmitting || !confirmFullName}
                            onClick={submitForm}
                            variant="contained"
                            sx={{
                              color: 'white',
                            }}
                            color="primary"
                          >
                            Submit
                            {isSubmitting && <CircularProgress size={24} className={classes.buttonProgress} />}
                          </Button>
                        </div>
                      </Grid>
                    </Grid>
                  </Form>
                )}
              </Formik>
            }
          </div>
        </Card>
      </div>
    );
  };
  
  // Render email form when screening is pending review
  const renderEmailForm = () => {
    // Validation schema for email
    const emailValidationSchema = yup.object().shape({
      email: yup.string()
        .email('Invalid email address')
        .required('Email is required')
    });
    
    return (
      <div className={classes.root} style={{minHeight: GLOBAL_PAGE_HEIGHT, width: '100%'}}>
        <Card className={classes.formCard}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
            <EmailIcon className={classes.formIcon} color="primary" />
            <Typography variant="h5" className={classes.title} align="center">
              KYC Verification Pending
            </Typography>
            <Typography variant="body1" className={classes.sectionSpacerSmall} align="center">
              Your KYC verification is being reviewed. Please provide your email to receive updates about your verification status.
            </Typography>
            
            <Formik
              initialValues={{ email: '' }}
              validationSchema={emailValidationSchema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                try {
                  await submitEmail(values.email);
                  resetForm();
                } catch (error) {
                  console.error('Form submission error:', error);
                  toast.error('Failed to submit email');
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ submitForm, isSubmitting, handleChange }) => (
                <Form style={{ width: '100%' }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Field
                        component={TextField}
                        fullWidth
                        required
                        name="email"
                        type="email"
                        label="Email Address"
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                          handleChange(event);
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <div className={classes.submitButtonContainer}>
                        <Button
                          className={classes.submitButton}
                          disabled={isSubmitting}
                          onClick={submitForm}
                          variant="contained"
                          sx={{
                            color: 'white',
                          }}
                          color="primary"
                        >
                          Submit
                          {isSubmitting && <CircularProgress size={24} className={classes.buttonProgress} />}
                        </Button>
                      </div>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </div>
        </Card>
      </div>
    );
  };
  
  // If loading signature, show loading
  if (isSignatureLoading) {
    return (
      <div className={classes.root} style={{minHeight: GLOBAL_PAGE_HEIGHT, width: '100%'}}>
        <CircularProgress size={60} className={classes.sectionSpacer} />
        <Typography variant="h5" className={classes.title}>
          Waiting for signature...
        </Typography>
      </div>
    );
  }
  
  // If loading verification, show loading
  if (isLoading) {
    return (
      <div className={classes.root} style={{minHeight: GLOBAL_PAGE_HEIGHT, width: '100%'}}>
        <CircularProgress size={60} className={classes.sectionSpacer} />
        <Typography variant="h5" className={classes.title}>
          Checking verification status
        </Typography>
      </div>
    );
  }
  
  // Verified, render children
  if (verificationStatus === ApprovalStatus.VerifiedByPropy) {
    return <>{children}</>;
  }
  
  // If screening is successful, show legal name form
  if ((screeningStatus === CognitoStatus.Success) && (verificationStatus !== ApprovalStatus.PropyIsVerifying)) {
    return renderLegalNameForm();
  }
  
  // If screening is pending review, show email form
  if (screeningStatus === CognitoStatus.PendingReview) {
    return renderEmailForm();
  }
  
  return (
    <div className={classes.root} style={{minHeight: GLOBAL_PAGE_HEIGHT, width: '100%'}}>
      <VerificationIcon className={classes.mainGraphic} />
      
      <Typography variant="h4" style={{textAlign: 'center'}} className={classes.title}>
        {renderTitleMessage()}
      </Typography>
      
      <Typography style={{textAlign: 'center', marginBottom: termsLink ? '12px' : '16px'}} variant="h6" className={["secondary-text-light-mode", "light-text"].join(" ")}>
        {renderStatusMessage()}
      </Typography>
      
      {/* Step 1: Sign Message (only show if no auth header yet) */}
      {!authHeader && (
        <>
          {termsLink &&
            <FormGroup>
              <FormControlLabel
                style={{marginBottom: '16px'}}
                componentsProps={{ typography: { variant: 'body2' } }}
                control={
                  <Checkbox
                    checked={acceptsTerms}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setAcceptsTerms(event.target.checked);
                    }}
                    inputProps={{ 'aria-label': 'controlled' }}
                  />
                } 
                label={
                  <>
                    I agree to the <ExternalLink className="no-decorate" style={{color: PROPY_LIGHT_BLUE}} href={termsLink}>terms of service</ExternalLink>{privacyPolicyLink ? ` and ` : ``}{privacyPolicyLink && <ExternalLink className="no-decorate" style={{color: PROPY_LIGHT_BLUE}} href={privacyPolicyLink}>privacy policy</ExternalLink>}<span style={{color: 'red'}}> *</span>
                  </>
                }
              />
            </FormGroup>
          }
          <Button 
            variant="contained"
            sx={{
              color: 'white',
            }}
            color="primary"
            disabled={!address || isSignatureLoading || !acceptsTerms}
            onClick={handleSignMessage}
          >
            Sign Verification Message
            {isSignatureLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
          </Button>
        </>
      )}

      {/* {`verificationStatus: ${verificationStatus}, ${verificationStatus === ApprovalStatus.PropyIsVerifying}, authHeader: ${authHeader}`} */}
      
      {/* Step 2: Start KYC Process (only show if auth header exists but not verified) */}
      {authHeader && !isPolling && verificationStatus !== ApprovalStatus.PropyIsVerifying && (
        <>
          {!screeningStatus && (
            <Button 
              variant="contained" 
              sx={{
                color: 'white',
              }}
              color="primary" 
              onClick={checkVerificationStatus}
              disabled={isLoading}
            >
              Check Verification Status
              {isLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
            </Button>
          )}
          
          {/* Show KYC button for certain screening statuses */}
          {screeningStatus && 
           !flowSignature && 
           [CognitoStatus.Active, CognitoStatus.Failed, CognitoStatus.Expired, CognitoStatus.Canceled].includes(screeningStatus) && (
            <Button 
              variant="contained" 
              sx={{
                color: 'white',
              }}
              color="primary" 
              onClick={createScreening}
              disabled={isLoading}
            >
              Start KYC Verification
              {isLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
            </Button>
          )}
          
          {/* Button to show Plaid (only if we have a flow signature) */}
          {flowSignature && (
            <Button 
              variant="contained" 
              sx={{
                color: 'white',
              }}
              color="primary" 
              onClick={handleShowPlaidLink}
              disabled={isLoading}
            >
              Start KYC Process
              {isLoading && <CircularProgress size={24} className={classes.buttonProgress} />}
            </Button>
          )}
        </>
      )}
      
      {/* Show loading indicator if polling or verification in progress */}
      {(isPolling || verificationStatus === ApprovalStatus.PropyIsVerifying) && (
        <CircularProgress size={24} className={classes.sectionSpacerSmall} />
      )}
    </div>
  );
};