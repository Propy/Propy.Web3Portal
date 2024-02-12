import React, { useState, useEffect } from 'react'

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import { utils } from "ethers";

import NFTLikeZoneContainer from '../containers/NFTLikeZoneContainer';

import DefaultTokenImage from '../assets/img/default-token.webp';
import PlaceholderImage from '../assets/img/placeholder.webp';

import {
  IBalanceRecord,
  IAssetRecord,
  INFTRecord,
} from '../interfaces';

import {
  getResolvableIpfsLink,
  priceFormat,
} from '../utils';

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
      alignItems: 'end',
    },
    disabledActionArea: {
      opacity: 0.5,
      pointerEvents: 'none',
    }
  }),
);

interface ISingleTokenCardProps {
  balanceRecord?: IBalanceRecord,
  assetRecord: IAssetRecord,
  nftRecord?: INFTRecord,
  selectable?: boolean,
  onBalanceRecordSelected?: (balanceRecord: IBalanceRecord) => void,
  selected?: boolean,
  disabled?: boolean,
}

const SingleTokenCard = (props: ISingleTokenCardProps) => {

  const {
    assetRecord,
    balanceRecord,
    nftRecord,
    selectable,
    onBalanceRecordSelected,
    selected,
    disabled,
  } = props;

  const [tokenImage, setTokenImage] = useState(PlaceholderImage);
  const [tokenTitle, setTokenTitle] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [tokenCollectionName, setTokenCollectionName] = useState('');
  const [tokenContractAddress, setTokenContractAddress] = useState<false | string>(false);
  const [tokenNetwork, setTokenNetwork] = useState<false | string>(false);
  const [tokenStandard, setTokenStandard] = useState('');
  const [tokenLink, setTokenLink] = useState('');

  useEffect(() => {
    let tokenRecordMetadata;
    let useRecord;
    if(balanceRecord) {
      tokenRecordMetadata = balanceRecord.nft?.metadata ? balanceRecord.nft?.metadata : {};
      useRecord = balanceRecord;
      if (assetRecord?.standard === "ERC-20") {
        setTokenImage(DefaultTokenImage);
        let balance = priceFormat(Number(utils.formatUnits(useRecord.balance, assetRecord.decimals)), 2, "PRO", false);
        setTokenTitle(balance);
        setTokenLink(`token/${useRecord.network_name}/${useRecord.asset_address}`);
      }
    } else if (nftRecord) {
      tokenRecordMetadata = nftRecord.metadata ? nftRecord.metadata : {};
      useRecord = nftRecord;
    }
    if(useRecord) {
      if(useRecord.asset?.standard) {
        setTokenStandard(useRecord.asset.standard);
        setTokenContractAddress(useRecord.asset.address);
        setTokenNetwork(useRecord.network_name);
      }
      if(assetRecord?.standard === "ERC-721") {
        if(tokenRecordMetadata?.image) {
          setTokenImage(getResolvableIpfsLink(tokenRecordMetadata?.image));
        } else {
          setTokenImage(PlaceholderImage);
        }
        if(tokenRecordMetadata?.name) {
          setTokenTitle(tokenRecordMetadata?.name);
        }
        if(useRecord.token_id) {
          setTokenId(useRecord.token_id);
        }
        setTokenLink(`token/${useRecord.network_name}/${useRecord.asset_address}/${useRecord.token_id}`);
      }
    } else {
      setTokenContractAddress(false);
      setTokenNetwork(false);
    }
    if(assetRecord) {
      if(assetRecord?.collection_name) {
        setTokenCollectionName(assetRecord?.collection_name);
      } else if(assetRecord?.name) {
        setTokenCollectionName(assetRecord?.name);
      }
    }
  }, [balanceRecord, assetRecord, nftRecord])

  const classes = useStyles();

  return (
    <Card 
      className={disabled ? classes.disabledActionArea : ""}
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

export default SingleTokenCard;