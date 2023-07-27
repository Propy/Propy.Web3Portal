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

import {
  IBalanceRecord,
  IAssetRecord,
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
  balanceRecord: IBalanceRecord,
  assetRecord: IAssetRecord,
}

const SingleTokenCard = (props: ISingleTokenCardProps) => {

  const {
    assetRecord,
    balanceRecord,
  } = props;

  const [tokenImage, setTokenImage] = useState('');
  const [tokenTitle, setTokenTitle] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [tokenCollectionName, setTokenCollectionName] = useState('');
  const [tokenStandard, setTokenStandard] = useState('');
  const [tokenLink, setTokenLink] = useState('');

  useEffect(() => {
    console.log({assetRecord, balanceRecord})
    let tokenRecordMetadata = balanceRecord.nft?.metadata ? JSON.parse(balanceRecord.nft?.metadata) : {};
    console.log("balanceRecord.nft?.metadata", balanceRecord.nft?.metadata);
    if(balanceRecord.asset?.standard) {
      setTokenStandard(balanceRecord.asset.standard);
    }
    if(assetRecord?.standard === "ERC-721") {
      if(tokenRecordMetadata?.image) {
        setTokenImage(getResolvableIpfsLink(tokenRecordMetadata?.image));
      }
      if(tokenRecordMetadata?.name) {
        setTokenTitle(tokenRecordMetadata?.name);
      }
      if(balanceRecord.token_id) {
        setTokenId(`# ${balanceRecord.token_id}`);
      }
      setTokenLink(`token/${balanceRecord.network_name}/${balanceRecord.asset_address}/${balanceRecord.token_id}`);
    } else if (assetRecord?.standard === "ERC-20") {
      setTokenImage(DefaultTokenImage);
      let balance = priceFormat(Number(utils.formatUnits(balanceRecord.balance, assetRecord.decimals)), 2, "PRO", false);
      setTokenTitle(balance);
      setTokenLink(`token/${balanceRecord.network_name}/${balanceRecord.asset_address}`);
    }
    if(assetRecord?.name) {
      setTokenCollectionName(assetRecord?.name);
    }
  }, [balanceRecord, assetRecord])

  const classes = useStyles();

  return (
    <Card style={{width: '100%', height: '290px'}}>
      <LinkWrapper link={tokenLink ? tokenLink : `./`}>
        <CardActionArea className={classes.actionArea}>
          {tokenImage && 
            <CardMedia
              component="img"
              height="200"
              image={tokenImage}
              alt="featured property media"
            />
          }
          <div className={classes.chipContainer}>
            <div className={classes.leftChips}>
              {tokenStandard && <Chip className={classes.chip} color="primary" label={tokenStandard} size="small" />}
            </div>
            <div className={classes.rightChips}>
              {tokenId && <Chip className={classes.chip} color="primary" label={tokenId} size="small" />}
            </div>
          </div>
          <div className={classes.typographyZone}>
            <Typography variant="h5" className={[classes.title].join(" ")}>
              {tokenTitle}
            </Typography>
            {tokenCollectionName &&
              <Typography variant="subtitle1" className={[classes.collectionName].join(" ")}>
                {tokenCollectionName}
              </Typography>
            }
          </div>
        </CardActionArea>
      </LinkWrapper>
    </Card>
  )
}

export default SingleTokenCard;