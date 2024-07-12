import { useEffect, useState } from 'react';
import OptimismPortal from '../base-bridge/contract-abis/OptimismPortal';
import { WithdrawalMessage } from '../base-bridge/types/WithdrawalMessage';
import { useL2OutputProposal } from '../base-bridge/hooks/useL2OutputProposal';
import { useWithdrawalL2OutputIndex } from '../base-bridge/hooks/useWithdrawalL2OutputIndex';
import { getWithdrawalMessage } from '../base-bridge/transactions/getWithdrawalMessage';
import { useSimulateContract, usePublicClient, useWaitForTransactionReceipt } from 'wagmi';
import { keccak256, encodeAbiParameters, parseAbiParameters, PublicClient, pad } from 'viem';
import { hashWithdrawal } from '../base-bridge/hashing/hashWithdrawal';
// import { useChainEnv } from '../base-bridge/hooks/useChainEnv';

async function makeStateTrieProof(
  client: PublicClient,
  blockNumber: bigint,
  address: `0x${string}`,
  slot: `0x${string}`,
): Promise<{
  accountProof: string[];
  storageProof: `0x${string}`[];
  storageValue: bigint;
  storageRoot: `0x${string}`;
}> {
  //@ts-ignore
  const proof = await client.getProof({ address, storageKeys: [slot], blockNumber });

  return {
    accountProof: proof.accountProof,
    storageProof: proof.storageProof[0].proof,
    storageValue: proof.storageProof[0].value,
    storageRoot: proof.storageHash,
  };
}

type BedrockCrossChainMessageProof = {
  l2OutputIndex: bigint;
  outputRootProof: {
    version: `0x${string}`;
    stateRoot: `0x${string}`;
    messagePasserStorageRoot: `0x${string}`;
    latestBlockhash: `0x${string}`;
  };
  withdrawalProof: `0x${string}`[];
};

