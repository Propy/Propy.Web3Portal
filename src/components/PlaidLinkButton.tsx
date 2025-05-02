import React from 'react';
import { PlaidLink } from 'react-plaid-link';
import Button from '@mui/material/Button';

interface PlaidLinkButtonProps {
  token: string;
  onSuccess: () => void;
  onExit: () => void;
}

// Using the PlaidLink component directly instead of the hook
const PlaidLinkButton = ({ token, onSuccess, onExit }: PlaidLinkButtonProps) => {
  return (
    <PlaidLink
      token={token}
      onSuccess={(public_token, metadata) => {
        console.log('Success!', metadata);
        onSuccess();
      }}
      onExit={(err, metadata) => {
        if (err) console.error('Exit error:', err);
        onExit();
      }}
      onEvent={(eventName, metadata) => {
        console.log('Event:', eventName, metadata);
      }}
      // This component will render a button that when clicked will open Plaid
    >
      <Button 
        variant="contained" 
        color="primary"
        style={{ display: 'none' }} // Hide the button visually
        id="plaid-hidden-button"
      >
        Connect Bank Account
      </Button>
    </PlaidLink>
  );
};

export default PlaidLinkButton;