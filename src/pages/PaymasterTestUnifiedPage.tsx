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
 
  return (
    <NetworkGateContainer
      requiredNetwork={"base-sepolia"}
      requireConnected={true}
    >
      <div style={{padding: 32, width: '100%'}}>
        <h2>Unified Transaction Testing</h2>
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
        </div>
      </div>
    </NetworkGateContainer>
  );
};

export default PaymasterTestUnifiedPage;