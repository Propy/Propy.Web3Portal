import { connect, ConnectedProps } from 'react-redux';

import PropyKeyRepossession from '../components/PropyKeyRepossession';

interface RootState {
  isConsideredMobile: boolean
  isConsideredMedium: boolean
}
  
const mapStateToProps = (state: RootState) => ({
  isConsideredMobile: state.isConsideredMobile,
  isConsideredMedium: state.isConsideredMedium,
})
  
const connector = connect(mapStateToProps, {})
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(PropyKeyRepossession)