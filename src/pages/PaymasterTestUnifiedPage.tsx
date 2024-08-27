import React, { useEffect, useMemo } from 'react';

import NetworkGateContainer from '../containers/NetworkGateContainer';
import FloatingActionButton from '../components/FloatingActionButton';

import { useAccount, useReadContract, useBlockNumber } from "wagmi";
import { useCapabilities } from "wagmi/experimental";

import { useUnifiedWriteContract } from '../hooks/useUnifiedWriteContract';

import { API_ENDPOINT } from "../utils/constants";

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

const PaymasterTestPage = () => {

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
    transactionType: capabilities?.paymasterService ? 'accountAbstraction' : 'traditional', // or 'accountAbstraction'
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

  // WRITE INTENTIONAL FAILURE BELOW

  const { 
    executeTransaction: executeFailingTx,
    isAwaitingWalletInteraction: isAwaitingWalletInteractionFailureTx,
    isAwaitingTx: isAwaitingFailureTx,
    isLoading: isLoadingFailure,
    txHash: txHashFailure,
    txId: txIdFailure,
  } = useUnifiedWriteContract({
    transactionType: capabilities?.paymasterService ? 'accountAbstraction' : 'traditional', // or 'accountAbstraction'
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
 
  return (
    <NetworkGateContainer
      requiredNetwork={"base-sepolia"}
      requireConnected={true}
    >
      <div style={{padding: 32, width: '100%'}}>
        <h2>Transact With Paymaster (Unified Transaction Builder)</h2>
        <p>{JSON.stringify(capabilities)}</p>
        <div style={{'display': 'flex', justifyContent: 'space-around'}}>
          <div>
            <FloatingActionButton
              buttonColor="secondary"
              disabled={isAwaitingWalletInteraction || isAwaitingApproveTx || isLoadingApprove}
              onClick={() => runApproval()}
              showLoadingIcon={isAwaitingWalletInteraction || isAwaitingApproveTx || isLoadingApprove}
              text={getApproveButtonText(isAwaitingWalletInteraction, isAwaitingApproveTx)}
            />
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
          </div>
          <div>
            <FloatingActionButton
              buttonColor="secondary"
              disabled={isAwaitingWalletInteractionFailureTx || isAwaitingFailureTx || isLoadingFailure}
              onClick={() => runFailure()}
              showLoadingIcon={isAwaitingWalletInteractionFailureTx || isAwaitingFailureTx || isLoadingFailure}
              text={getFailureButtonText(isAwaitingWalletInteractionFailureTx, isAwaitingFailureTx)}
            />
            <br/>
            {`capabilities: ${JSON.stringify(capabilities)}`}
            <br/>
            {`id: ${txIdFailure}`}
            <br/>
            {`txHash: ${txHashFailure}`}
            <br/>
            {`isLoadingFailureTx: ${isLoadingFailure}`}
          </div>
        </div>
      </div>
    </NetworkGateContainer>
  );
};

export default PaymasterTestPage;