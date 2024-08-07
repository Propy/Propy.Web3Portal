import { connect, ConnectedProps } from 'react-redux';

import PageContainer from '../components/PageContainer';

import { setFullScreenGalleryConfig } from '../state/actions';

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

const mapDispatchToProps = {
  setFullScreenGalleryConfig,
}
  
const connector = connect(mapStateToProps, mapDispatchToProps)
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(PageContainer)