import React from 'react';

import { useParams } from 'react-router-dom';

import { useEthers } from '@usedapp/core'

import GenericPageContainer from '../containers/GenericPageContainer';
import AccountTokensBannerContainer from '../containers/AccountTokensBannerContainer';

const AccountTokensPage = () => {
    const { account } = useEthers();

    let { 
        accountAddress,
    } = useParams();

    return (
        <>
            <GenericPageContainer
                title="My Tokens"
            >
                {account && !accountAddress &&
                  <AccountTokensBannerContainer maxRecords={20} showPagination={true} account={account} />
                }
                {accountAddress &&
                    <AccountTokensBannerContainer maxRecords={20} showPagination={true} account={accountAddress} />
                }
            </GenericPageContainer>
        </>
    )
};

export default AccountTokensPage;