interface ISetWalletToTimstamp {
  type: string;
  supportAddressToWalletToTimestamp: {[key: string]: {[key: string]: number}}
}

const supportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX = (state = {}, action: ISetWalletToTimstamp) => {
  switch (action.type) {
    case 'SET_SUPPORT_ADDRESS_TO_WALLET_ADDRESS_TO_LAST_PUSH_CHAT_DISMISSED_TIMESTAMP_UNIX':
      const freshStateFromCurrentState = JSON.parse(JSON.stringify(state));
      // Merge the new data into the fresh state
      Object.entries(action.supportAddressToWalletToTimestamp).forEach(([supportAddress, walletToTimestamp]) => {
        if (!freshStateFromCurrentState[supportAddress]) {
          freshStateFromCurrentState[supportAddress] = {};
        }
        Object.assign(freshStateFromCurrentState[supportAddress], walletToTimestamp);
      });
      return freshStateFromCurrentState;
    default:
      return state
  }
}

export default supportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX;