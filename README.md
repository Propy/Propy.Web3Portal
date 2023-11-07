# Propy dApp Frontend

Welcome to Propy dApp, a window into all of Propy's on-chain activity. This dApp frontend can be used to view all of Propy's on-chain assets, link users to active governance proposals, DEX liquidity management as well as to connect your wallet via MetaMask or your preferred wallet application in order to view your own balances of Propy assets (from PRO to Propy-issued NFTs).

This repository works in tandem with the [Propy dApp backend](https://github.com/Propy/Propy.Web3Portal.Backend), both the frontend and backend have been constructed to be easily self-hosted, in alignment with the web3 ethos.

## IPFS-ready

This repository has been constructed to be easily deployable to [IPFS](https://ipfs.io/), running a `yarn build` and uploading the build folder to IPFS will result in a ready-to-use IPFS deployment without needing to make any further adjustments (e.g. hash routing & package.json config).

## Getting started

First off, it's important to rename `.env.example` to `.env` and add your Infura or Alchemy API key to this file (also remove the example entry that won't be used), this will enable the Propy DApp to work in read-only mode (i.e. before a user connects their wallet provider).

## Scripts

### `yarn`

Installs required packages

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `yarn build`

Runs a build to generate production-ready code which can easily be hosted via any static storage provider (e.g. AWS S3 or IPFS).