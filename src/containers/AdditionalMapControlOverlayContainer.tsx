import { connect, ConnectedProps } from 'react-redux';

import {
  setPropyKeysMapFilterOptions,
} from '../state/actions';

import {
  IPropyKeysMapFilterOptions,
} from '../interfaces';

import AdditionalMapControlOverlay from '../components/AdditionalMapControlOverlay';

interface RootState {
  isConsideredMobile: boolean
  isConsideredMedium: boolean
  propyKeysMapFilterOptions: IPropyKeysMapFilterOptions,
}
  
const mapStateToProps = (state: RootState) => ({
  isConsideredMobile: state.isConsideredMobile,
  isConsideredMedium: state.isConsideredMedium,
  propyKeysMapFilterOptions: state.propyKeysMapFilterOptions,
})

const mapDispatchToProps = {
  setPropyKeysMapFilterOptions,
}
  
const connector = connect(mapStateToProps, mapDispatchToProps)
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(AdditionalMapControlOverlay)