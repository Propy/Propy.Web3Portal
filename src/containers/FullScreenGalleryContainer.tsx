import { connect, ConnectedProps } from 'react-redux';

import { setFullScreenGalleryConfig } from '../state/actions';

import {
  IFullScreenGalleryConfig,
} from '../interfaces';

import FullScreenGallery from '../components/FullScreenGallery';

interface RootState {
  fullScreenGalleryConfig: IFullScreenGalleryConfig
}
  
const mapStateToProps = (state: RootState) => ({
  fullScreenGalleryConfig: state.fullScreenGalleryConfig,
})
  
const mapDispatchToProps = {
  setFullScreenGalleryConfig,
}
  
const connector = connect(mapStateToProps, mapDispatchToProps)
  
export type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(FullScreenGallery)