export function usePrepareProveWithdrawal(
  withdrawalTx: `0x${string}`,
  blockNumberOfLatestL2OutputProposal: bigint,
  l2ChainID: string,
  l1ChainID: string,
  l2L1MessagePasserAddress: `0x${string}`,
  l1OptimismPortalProxyAddress: `0x${string}`,
  l2OutputOracleAddress: `0x${string}`,
  prepErrorHandler: (isPrepError: boolean) => void,
  alreadyProvenHandler: (isWithdrawalAlreadyProven: boolean) => void,
  initCompleteHandler: (isInitComplete: boolean) => void,
) {
  const [withdrawalForTx, setWithdrawalForTx] = useState<WithdrawalMessage | null>(null);
  const [proofForTx, setProofForTx] = useState<BedrockCrossChainMessageProof | null>(null);

  console.log({
    withdrawalTx,
    blockNumberOfLatestL2OutputProposal,
    l2ChainID,
    l1ChainID,
    l2L1MessagePasserAddress,
    l1OptimismPortalProxyAddress,
    l2OutputOracleAddress
  })

  // const chainEnv = useChainEnv();
  // const isMainnet = chainEnv === 'mainnet';
  // const includeTosVersionByte = isMainnet;

  const { data: withdrawalReceipt } = useWaitForTransactionReceipt({
    hash: withdrawalTx,
    chainId: parseInt(l2ChainID),
  });
  const withdrawalL2OutputIndex = useWithdrawalL2OutputIndex(blockNumberOfLatestL2OutputProposal, l2OutputOracleAddress, l1ChainID);
  const l2OutputProposal = useL2OutputProposal(withdrawalL2OutputIndex, l2OutputOracleAddress, l1ChainID);
  const l2PublicClient = usePublicClient({ chainId: parseInt(l2ChainID) });

  const shouldPrepare = withdrawalForTx && proofForTx

  useEffect(() => {
    if(shouldPrepare) {
      initCompleteHandler(true);
    }
  }, [shouldPrepare, initCompleteHandler])

  const { data, error: useSimulateContractError } = useSimulateContract({
    address: shouldPrepare ? l1OptimismPortalProxyAddress : undefined,
    abi: OptimismPortal,
    functionName: 'proveWithdrawalTransaction',
    chainId: parseInt(l1ChainID),
    args:
      withdrawalForTx && proofForTx
        ? [
            {
              nonce: withdrawalForTx.nonce,
              sender: withdrawalForTx.sender,
              target: withdrawalForTx.target,
              value: withdrawalForTx.value,
              gasLimit: withdrawalForTx.gasLimit,
              data: withdrawalForTx.data,
            },
            BigInt(proofForTx.l2OutputIndex),
            {
              version: proofForTx.outputRootProof.version,
              stateRoot: proofForTx.outputRootProof.stateRoot,
              messagePasserStorageRoot: proofForTx.outputRootProof.messagePasserStorageRoot,
              latestBlockhash: proofForTx.outputRootProof.latestBlockhash,
            },
            proofForTx.withdrawalProof,
          ]
        : undefined,
    dataSuffix: undefined,
  });

  useEffect(() => {
    if(useSimulateContractError) {
      //@ts-ignore
      if(useSimulateContractError?.cause?.reason?.indexOf("withdrawal hash has already been proven") > -1) {
        alreadyProvenHandler(true);
        prepErrorHandler(false);
      } else {
        alreadyProvenHandler(false);
        prepErrorHandler(true);
      }
    } else {
      alreadyProvenHandler(false);
      prepErrorHandler(false);
    }
  }, [useSimulateContractError, prepErrorHandler, alreadyProvenHandler])

  useEffect(() => {
    void (async () => {

      console.log({withdrawalReceipt,
        withdrawalL2OutputIndex,
        l2OutputProposal,
        blockNumberOfLatestL2OutputProposal})
      if (
        withdrawalReceipt &&
        withdrawalL2OutputIndex &&
        l2OutputProposal &&
        blockNumberOfLatestL2OutputProposal &&
        l2PublicClient
      ) {
        const withdrawalMessage = getWithdrawalMessage(withdrawalReceipt);

        const messageBedrockOutput = {
          outputRoot: l2OutputProposal.outputRoot,
          l1Timestamp: l2OutputProposal.timestamp,
          l2BlockNumber: l2OutputProposal.l2BlockNumber,
          l2OutputIndex: withdrawalL2OutputIndex,
        };

        console.log({messageBedrockOutput})

        const hashedWithdrawal = hashWithdrawal(withdrawalMessage);

        const messageSlot = keccak256(
          //@ts-ignore
          encodeAbiParameters(parseAbiParameters('bytes32, uint256'), [
            hashedWithdrawal,
            BigInt(pad('0x0')),
          ]),
        );

        const stateTrieProof = await makeStateTrieProof(
          l2PublicClient,
          blockNumberOfLatestL2OutputProposal,
          l2L1MessagePasserAddress,
          messageSlot,
        );

        //@ts-ignore
        const block = await l2PublicClient.getBlock({
          blockNumber: messageBedrockOutput.l2BlockNumber,
        });

        const bedrockProof: BedrockCrossChainMessageProof = {
          outputRootProof: {
            version: pad('0x0'),
            stateRoot: block.stateRoot,
            messagePasserStorageRoot: stateTrieProof.storageRoot,
            latestBlockhash: block.hash,
          },
          withdrawalProof: stateTrieProof.storageProof,
          l2OutputIndex: messageBedrockOutput.l2OutputIndex,
        };

        setWithdrawalForTx(withdrawalMessage);
        setProofForTx(bedrockProof);
      }
    })();
  }, [
    withdrawalReceipt,
    withdrawalL2OutputIndex,
    l2OutputProposal,
    blockNumberOfLatestL2OutputProposal,
    l2PublicClient,
    l2L1MessagePasserAddress,
  ]);

  return data?.request;
}
