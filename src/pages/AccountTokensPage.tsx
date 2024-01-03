import React from 'react';

import { useParams } from 'react-router-dom';

import { useAccount } from 'wagmi';

import Typography from '@mui/material/Typography';

import GenericPageContainer from '../containers/GenericPageContainer';
import AccountTokensBannerContainer from '../containers/AccountTokensBannerContainer';
import { Web3ModalButtonWagmi } from '../components/Web3ModalButtonWagmi';

const AccountTokensPage = () => {

    const { address } = useAccount();

    let { 
        accountAddress,
    } = useParams();

    return (
        <>
            <GenericPageContainer
                title={accountAddress ? "Account Assets" : "My Assets"}
            >
                {address && !accountAddress &&
                  <AccountTokensBannerContainer maxRecords={20} showPagination={true} account={address} />
                }
                {accountAddress &&
                    <AccountTokensBannerContainer maxRecords={20} showPagination={true} account={accountAddress} />
                }
                {!accountAddress && !address &&
                    <>
                        <Typography variant="h6" style={{marginBottom: 16, fontWeight: 400}}>
                            Please connect your wallet to view your assets
                        </Typography>
                        <Web3ModalButtonWagmi variant="outlined" overrideConnectText={"Connect Wallet"} darkMode={false} hideNetworkSwitch={true}/>
                    </>
                }
            </GenericPageContainer>
        </>
    )
};

export default AccountTokensPage;