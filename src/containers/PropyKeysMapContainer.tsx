import { connect, ConnectedProps } from 'react-redux';

import PropyKeysMap from '../components/PropyKeysMap';

import {
  IPropyKeysMapFilterOptions,
} from '../interfaces';

interface RootState {
  isConsideredMobile: boolean
  isConsideredMedium: boolean
  propyKeysMapFilterOptions: IPropyKeysMapFilterOptions
}
  
const mapStateToProps = (state: RootState) => ({
  isConsideredMobile: state.isConsideredMobile,
  isConsideredMedium: state.isConsideredMedium,
  propyKeysMapFilterOptions: state.propyKeysMapFilterOptions,
})
  
const connector = connect(mapStateToProps, {})
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(PropyKeysMap)