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
    }
  }),
);

interface ISingleTokenCardProps {
  balanceRecord?: IBalanceRecord,
  assetRecord: IAssetRecord,
  nftRecord?: INFTRecord,
}

const SingleTokenCard = (props: ISingleTokenCardProps) => {

  const {
    assetRecord,
    balanceRecord,
    nftRecord,
  } = props;

  const [tokenImage, setTokenImage] = useState(PlaceholderImage);
  const [tokenTitle, setTokenTitle] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [tokenCollectionName, setTokenCollectionName] = useState('');
  const [tokenStandard, setTokenStandard] = useState('');
  const [tokenLink, setTokenLink] = useState('');

  useEffect(() => {
    console.log({assetRecord, balanceRecord})
    let tokenRecordMetadata;
    let useRecord;
    if(balanceRecord) {
      tokenRecordMetadata = balanceRecord.nft?.metadata ? JSON.parse(balanceRecord.nft?.metadata) : {};
      useRecord = balanceRecord;
      if (assetRecord?.standard === "ERC-20") {
        setTokenImage(DefaultTokenImage);
        let balance = priceFormat(Number(utils.formatUnits(useRecord.balance, assetRecord.decimals)), 2, "PRO", false);
        setTokenTitle(balance);
        setTokenLink(`token/${useRecord.network_name}/${useRecord.asset_address}`);
      }
    } else if (nftRecord) {
      tokenRecordMetadata = nftRecord.metadata ? JSON.parse(nftRecord.metadata) : {};
      useRecord = nftRecord;
    }
    if(useRecord) {
      if(useRecord.asset?.standard) {
        setTokenStandard(useRecord.asset.standard);
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
          setTokenId(`# ${useRecord.token_id}`);
        }
        setTokenLink(`token/${useRecord.network_name}/${useRecord.asset_address}/${useRecord.token_id}`);
      }
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
    <Card style={{width: '100%', height: '290px'}}>
      <LinkWrapper link={tokenLink ? tokenLink : `./`}>
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
              {tokenId && <Chip className={classes.chip} color="primary" label={tokenId} size="small" />}
            </div>
          </div>
          <div className={classes.typographyZone}>
            {tokenCollectionName &&
              <Typography variant="subtitle1" className={[classes.collectionName].join(" ")}>
                {tokenCollectionName}
              </Typography>
            }
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