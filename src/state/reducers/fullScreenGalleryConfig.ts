import { IFullScreenGalleryConfig } from "../../interfaces";

interface ISetFullScreenGalleryConfig {
  type: string;
  fullScreenGalleryConfig: IFullScreenGalleryConfig,
}

export const defaultFullScreenGalleryConfig : IFullScreenGalleryConfig = {
  visible: false,
  images: [],
  selectedImageIndex: 0,
  onFullscreenGalleryClose: () => {}
}

const fullScreenGalleryConfig = (state = defaultFullScreenGalleryConfig, action: ISetFullScreenGalleryConfig) => {
  switch (action.type) {
      case 'SET_FULL_SCREEN_GALLERY_CONFIG':
          return Object.assign({}, action.fullScreenGalleryConfig);
      default:
          return state
  }
}

export default fullScreenGalleryConfig;