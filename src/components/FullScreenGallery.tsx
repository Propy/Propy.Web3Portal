import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';

import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import ArrowNext from '@mui/icons-material/ArrowForwardIos';
import ArrowPrevious from '@mui/icons-material/ArrowBackIosNew';
import CloseIcon from '@mui/icons-material/Close';

import {
  PROPY_LIGHT_BLUE,
} from '../utils/constants';

import { PropsFromRedux } from '../containers/FullScreenGalleryContainer';

const previewImageSize = 100;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    lightbox: {
      backgroundColor: 'black',
      width: '100%',
      height: '100%',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10000,
      overflow: 'auto',
    },
    primaryImageContainer: {
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: 'black',
      height: 'calc(100% - 100px)'
    },
    primaryImageBackgroundContainer: {
      backgroundSize: 'cover',
      width: '110%',
      height: '110%',
      position: 'absolute',
      backgroundPosition: 'center',
      top: '-5%',
      left: '-5%',
    },
    primaryImageForegroundContainer: {
      width: '100%',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'relative',
      height: '100%',
    },
    primaryImageControlsTopRow: {
      display: 'flex',
      width: '100%',
      justifyContent: 'space-between'
    },
    primaryImageControlsMiddleRow: {
      display: 'flex',
      justifyContent: 'space-between',
      width: `calc(100% - ${theme.spacing(4)})`,
    },
    primaryImageControlsBottomRow: {

    },
    previewImageRowOuter: {
      display: 'flex',
      backgroundColor: 'black',
      overflowX: 'scroll',
      padding: 4,
      // border: '1px solid #d5d5d5',
    },
    previewImageRowInner: {
      display: 'flex',
      height: '92px',
    },
    previewImageSelected: {
      border: `4px solid ${PROPY_LIGHT_BLUE}`,
    },
    previewImageUnselected: {
      border: `4px solid #363636`,
    },
    previewImageEntryOuter: {
      position: 'relative',
      width: previewImageSize,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      marginRight: 4,
      borderRadius: 11,
      overflow: 'hidden',
      aspectRatio: '1 / 1',
    },
    previewImageEntryInner: {
      width: "100%",
      height: "100%",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    },
  }),
);

interface IFullScreenGallery {

}

