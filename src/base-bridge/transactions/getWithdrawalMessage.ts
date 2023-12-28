import { l2ToL1MessagePasserABI } from '@eth-optimism/contracts-ts';
import { TransactionReceipt, Log, decodeEventLog } from 'viem';
import { WithdrawalMessage } from '../types/WithdrawalMessage';

const L2_L1_MESSAGE_PASSER_ADDRESS = (
  '0x4200000000000000000000000000000000000016'
).toLowerCase();

export function getWithdrawalMessage(withdrawalReceipt: TransactionReceipt): WithdrawalMessage {
  let parsedWithdrawalLog: { args: WithdrawalMessage };
  const messageLog = withdrawalReceipt.logs.find((log) => {
    if (log.address === L2_L1_MESSAGE_PASSER_ADDRESS) {
      //@ts-ignore
      const parsed = decodeEventLog({
        abi: l2ToL1MessagePasserABI,
        data: log.data,
        topics: log.topics,
      });
      return parsed.eventName === 'MessagePassed';
    }
    return false;
  }) as Log;
  //@ts-ignore
  parsedWithdrawalLog = decodeEventLog({
    abi: l2ToL1MessagePasserABI,
    data: messageLog.data,
    topics: messageLog.topics,
  }) as { args: WithdrawalMessage };

  const withdrawalMessage = {
    nonce: parsedWithdrawalLog.args.nonce,
    sender: parsedWithdrawalLog.args.sender,
    target: parsedWithdrawalLog.args.target,
    value: parsedWithdrawalLog.args.value,
    gasLimit: parsedWithdrawalLog.args.gasLimit,
    data: parsedWithdrawalLog.args.data,
  };

  return withdrawalMessage;
}
