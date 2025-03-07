import React, { useEffect, useMemo } from 'react';

import NetworkGateContainer from '../containers/NetworkGateContainer';
import FloatingActionButton from '../components/FloatingActionButton';

import { useAccount, useReadContract, useBlockNumber } from "wagmi";
import { useCapabilities } from "wagmi/experimental";
import { useAppKit } from '@reown/appkit/react'

import { useUnifiedWriteContract } from '../hooks/useUnifiedWriteContract';

import { API_ENDPOINT } from "../utils/constants";

export const EthPaymentABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"tokenAddress","type":"address"}],"name":"ApprovedPaymentToken","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"tokenAddress","type":"address"}],"name":"ApprovedSweepingToken","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"recipientAddress","type":"address"}],"name":"ApprovedTokenSweepRecipient","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenAmount","type":"uint256"}],"name":"DefaultPaymentConfigAdjusted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"paymentReferenceHash","type":"bytes32"},{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"ethAmount","type":"uint256"},{"indexed":false,"internalType":"string","name":"paymentReference","type":"string"}],"name":"DefaultPaymentReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":true,"internalType":"address","name":"sweeper","type":"address"},{"indexed":false,"internalType":"uint256","name":"ethAmount","type":"uint256"}],"name":"ETHSwept","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint8","name":"version","type":"uint8"}],"name":"Initialized","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"paymentReferenceHash","type":"bytes32"},{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"ethAmount","type":"uint256"},{"indexed":false,"internalType":"string","name":"paymentReference","type":"string"}],"name":"OpenPaymentReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"paymentReferenceHash","type":"bytes32"},{"indexed":false,"internalType":"string","name":"paymentReference","type":"string"},{"components":[{"internalType":"string","name":"paymentReference","type":"string"},{"internalType":"bytes32","name":"paymentReferenceHash","type":"bytes32"},{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"uint256","name":"tokenAmount","type":"uint256"},{"internalType":"uint256","name":"ethAmount","type":"uint256"},{"internalType":"address","name":"payer","type":"address"},{"internalType":"bool","name":"enforcePayer","type":"bool"},{"internalType":"bool","name":"complete","type":"bool"},{"internalType":"bool","name":"exists","type":"bool"}],"indexed":false,"internalType":"struct PaymentPROClonableV3.StrictPayment","name":"referencedPaymentEntry","type":"tuple"}],"name":"PaymentReferenceCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"paymentReferenceHash","type":"bytes32"},{"indexed":false,"internalType":"string","name":"paymentReference","type":"string"}],"name":"PaymentReferenceDeleted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleGranted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleRevoked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"paymentReferenceHash","type":"bytes32"},{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"ethAmount","type":"uint256"},{"indexed":false,"internalType":"string","name":"paymentReference","type":"string"}],"name":"StrictPaymentReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":true,"internalType":"address","name":"sweeper","type":"address"},{"indexed":true,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenAmount","type":"uint256"}],"name":"TokenSwept","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"tokenAddress","type":"address"}],"name":"UnapprovedPaymentToken","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"tokenAddress","type":"address"}],"name":"UnapprovedSweepingToken","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"recipientAddress","type":"address"}],"name":"UnapprovedTokenSweepRecipient","type":"event"},{"inputs":[],"name":"APPROVER_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DEFAULT_ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PAYMENT_MANAGER_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SWEEPER_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_reference","type":"string"},{"internalType":"address","name":"_tokenAddress","type":"address"},{"internalType":"uint256","name":"_tokenAmount","type":"uint256"},{"internalType":"uint256","name":"_ethAmount","type":"uint256"},{"internalType":"address","name":"_payer","type":"address"},{"internalType":"bool","name":"_enforcePayer","type":"bool"}],"name":"createStrictPayment","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"defaultPaymentConfig","outputs":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"uint256","name":"tokenAmount","type":"uint256"},{"internalType":"uint256","name":"ethAmount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_reference","type":"string"}],"name":"deleteStrictPayment","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleAdmin","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_roleAdmin","type":"address"},{"internalType":"address","name":"_approvedPaymentToken","type":"address"},{"internalType":"address","name":"_approvedSweepingToken","type":"address"},{"internalType":"address","name":"_approvedTokenSweepRecipient","type":"address"},{"internalType":"uint256","name":"_defaultTokenAmount","type":"uint256"},{"internalType":"uint256","name":"_defaultEthAmount","type":"uint256"}],"name":"initializeContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"isInitialized","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_reference","type":"string"}],"name":"makeDefaultPayment","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"_tokenAddress","type":"address"},{"internalType":"uint256","name":"_tokenAmount","type":"uint256"},{"internalType":"uint256","name":"_ethAmount","type":"uint256"},{"internalType":"string","name":"_reference","type":"string"}],"name":"makeOpenPayment","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"string","name":"_reference","type":"string"}],"name":"makeStrictPayment","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"renounceRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_tokenAddress","type":"address"},{"internalType":"bool","name":"_validity","type":"bool"}],"name":"setApprovedPaymentToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_recipientAddress","type":"address"},{"internalType":"bool","name":"_validity","type":"bool"}],"name":"setApprovedSweepRecipient","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_tokenAddress","type":"address"},{"internalType":"bool","name":"_validity","type":"bool"}],"name":"setApprovedSweepingToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_tokenAddress","type":"address"},{"internalType":"uint256","name":"_tokenAmount","type":"uint256"},{"internalType":"uint256","name":"_defaultEthAmount","type":"uint256"}],"name":"setDefaultPaymentConfig","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_recipientAddress","type":"address"}],"name":"sweepETHByFullBalance","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_tokenAddress","type":"address"},{"internalType":"address","name":"_recipientAddress","type":"address"},{"internalType":"uint256","name":"_tokenAmount","type":"uint256"}],"name":"sweepTokenByAmount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_tokenAddress","type":"address"},{"internalType":"address","name":"_recipientAddress","type":"address"}],"name":"sweepTokenByFullBalance","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_hashedReference","type":"bytes32"}],"name":"viewStrictPaymentByHashedReference","outputs":[{"components":[{"internalType":"string","name":"paymentReference","type":"string"},{"internalType":"bytes32","name":"paymentReferenceHash","type":"bytes32"},{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"uint256","name":"tokenAmount","type":"uint256"},{"internalType":"uint256","name":"ethAmount","type":"uint256"},{"internalType":"address","name":"payer","type":"address"},{"internalType":"bool","name":"enforcePayer","type":"bool"},{"internalType":"bool","name":"complete","type":"bool"},{"internalType":"bool","name":"exists","type":"bool"}],"internalType":"struct PaymentPROClonableV3.StrictPayment","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_reference","type":"string"}],"name":"viewStrictPaymentByStringReference","outputs":[{"components":[{"internalType":"string","name":"paymentReference","type":"string"},{"internalType":"bytes32","name":"paymentReferenceHash","type":"bytes32"},{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"uint256","name":"tokenAmount","type":"uint256"},{"internalType":"uint256","name":"ethAmount","type":"uint256"},{"internalType":"address","name":"payer","type":"address"},{"internalType":"bool","name":"enforcePayer","type":"bool"},{"internalType":"bool","name":"complete","type":"bool"},{"internalType":"bool","name":"exists","type":"bool"}],"internalType":"struct PaymentPROClonableV3.StrictPayment","name":"","type":"tuple"}],"stateMutability":"view","type":"function"}]

