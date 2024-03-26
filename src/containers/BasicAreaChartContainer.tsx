import { connect, ConnectedProps } from 'react-redux';

import BasicAreaChart from '../components/BasicAreaChart';

interface RootState {
  darkMode: boolean
  isConsideredMobile: boolean
}
  
const mapStateToProps = (state: RootState) => ({
  darkMode: state.darkMode,
  isConsideredMobile: state.isConsideredMobile,
})

const connector = connect(mapStateToProps, {})
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(BasicAreaChart)