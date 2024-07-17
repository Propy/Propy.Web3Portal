import React from 'react'

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import NFTLikeZoneContainer from '../containers/NFTLikeZoneContainer';

import PlaceholderImage from '../assets/img/placeholder.webp';

import {
  IBalanceRecord,
} from '../interfaces';

import {
  PROPY_LIGHT_BLUE,
} from '../utils/constants';

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
    }
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
    tokenStandard,
    tokenId,
    tokenCollectionName,
    tokenContractAddress,
    tokenNetwork,
    tokenTitle,
  } = props;

  const classes = useStyles();

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
      height: '298px',
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
            height="200"
            image={tokenImage ? tokenImage : PlaceholderImage}
            style={{position: 'absolute'}}
            alt="featured property media"
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.src=PlaceholderImage;
            }}
          />
          <div style={{height: 200}}></div>
          <div className={classes.chipContainer}>
            <div className={classes.leftChips}>
              {tokenStandard && <Chip className={classes.chip} color="primary" label={tokenStandard} size="small" />}
            </div>
            <div className={classes.rightChips}>
              {tokenId && <Chip className={classes.chip} color="primary" label={`# ${tokenId}`} size="small" />}
            </div>
          </div>
          <div className={classes.typographyZone}>
            <div className={classes.textFirstLine}>
              {tokenCollectionName &&
                <Typography variant="subtitle1" className={[classes.collectionName].join(" ")}>
                  {tokenCollectionName}
                </Typography>
              }
              {tokenId && tokenContractAddress && tokenNetwork && !selectable && 
                <div className={[classes.likeContainer, 'secondary-text-light-mode'].join(" ")}>
                  <NFTLikeZoneContainer compact={true} tokenId={tokenId} tokenAddress={tokenContractAddress} tokenNetwork={tokenNetwork} />
                </div>
              }
            </div>
            <Typography variant="h6" className={[classes.title].join(" ")}>
              {tokenTitle}
            </Typography>
          </div>
        </CardActionArea>
      </LinkWrapper>
    </Card>
  )
}

export default SingleTokenCardBaseline;