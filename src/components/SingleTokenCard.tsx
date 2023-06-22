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
  IBalanceRecord
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
  tokenRecord: IBalanceRecord,
}

const SingleTokenCard = (props: ISingleTokenCardProps) => {

  const {
    tokenRecord,
  } = props;

  const [tokenImage, setTokenImage] = useState('');
  const [tokenTitle, setTokenTitle] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [tokenCollectionName, setTokenCollectionName] = useState('');
  const [tokenStandard, setTokenStandard] = useState('');
  const [tokenLink, setTokenLink] = useState('');

  useEffect(() => {
    let tokenRecordMetadata = JSON.parse(tokenRecord.metadata);
    if(tokenRecord.asset?.standard) {
      setTokenStandard(tokenRecord.asset.standard);
    }
    if(tokenRecord.asset?.standard === "ERC-721") {
      if(tokenRecordMetadata?.image) {
        setTokenImage(getResolvableIpfsLink(tokenRecordMetadata?.image));
      }
      if(tokenRecordMetadata?.name) {
        setTokenTitle(tokenRecordMetadata?.name);
      }
      if(tokenRecord.token_id) {
        setTokenId(`# ${tokenRecord.token_id}`);
      }
      setTokenLink(`token/${tokenRecord.network_name}/${tokenRecord.asset_address}/${tokenRecord.token_id}`);
    } else if (tokenRecord.asset?.standard === "ERC-20") {
      setTokenImage(DefaultTokenImage);
      let balance = priceFormat(Number(utils.formatUnits(tokenRecord.balance, tokenRecord.asset.decimals)), 2, "PRO", false);
      setTokenTitle(balance);
      setTokenLink(`token/${tokenRecord.network_name}/${tokenRecord.asset_address}`);
    }
    if(tokenRecord?.asset?.name) {
      setTokenCollectionName(tokenRecord?.asset?.name);
    }
  }, [tokenRecord])

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