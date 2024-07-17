import React, { useEffect, useState } from 'react'

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import PropyKeysHomeListingLikeZoneContainer from '../containers/PropyKeysHomeListingLikeZoneContainer';

import PlaceholderImage from '../assets/img/placeholder.webp';

import BathroomIcon from '../assets/svg/bathroom-icon.svg';
import BedroomIcon from '../assets/svg/bedroom-icon.svg';
// import FloorSizeIcon from '../assets/svg/floor-size-icon.svg';
import LotSizeIcon from '../assets/svg/lot-size-icon.svg';

import {
  IBalanceRecord,
  IPropyKeysHomeListingRecord,
} from '../interfaces';

import {
  PROPY_LIGHT_BLUE,
  HOME_LISTING_CARD_HEIGHT,
  HOME_LISTING_CARD_MEDIA_HEIGHT,
} from '../utils/constants';

import {
  priceFormat,
} from '../utils';

import LinkWrapper from './LinkWrapper';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    actionArea: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'start',
    },
    typographyZone: {
      padding: theme.spacing(2),
      width: '100%',
    },
    title: {
      fontSize: '1.1rem',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    collectionName: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    chipContainer: {
      position: 'absolute',
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
      padding: theme.spacing(1),
    },
    leftChips: {

    },
    rightChips: {

    },
    chip: {
      color: 'white',
      fontWeight: 'bold',
    },
    likeContainer: {
      marginBottom: theme.spacing(0.5),
    },
    textFirstLine: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    disabledActionArea: {
      opacity: 0.5,
      pointerEvents: 'none',
    },
    subtleDisabledActionArea: {
      pointerEvents: 'none',
    },
    quickSpecsZone: {
      marginBottom: theme.spacing(0.5),
      display: 'flex',
      overflowX: 'auto',
    },
    quickSpecEntry: {
      display: 'flex',
      alignItems: 'center',
      marginRight: theme.spacing(2),
      textWrap: 'nowrap',
    },
    quickSpecEntryIcon: {
      height: 20,
      marginRight: theme.spacing(1),
    },
    quickSpecEntryText: {
      textTransform: 'none',
      fontSize: '0.9rem',
    },
  }),
);

interface ISingleTokenCardBaselineProps {
  selectable?: boolean,
  onBalanceRecordSelected?: (balanceRecord: IBalanceRecord) => void,
  selected?: boolean,
  disabled?: boolean,
  balanceRecord?: IBalanceRecord,
  tokenLink?: string,
  tokenImage?: string,
  tokenStandard?: string,
  tokenId?: string,
  tokenCollectionName?: string,
  tokenContractAddress?: string,
  tokenNetwork?: string,
  tokenTitle?: string,
  subtleDisableInteraction?: boolean,
  listingRecord: IPropyKeysHomeListingRecord
}

interface IQuickSpecs {
  icon: string;
  value: string;
}

const SingleTokenCardBaseline = (props: ISingleTokenCardBaselineProps) => {

  const {
    balanceRecord,
    selectable,
    onBalanceRecordSelected,
    selected,
    disabled,
    subtleDisableInteraction,
    tokenLink,
    tokenImage,
    tokenTitle,
    listingRecord,
  } = props;

  const classes = useStyles();

  const [quickSpecs, setQuickSpecs] = useState<IQuickSpecs[]>([]);

  useEffect(() => {
    let newQuickSpecs : IQuickSpecs[] = [];

    if(listingRecord?.bathrooms) {
      newQuickSpecs.push({
        icon: BathroomIcon,
        value: `${listingRecord?.bathrooms} ba`
      })
    }

    if(listingRecord?.bedrooms) {
      newQuickSpecs.push({
        icon: BedroomIcon,
        value: `${listingRecord?.bedrooms} bd`
      })
    }

    if(listingRecord?.lot_size) {
      newQuickSpecs.push({
        icon: LotSizeIcon,
        value: `${listingRecord?.lot_size} ft²`
      })
    }

    setQuickSpecs(newQuickSpecs);
  }, [listingRecord])

  return (
    <Card 
      className={
        [
          disabled ? classes.disabledActionArea : "",
          subtleDisableInteraction ? classes.subtleDisabledActionArea : "",
        ].join(" ")
      }
      style={{
      width: '100%',
      height: `${HOME_LISTING_CARD_HEIGHT}px`,
      ...(selected && {border: `3px solid ${PROPY_LIGHT_BLUE}`}),
      ...((!selected && selectable) && {border: `3px solid white`}),
    }} onClick={() => {
      if(balanceRecord && selectable && onBalanceRecordSelected) {
        onBalanceRecordSelected(balanceRecord);
      }
    }}>
      <LinkWrapper link={(tokenLink && !selectable) ? tokenLink : undefined}>
        <CardActionArea className={classes.actionArea}>
          <CardMedia
            component="img"
            height={`${HOME_LISTING_CARD_MEDIA_HEIGHT}`}
            image={tokenImage ? tokenImage : PlaceholderImage}
            style={{position: 'absolute'}}
            alt="featured property media"
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.src=PlaceholderImage;
            }}
          />
          <div style={{height: HOME_LISTING_CARD_MEDIA_HEIGHT}}></div>
          <div className={classes.chipContainer}>
            <div className={classes.leftChips}>
              {listingRecord?.price && <Chip className={classes.chip} color="primary" label={priceFormat(`${listingRecord?.price}`, 2, "$")} size="small" />}
            </div>
            {/* <div className={classes.rightChips}>
              {listingRecord?.price && <Chip className={classes.chip} color="primary" label={priceFormat(`${listingRecord?.price}`, 2, "$")} size="small" />}
            </div> */}
          </div>
          <div className={classes.typographyZone}>
            {quickSpecs.length > 0 &&
              <div className={[classes.quickSpecsZone].join(" ")}>
                {quickSpecs.map((entry, index) => 
                  <div className={classes.quickSpecEntry}>
                    <img alt={entry.value} className={classes.quickSpecEntryIcon} src={entry.icon} />
                    <Typography className={classes.quickSpecEntryText} variant="button">{entry.value}</Typography>
                  </div>
                )}
              </div>
            }
            <div className={classes.textFirstLine}>
              {/* {tokenCollectionName &&
                <Typography variant="subtitle1" className={[classes.collectionName].join(" ")}>
                  {tokenCollectionName}
                </Typography>
              } */}
              <Typography variant="h6" className={[classes.title].join(" ")}>
                {tokenTitle}
              </Typography>
              {listingRecord?.id && !selectable && 
                <div className={[classes.likeContainer, 'secondary-text-light-mode'].join(" ")}>
                  <PropyKeysHomeListingLikeZoneContainer compact={true} propyKeysHomeListingId={listingRecord?.id.toString()} />
                </div>
              }
            </div>
            
            {/* {listingRecord?.price &&
              <Typography variant="subtitle1" className={[classes.collectionName].join(" ")}>
                {priceFormat(`${listingRecord?.price}`, 2, "$")}
              </Typography>
            } */}
          </div>
        </CardActionArea>
      </LinkWrapper>
    </Card>
  )
}

export default SingleTokenCardBaseline;