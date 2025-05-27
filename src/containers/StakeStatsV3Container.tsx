import { connect, ConnectedProps } from 'react-redux';

import StakeStatsV3 from '../components/StakeStatsV3';

import {
    SupportedNetworks,
} from '../interfaces';

interface RootState {
    darkMode: boolean
    activeNetwork: SupportedNetworks;
    isConsideredMobile: boolean
}
  
const mapStateToProps = (state: RootState) => ({
    darkMode: state.darkMode,
    activeNetwork: state.activeNetwork,
    isConsideredMobile: state.isConsideredMobile,
})

const mapDispatchToProps = {}

const connector = connect(mapStateToProps, mapDispatchToProps)
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(StakeStatsV3)