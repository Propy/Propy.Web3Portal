import React, { useEffect, useState } from 'react';

import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

import Typography from '@mui/material/Typography';

import Grid from '@mui/material/Grid';

import { useParams } from 'react-router-dom';

import { useEthers } from '@usedapp/core'

import GenericPageContainer from '../containers/GenericPageContainer';
import TokenInfoAccordionContainer from '../containers/TokenInfoAccordionContainer';
import GenericTitleContainer from '../containers/GenericTitleContainer';

import {
  IAssetRecord,
  ITokenMetadata,
} from '../interfaces';

import {
  API_ENDPOINT,
  TOKEN_NAME_PREFIX,
} from '../utils/constants';

import {
  getResolvableIpfsLink,
  priceFormat,
} from '../utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
        minWidth: 275,
        marginBottom: 15,
        marginTop: 15,
    },
    tokenImage: {
      paddingTop: '100%',
      backgroundPosition: 'center',
      backgroundSize: 'contain',
      borderRadius: 20,
    },
    sectionSpacer: {
      marginTop: theme.spacing(2),
    }
  }),
);

const SingleTokenPage = () => {
    const classes = useStyles();
    const { account } = useEthers();

    const [tokenRecord, setTokenRecord] = useState<IAssetRecord | null>(null);
    const [tokenMetadata, setTokenMetadata] = useState<ITokenMetadata | null>(null)

    let { 
      network,
      tokenAddress,
      tokenId,
    } = useParams();

    useEffect(() => {
      let isMounted = true;
      const fetchToken = async () => {
        let queryUrl = `${API_ENDPOINT}/asset/${network}/${tokenAddress}`;
        if(tokenId) {
          queryUrl += `/${tokenId}`;
        }
        let tokenRecordQueryResponse = await fetch(queryUrl).then(resp => resp.json());
        if(tokenRecordQueryResponse?.status && tokenRecordQueryResponse?.data && isMounted) {
          setTokenRecord(tokenRecordQueryResponse?.data);
          if(tokenRecordQueryResponse?.data?.balance_record?.[0]?.metadata) {
            let metadata = JSON.parse(tokenRecordQueryResponse?.data?.balance_record?.[0]?.metadata);
            if(metadata && isMounted) {
              setTokenMetadata(metadata);
            }
          }
        } else if(isMounted) {
          setTokenRecord(null);
          setTokenMetadata(null);
        }
      }
      fetchToken();
      return () => {
        isMounted = false;
      }
    }, [network, tokenAddress, tokenId])

    return (
        <GenericPageContainer>
          <Grid container spacing={6} columns={12}>
            <Grid item xs={12} md={5}>
              <div className={classes.tokenImage} style={{backgroundImage: `url("${tokenMetadata?.image ? getResolvableIpfsLink(tokenMetadata?.image) : ""}")`}}/>
              <div className={classes.sectionSpacer}>
                <TokenInfoAccordionContainer tokenRecord={tokenRecord} tokenMetadata={tokenMetadata} />
              </div>
            </Grid>
            <Grid item xs={12} md={7}>
              {tokenRecord && tokenMetadata &&
                <>
                  <Typography variant="h2" style={{fontWeight: 'bold'}}>{`${TOKEN_NAME_PREFIX[tokenRecord.address]} #${tokenMetadata.name}`}</Typography>
                  <GenericTitleContainer variant={"h5"} paddingBottom={8} title="History"/>
                </>
              }
            </Grid>
          </Grid>
          {`tokenRecord:`}
          <pre style={{maxWidth: '500px', overflow: 'scroll'}}>
            {JSON.stringify(tokenRecord, null, 4)}
          </pre>
          {`tokenMetadata:`}
          <pre style={{maxWidth: '500px', overflow: 'scroll'}}>
            {JSON.stringify(tokenMetadata, null, 4)}
          </pre>
        </GenericPageContainer>
    )
};

export default SingleTokenPage;