export const ERC20ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "failOnOddMinute",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

const PRO_BASE_SEPOLIA = "0x3660925E58444955c4812e42A572e532e69Dac7B";
// prod: 0x18dD5B087bCA9920562aFf7A0199b96B9230438b
// sepolia: 0x3660925E58444955c4812e42A572e532e69Dac7B

const randomAllowanceValue = Math.floor(Math.random() * 1000000);

const PaymasterTestUnifiedPage = () => {

  const account = useAccount();

  const { data: availableCapabilities } = useCapabilities({
    account: account.address,
  });
  const capabilities = useMemo(() => {
    if (!availableCapabilities || !account.chainId) return {};
    const capabilitiesForChain = availableCapabilities[account.chainId];
    console.log({capabilitiesForChain})
    if (
      capabilitiesForChain["paymasterService"] &&
      capabilitiesForChain["paymasterService"].supported
    ) {
      return {
        paymasterService: {
          url: `${API_ENDPOINT}/paymaster`,
        },
      };
    }
    return {};
  }, [availableCapabilities, account.chainId]);

  // WRITE SUCCESSFUL BELOW

  const { 
    executeTransaction,
    isAwaitingWalletInteraction,
    isAwaitingTx: isAwaitingApproveTx,
    isLoading: isLoadingApprove,
    txHash,
    txId,
  } = useUnifiedWriteContract({
    contractConfig: {
      address: PRO_BASE_SEPOLIA,
      abi: ERC20ABI,
      functionName: "approve",
      args: [PRO_BASE_SEPOLIA, randomAllowanceValue],
    },
    onSuccess: () => {

    },
    onError: () => {
      
    },
    onSettled: () => {},
  });

  const runApproval = () => {
    executeTransaction();
  };

  const getApproveButtonText = (waitingForWallet: boolean, waitingForTransaction: boolean) => {
    if(waitingForWallet) {
      return "Please Check Wallet...";
    }
    if(waitingForTransaction) {
      return "Awaiting Transaction";
    }
    return "Approve";
  }

  // WRITE SUCCESSFUL ABOVE

  // WRITE ETH PAYMENT BELOW

  const { 
    executeTransaction: executeEthPaymentTx,
    isAwaitingWalletInteraction: isAwaitingWalletInteractionEthPaymentTx,
    isAwaitingTx: isAwaitingEthPaymentTx,
    isLoading: isLoadingEthPayment,
    txHash: txHashEthPayment,
    txId: txIdEthPayment,
  } = useUnifiedWriteContract({});

  const runEthPayment = () => {
    executeEthPaymentTx({
      address: "0xF4dBa9F06dbE89ae7826FDaA102858F69b3242c7",
      abi: EthPaymentABI,
      functionName: "makeDefaultPayment",
      args: [`SOME_TEST_REFERENCE`],
      value: 975378518539587
    });
  };

  const getEthPaymentButtonText = (waitingForWallet: boolean, waitingForTransaction: boolean) => {
    if(waitingForWallet) {
      return "Please Check Wallet...";
    }
    if(waitingForTransaction) {
      return "Awaiting Transaction";
    }
    return "Make Payment";
  }

  // WRITE ETH PAYMENT ABOVE

  // WRITE INTENTIONAL FAILURE BELOW

  const { 
    executeTransaction: executeFailingTx,
    isAwaitingWalletInteraction: isAwaitingWalletInteractionFailureTx,
    isAwaitingTx: isAwaitingFailureTx,
    isLoading: isLoadingFailure,
    txHash: txHashFailure,
    txId: txIdFailure,
  } = useUnifiedWriteContract({
    contractConfig: {
      address: "0xf6030646B9Df26a00bAbcBef2aE91Eab00405a56",
      abi: ERC20ABI,
      functionName: "failOnOddMinute",
      args: [],
    },
    onSuccess: () => {

    },
    onError: () => {

    },
    onSettled: () => {},
  });

  const runFailure = () => {
    executeFailingTx();
  };

  const getFailureButtonText = (waitingForWallet: boolean, waitingForTransaction: boolean) => {
    if(waitingForWallet) {
      return "Please Check Wallet...";
    }
    if(waitingForTransaction) {
      return "Awaiting Transaction";
    }
    return "Init failure tx";
  }

  // WRITE INTENTIONAL FAILURE ABOVE

  const { 
    data: dataL2BridgePROAllowance,
    refetch: refetchDataL2BridgePROAllowance,
  } = useReadContract({
    address: PRO_BASE_SEPOLIA,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: [account.address ? account.address : PRO_BASE_SEPOLIA, PRO_BASE_SEPOLIA],
  })

  const { data: blockNumber } = useBlockNumber({ watch: true })

  useEffect(() => {
    refetchDataL2BridgePROAllowance()
  }, [blockNumber, refetchDataL2BridgePROAllowance])

  const { open } = useAppKit();
 
  return (
    <NetworkGateContainer
      requiredNetwork={"base-sepolia"}
      requireConnected={true}
    >
      <div style={{padding: 32, width: '100%'}}>
        <h2>Unified Transaction Testing Below</h2>
        <FloatingActionButton
          buttonColor="secondary"
          onClick={() => open({ view: 'OnRampProviders' })}
          text={"Test Buy Crypto"}
        />
        <h3>Should seamlessly support EOA wallets & Coinbase Smart Wallet</h3>
        <h4>Should support sponsored transactions with Coinbase Smart Wallet</h4>
        <p>{JSON.stringify(capabilities)}</p>
        <div style={{'display': 'flex', justifyContent: 'space-between'}}>
          <div style={{width: 'calc(50% - 8px)', padding: 16, border: '1px solid black', borderRadius: 15}}>
            <FloatingActionButton
              buttonColor="secondary"
              disabled={isAwaitingWalletInteraction || isAwaitingApproveTx || isLoadingApprove}
              onClick={() => runApproval()}
              showLoadingIcon={isAwaitingWalletInteraction || isAwaitingApproveTx || isLoadingApprove}
              text={getApproveButtonText(isAwaitingWalletInteraction, isAwaitingApproveTx)}
            />
            <pre style={{ wordBreak: 'break-all', whiteSpace: 'break-spaces', fontSize: 11}}>
              <br/>
              {`capabilities: ${JSON.stringify(capabilities)}`}
              <br/>
              {`id: ${txId}`}
              <br/>
              {`txHash: ${txHash}`}
              <br/>
              {`randomAllowanceValue: ${randomAllowanceValue}`}
              <br/>
              {`dataL2BridgePROAllowance: ${dataL2BridgePROAllowance}`}
              <br/>
              {`Allowance: ${Number(dataL2BridgePROAllowance ? dataL2BridgePROAllowance : 0)}`}
              <br/>
              {`isLoadingApprove: ${isLoadingApprove}`}
            </pre>
          </div>
          <div style={{width: 'calc(50% - 8px)', padding: 16, border: '1px solid black', borderRadius: 15}}>
            <FloatingActionButton
              buttonColor="secondary"
              disabled={isAwaitingWalletInteractionFailureTx || isAwaitingFailureTx || isLoadingFailure}
              onClick={() => runFailure()}
              showLoadingIcon={isAwaitingWalletInteractionFailureTx || isAwaitingFailureTx || isLoadingFailure}
              text={getFailureButtonText(isAwaitingWalletInteractionFailureTx, isAwaitingFailureTx)}
            />
            <h5>This button can be used to test failing transactions. Click this button during an even minute so that MetaMask or Coinbase smart wallet run the gas calculation and tx simulation at a time when the function will work, once the clock ticks over to an odd number, submit the transaction (transaction will succeed during even minutes and fail during odd minutes, we "trick" our wallet into thinking the transaction will pass by simulating it during the even minute and then submitting on an odd minute). If you click this button during an odd minute, it probably won't let you submit the transaction in the first place, since it will detect that the tx will fail before it lets you submit it.</h5>
            <pre style={{ wordBreak: 'break-all', whiteSpace: 'break-spaces', fontSize: 11}}>
              <br/>
              {`capabilities: ${JSON.stringify(capabilities)}`}
              <br/>
              {`id: ${txIdFailure}`}
              <br/>
              {`txHash: ${txHashFailure}`}
              <br/>
              {`isLoadingFailureTx: ${isLoadingFailure}`}
            </pre>
          </div>
          <div style={{width: 'calc(50% - 8px)', padding: 16, border: '1px solid black', borderRadius: 15}}>
            <FloatingActionButton
              buttonColor="secondary"
              disabled={isAwaitingWalletInteractionEthPaymentTx || isAwaitingEthPaymentTx || isLoadingEthPayment}
              onClick={() => runEthPayment()}
              showLoadingIcon={isAwaitingWalletInteractionEthPaymentTx || isAwaitingEthPaymentTx || isLoadingEthPayment}
              text={getEthPaymentButtonText(isAwaitingWalletInteractionEthPaymentTx, isAwaitingEthPaymentTx)}
            />
            <pre style={{ wordBreak: 'break-all', whiteSpace: 'break-spaces', fontSize: 11}}>
              <br/>
              {`capabilities: ${JSON.stringify(capabilities)}`}
              <br/>
              {`id: ${txIdEthPayment}`}
              <br/>
              {`txHash: ${txHashEthPayment}`}
              <br/>
              {`isLoadingApprove: ${isLoadingEthPayment}`}
            </pre>
          </div>
        </div>
      </div>
    </NetworkGateContainer>
  );
};

export default PaymasterTestUnifiedPage;