import { connect, ConnectedProps } from 'react-redux';

import NFTLikeZone from '../components/NFTLikeZone';

interface RootState {
  isConsideredMobile: boolean
  isConsideredMedium: boolean
  darkMode: boolean
}
  
const mapStateToProps = (state: RootState) => ({
  isConsideredMobile: state.isConsideredMobile,
  isConsideredMedium: state.isConsideredMedium,
  darkMode: state.darkMode,
})
  
const connector = connect(mapStateToProps, {})
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(NFTLikeZone)