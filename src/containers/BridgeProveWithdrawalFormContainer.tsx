import { connect, ConnectedProps } from 'react-redux';

import BridgeProveWithdrawalFormUnified from '../components/BridgeProveWithdrawalFormUnified';

import {
    SupportedNetworks,
} from '../interfaces';

interface RootState {
    darkMode: boolean;
    activeNetwork: SupportedNetworks;
}
  
const mapStateToProps = (state: RootState) => ({
    darkMode: state.darkMode,
    activeNetwork: state.activeNetwork,
})

const mapDispatchToProps = {}

const connector = connect(mapStateToProps, mapDispatchToProps)
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(BridgeProveWithdrawalFormUnified)