import { connect, ConnectedProps } from 'react-redux';

import HomeListingCollectionFilterZone from '../components/HomeListingCollectionFilterZone';

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

export default connector(HomeListingCollectionFilterZone)