const FullScreenGallery = (props: PropsFromRedux & IFullScreenGallery) => {

  const classes = useStyles();

  const {
    fullScreenGalleryConfig,
    setFullScreenGalleryConfig,
  } = props;

  const previewImageRowOuterRef = useRef<HTMLDivElement>(null);
  const previewImageRefs = useRef<(HTMLDivElement | null)[]>([]);

  console.log({fullScreenGalleryConfig})

  useEffect(() => {
    if(fullScreenGalleryConfig.visible) {
      document.body.classList.add('hide-body-overflow');
    } else {
      document.body.classList.remove('hide-body-overflow');
    }
  }, [fullScreenGalleryConfig.visible])

  const handleNext = () => {
    if(fullScreenGalleryConfig?.selectedImageIndex < (fullScreenGalleryConfig?.images?.length - 1)) {
      const newIndex = fullScreenGalleryConfig?.selectedImageIndex + 1;
      let precomputedNewFullScreenGalleryConfig = Object.assign({}, fullScreenGalleryConfig);
      precomputedNewFullScreenGalleryConfig.selectedImageIndex = newIndex;
      setFullScreenGalleryConfig(precomputedNewFullScreenGalleryConfig);
      scrollSelectedImageIntoView(newIndex);
    }
  }

  const handlePrevious = () => {
    if(fullScreenGalleryConfig?.selectedImageIndex > 0) {
      const newIndex = fullScreenGalleryConfig.selectedImageIndex - 1;
      let precomputedNewFullScreenGalleryConfig = Object.assign({}, fullScreenGalleryConfig);
      precomputedNewFullScreenGalleryConfig.selectedImageIndex = newIndex;
      setFullScreenGalleryConfig(precomputedNewFullScreenGalleryConfig);
      scrollSelectedImageIntoView(newIndex);
    }
  }

  const handleImageSelection = (index: number) => {
    let precomputedNewFullScreenGalleryConfig = Object.assign({}, fullScreenGalleryConfig);
    precomputedNewFullScreenGalleryConfig.selectedImageIndex = index;
    setFullScreenGalleryConfig(precomputedNewFullScreenGalleryConfig);
    scrollSelectedImageIntoView(index);
  }

  const handleCloses = () => {
    let precomputedNewFullScreenGalleryConfig = Object.assign({}, fullScreenGalleryConfig);
    precomputedNewFullScreenGalleryConfig.visible = false;
    if(precomputedNewFullScreenGalleryConfig.onFullscreenGalleryClose) {
      precomputedNewFullScreenGalleryConfig.onFullscreenGalleryClose(precomputedNewFullScreenGalleryConfig.selectedImageIndex);
    }
    setFullScreenGalleryConfig(precomputedNewFullScreenGalleryConfig);
  }

  const scrollSelectedImageIntoView = (index: number) => {
    previewImageRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  };

  return (
    <>
      {fullScreenGalleryConfig.visible && createPortal(
        <div className={classes.lightbox}>
          <div 
            className={classes.primaryImageContainer} 
            // onClick={() => handleFullscreenImageSelection(selectedImageIndex)}
          >
            <div className={[classes.primaryImageBackgroundContainer, 'image-filter-blur-heavy'].join(' ')} style={fullScreenGalleryConfig?.images?.length > 0 ? { backgroundImage: `url(${fullScreenGalleryConfig?.images[fullScreenGalleryConfig?.selectedImageIndex]})` } : {}} />
            <div className={classes.primaryImageForegroundContainer} style={fullScreenGalleryConfig?.images?.length > 0 ? { backgroundImage: `url(${fullScreenGalleryConfig?.images[fullScreenGalleryConfig?.selectedImageIndex]})` } : {}}>
              <div className={classes.primaryImageControlsTopRow}>
                <div style={{margin: 8}}>
                  <Typography style={{fontWeight: 'bold'}}>{fullScreenGalleryConfig?.selectedImageIndex + 1} / {fullScreenGalleryConfig?.images?.length}</Typography>
                </div>
                <CloseIcon style={{cursor: 'pointer', width: 30, height: 30, margin: 8}} onClick={() => handleCloses()} />
              </div>
              <div className={classes.primaryImageControlsMiddleRow}>
                <Fab onClick={() => handlePrevious()} color="default" aria-label="add" disabled={fullScreenGalleryConfig?.selectedImageIndex === 0}>
                  <ArrowPrevious />
                </Fab>
                <Fab onClick={() => handleNext()} color="default" aria-label="add" disabled={fullScreenGalleryConfig?.selectedImageIndex >= (fullScreenGalleryConfig?.images?.length - 1)}>
                  <ArrowNext />
                </Fab>
              </div>
              <div className={classes.primaryImageControlsBottomRow}>
                
              </div>
            </div>
          </div>
          <div 
            className={classes.previewImageRowOuter}
            ref={previewImageRowOuterRef}
            // onMouseDown={handleMouseDown}
            // onMouseMove={handleMouseMove}
            // onMouseUp={handleMouseUp}
            // onMouseLeave={handleMouseUp}
          >
            <div 
              className={classes.previewImageRowInner}
            >
              {fullScreenGalleryConfig?.images.map((imageLink, index) => 
                <div 
                  ref={(el) => (previewImageRefs.current[index] = el)}
                  onClick={() => handleImageSelection(index)}
                  key={`${index}-${imageLink}`}
                  className={[classes.previewImageEntryOuter, index === fullScreenGalleryConfig?.selectedImageIndex ? classes.previewImageSelected : classes.previewImageUnselected].join(" ")}
                >
                  <div className={classes.previewImageEntryInner} style={{backgroundImage: `url(${imageLink})`}}/>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default FullScreenGallery;