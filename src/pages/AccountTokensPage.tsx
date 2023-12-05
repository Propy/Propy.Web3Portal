import React from 'react';

import { useParams } from 'react-router-dom';

import { useAccount } from 'wagmi';

import GenericPageContainer from '../containers/GenericPageContainer';
import AccountTokensBannerContainer from '../containers/AccountTokensBannerContainer';

const AccountTokensPage = () => {

    const { address } = useAccount();

    let { 
        accountAddress,
    } = useParams();

    return (
        <>
            <GenericPageContainer
                title="My Assets"
            >
                {address && !accountAddress &&
                  <AccountTokensBannerContainer maxRecords={20} showPagination={true} account={address} />
                }
                {accountAddress &&
                    <AccountTokensBannerContainer maxRecords={20} showPagination={true} account={accountAddress} />
                }
            </GenericPageContainer>
        </>
    )
};

export default AccountTokensPage;