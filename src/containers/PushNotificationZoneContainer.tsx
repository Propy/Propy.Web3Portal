import { connect, ConnectedProps } from 'react-redux';

import {
  setsupportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX,
} from '../state/actions';

import PushNotificationZone from '../components/PushNotificationZone';

interface RootState {
  isConsideredMobile: boolean
  isConsideredMedium: boolean
  darkMode: boolean
  supportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX: {[key: string]: {[key: string]: number}}
}
  
const mapStateToProps = (state: RootState) => ({
  isConsideredMobile: state.isConsideredMobile,
  isConsideredMedium: state.isConsideredMedium,
  darkMode: state.darkMode,
  supportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX: state.supportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX,
})

const mapDispatchToProps = {
  setsupportAddressToWalletAddressToLastPushChatDismissedTimestampUNIX,
}
  
const connector = connect(mapStateToProps, mapDispatchToProps)
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(PushNotificationZone)