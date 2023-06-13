import React, { useState, useEffect } from 'react'

import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';

import { utils } from "ethers";

import DefaultTokenImage from '../assets/img/default-token.webp';

import {
  IBalanceRecord
} from '../interfaces';

import {
  getResolvableIpfsLink,
  priceFormat,
} from '../utils';

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
  const [tokenCollectionName, setTokenCollectionName] = useState('');

  useEffect(() => {
    let tokenRecordMetadata = JSON.parse(tokenRecord.metadata);
    if(tokenRecord.asset?.standard === "ERC-721") {
      if(tokenRecordMetadata?.image) {
        setTokenImage(getResolvableIpfsLink(tokenRecordMetadata?.image));
      }
      if(tokenRecordMetadata?.name) {
        setTokenTitle(tokenRecordMetadata?.name);
      }
    } else if (tokenRecord.asset?.standard === "ERC-20") {
      let balance = priceFormat(Number(utils.formatUnits(tokenRecord.balance, tokenRecord.asset.decimals)), 2, "PRO", false);
      setTokenTitle(balance);
    }
    if(tokenRecord?.asset?.name) {
      setTokenCollectionName(tokenRecord?.asset?.name);
    }
  }, [tokenRecord])

  const classes = useStyles();

  return (
    <Card style={{width: '100%', height: '290px'}}>
      <CardActionArea className={classes.actionArea}>
        <CardMedia
          component="img"
          height="200"
          image={tokenImage ? tokenImage : DefaultTokenImage}
          alt="featured property media"
        />
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
    </Card>
  )
}

export default SingleTokenCard;