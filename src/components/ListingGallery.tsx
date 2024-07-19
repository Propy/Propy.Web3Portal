import React, { useState, useEffect, useRef } from 'react';

import { Theme } from '@mui/material/styles';
import Fab from '@mui/material/Fab';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import ArrowNext from '@mui/icons-material/ArrowForwardIos';
import ArrowPrevious from '@mui/icons-material/ArrowBackIosNew';

import {
  PROPY_LIGHT_BLUE,
} from '../utils/constants';

import { PropsFromRedux } from '../containers/ListingGalleryContainer';

import {
  IFullScreenGalleryConfig,
} from '../interfaces';

const previewImageSize = 100;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      borderRadius: 15,
      overflow: 'hidden',
    },
    primaryImageContainer: {
      borderRadius: 15,
      overflow: 'hidden',
      border: '1px solid #d5d5d5',
      position: 'relative',
      backgroundColor: '#f6f6f6',
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
      aspectRatio: '16 / 10',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'relative',
    },
    primaryImageForeground: {
      height: '100%',
      objectFit: 'contain',
      position: 'absolute',
      cursor: 'pointer',
    },
    primaryImageControlsTopRow: {

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
      backgroundColor: '#f6f6f6',
      marginTop: 8,
      borderRadius: 15,
      overflowX: 'scroll',
      padding: 4,
      border: '1px solid #d5d5d5',
      height: 110,
    },
    previewImageRowInner: {
      display: 'flex',
    },
    previewImageSelected: {
      border: `4px solid ${PROPY_LIGHT_BLUE}`,
    },
    previewImageUnselected: {
      border: `4px solid #ededed`,
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

interface IListingGallery {
  images: string[],
}

const ListingGallery = (props: PropsFromRedux & IListingGallery) => {

  const classes = useStyles();

  const {
    images,
    // isConsideredMobile,
    // isConsideredMedium,
    // fullScreenGalleryConfig,
    setFullScreenGalleryConfig,
  } = props;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  // const [dragStartX, setDragStartX] = useState(0);
  const previewImageRowOuterRef = useRef<HTMLDivElement>(null);
  const previewImageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setSelectedImageIndex(0);
    if (previewImageRowOuterRef.current) {
      previewImageRowOuterRef.current.scrollLeft = 0;
    }
  }, [images]);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    // setDragStartX(event.clientX);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && previewImageRowOuterRef.current) {
      // const deltaX = event.clientX - dragStartX;
      // previewImageRowOuterRef.current.scrollLeft -= deltaX;
      // setDragStartX(event.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleNext = () => {
    if(selectedImageIndex < (images?.length - 1)) {
      const newIndex = selectedImageIndex + 1;
      setSelectedImageIndex(newIndex);
      scrollSelectedImageIntoView(newIndex);
    }
  }

  const handlePrevious = () => {
    if(selectedImageIndex > 0) {
      const newIndex = selectedImageIndex - 1;
      setSelectedImageIndex(newIndex);
      scrollSelectedImageIntoView(newIndex);
    }
  }

  const handleImageSelection = (index: number) => {
    setSelectedImageIndex(index);
    scrollSelectedImageIntoView(index);
  }

  const scrollSelectedImageIntoView = (index: number) => {
    previewImageRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  };

  const handleFullscreenImageSelection = (index: number) => {
    if(setFullScreenGalleryConfig) {
      let precomputedConfig : IFullScreenGalleryConfig = {
        images,
        visible: true,
        selectedImageIndex: index,
        onFullscreenGalleryClose: (lastSelectedIndex: number) => { handleImageSelection(lastSelectedIndex) }
      }
      setFullScreenGalleryConfig(precomputedConfig);
    }
  }

  return (
    <div className={classes.root}>
      <div className={classes.primaryImageContainer}>
        <div className={[classes.primaryImageBackgroundContainer, 'image-filter-blur-heavy'].join(' ')} style={images?.length > 0 ? { backgroundImage: `url(${images[selectedImageIndex]})` } : {}} />
        <div className={classes.primaryImageForegroundContainer}>
          {images?.[selectedImageIndex] && <img alt={`Home listing preview ${selectedImageIndex + 1} of ${images?.length}`} src={images[selectedImageIndex]} className={classes.primaryImageForeground} onClick={() => handleFullscreenImageSelection(selectedImageIndex)}/>}
          <div className={classes.primaryImageControlsTopRow}>

          </div>
          <div className={classes.primaryImageControlsMiddleRow}>
            <Fab onClick={() => handlePrevious()} color="default" aria-label="add" disabled={selectedImageIndex === 0}>
              <ArrowPrevious />
            </Fab>
            <Fab onClick={() => handleNext()} color="default" aria-label="add" disabled={selectedImageIndex >= (images?.length - 1)}>
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className={classes.previewImageRowInner}
        >
          {images.map((imageLink, index) => 
            <div 
              ref={(el) => (previewImageRefs.current[index] = el)}
              onClick={() => handleImageSelection(index)}
              key={`${index}-${imageLink}`}
              className={[classes.previewImageEntryOuter, index === selectedImageIndex ? classes.previewImageSelected : classes.previewImageUnselected].join(" ")}
            >
              <div className={classes.previewImageEntryInner} style={{backgroundImage: `url(${imageLink})`}}/>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ListingGallery;