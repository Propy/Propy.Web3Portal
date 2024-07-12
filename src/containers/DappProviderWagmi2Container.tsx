import { connect, ConnectedProps } from 'react-redux';

import {
    setConsideredMobile,
    setConsideredMedium,
} from '../state/actions';

import DappProviderWagmi2 from '../components/DappProviderWagmi2';

import {
    SupportedNetworks,
} from '../interfaces';

interface RootState {
    darkMode: boolean
    activeNetwork: SupportedNetworks;
}
  
const mapStateToProps = (state: RootState) => ({
    darkMode: state.darkMode,
    activeNetwork: state.activeNetwork,
})

const mapDispatchToProps = {
    setConsideredMobile,
    setConsideredMedium,
}

const connector = connect(mapStateToProps, mapDispatchToProps)
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(DappProviderWagmi2)