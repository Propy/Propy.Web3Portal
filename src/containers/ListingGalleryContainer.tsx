import { connect, ConnectedProps } from 'react-redux';

import { setFullScreenGalleryConfig } from '../state/actions';

import ListingGallery from '../components/ListingGallery';

import {
  IFullScreenGalleryConfig,
} from '../interfaces';

interface RootState {
  isConsideredMobile: boolean
  isConsideredMedium: boolean
  fullScreenGalleryConfig: IFullScreenGalleryConfig,
}
  
const mapStateToProps = (state: RootState) => ({
  isConsideredMobile: state.isConsideredMobile,
  isConsideredMedium: state.isConsideredMedium,
  fullScreenGalleryConfig: state.fullScreenGalleryConfig,
})

const mapDispatchToProps = {
  setFullScreenGalleryConfig,
}
  
const connector = connect(mapStateToProps, mapDispatchToProps)
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(ListingGallery)