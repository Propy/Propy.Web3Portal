import React, { useEffect, useState } from 'react';

import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import Grid from '@mui/material/Grid';

import { useParams } from 'react-router-dom';

import { useEthers } from '@usedapp/core';

import { toast } from 'sonner'

import GenericPageContainer from '../containers/GenericPageContainer';
import TokenInfoAccordionContainer from '../containers/TokenInfoAccordionContainer';
import GenericTitleContainer from '../containers/GenericTitleContainer';
import EventHistoryContainer from '../containers/EventHistoryContainer';

import DefaultTokenImage from '../assets/img/default-token.webp';

import RefreshIcon from '@mui/icons-material/Refresh';

import {
  AssetService,
} from '../services/api';

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
    },
    actionInfoContainer: {

    },
    actionInfoEntry: {
      display: 'flex',
      alignItems: 'center',
    },
    actionInfoEntryIcon: {
      marginRight: 4,
    },
    actionInfoProgressIcon: {
      marginRight: 10,
    },
    actionInfoEntryText: {
      fontWeight: 500,
    }
  }),
);

const MetadataPRO = {
  name: "PRO",
  image: '',
  attributes: [
    {
      trait_type: 'Standard',
      value: 'ERC-20',
    },
    {
      trait_type: 'Max Supply',
      value: '100,000,000',
    },
    {
      // TODO index circ supply on backend
      trait_type: 'Circulating Supply',
      value: '57,896,591',
    }
  ]
}

const SingleTokenPage = () => {
    const classes = useStyles();
    const { account } = useEthers();

    const [tokenRecord, setTokenRecord] = useState<IAssetRecord | null>(null);
    const [tokenMetadata, setTokenMetadata] = useState<ITokenMetadata | null>(null);
    const [fetchIndex, setFetchIndex] = useState<number>(0);
    const [isMetadataRefreshing, setIsMetadataRefreshing] = useState<boolean>(false);
    const [tokenStandard, setTokenStandard] = useState<string | null>(null);

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
          setTokenStandard(tokenRecordQueryResponse?.data?.standard);
          if(tokenRecordQueryResponse?.data?.transfer_event_erc20_count) {
            MetadataPRO.attributes.push({
              trait_type: "Transfers",
              value: priceFormat(tokenRecordQueryResponse?.data?.transfer_event_erc20_count, 0, ''),
            })
          }
          if(tokenRecordQueryResponse?.data?.balance_record?.[0]?.metadata) {
            let metadata = JSON.parse(tokenRecordQueryResponse?.data?.balance_record?.[0]?.metadata);
            if(metadata && isMounted) {
              setTokenMetadata(metadata);
            }
          }
        } else if(isMounted) {
          setTokenRecord(null);
          setTokenMetadata(null);
          setTokenStandard(null);
        }
      }
      fetchToken();
      return () => {
        isMounted = false;
      }
    }, [network, tokenAddress, tokenId, fetchIndex])

    const refreshTokenMetadata = async () => {
      if(network && tokenAddress && tokenId) {
        try {
          setIsMetadataRefreshing(true);
          let refreshMetadataResponse = await AssetService.refreshMetadata(network, tokenAddress, tokenId);
          if(refreshMetadataResponse?.data?.message) {
            await toast.success(refreshMetadataResponse?.data?.message);
            // trigger refetch of token record / metadata
            setFetchIndex(fetchIndex + 1);
          }
        } catch (e) {
          console.log({e});
        }
      }
      setIsMetadataRefreshing(false);
    }

    return (
        <GenericPageContainer>
          {(!tokenStandard || tokenStandard === 'ERC-721') &&
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
                    <div className={[classes.actionInfoContainer, 'secondary-text-light-mode'].join(" ")}>
                      <div className={[classes.actionInfoEntry, 'clickable', isMetadataRefreshing ? 'disable-click' : ''].join(" ")} onClick={() => refreshTokenMetadata()}>
                        {!isMetadataRefreshing && <RefreshIcon className={classes.actionInfoEntryIcon} />}
                        {isMetadataRefreshing && <CircularProgress className={classes.actionInfoProgressIcon} style={{width: 18, height: 18}} color="inherit"/>}
                        <Typography variant="body1" className={classes.actionInfoEntryText}>Refresh Metadata</Typography>
                      </div>
                    </div>
                    <GenericTitleContainer variant={"h5"} paddingBottom={8} marginBottom={12} title="History"/>
                    {tokenRecord && tokenRecord?.transfer_events_erc721 && <EventHistoryContainer eventRecords={tokenRecord?.transfer_events_erc721} />}
                  </>
                }
              </Grid>
            </Grid>
          }
          {(tokenStandard === 'ERC-20') &&
            <Grid container spacing={6} columns={12}>
              <Grid item xs={12} md={5}>
                <div className={classes.tokenImage} style={{backgroundImage: `url("${DefaultTokenImage}")`}}/>
                <div className={classes.sectionSpacer}>
                  <TokenInfoAccordionContainer tokenRecord={tokenRecord} tokenMetadata={MetadataPRO} />
                </div>
              </Grid>
              <Grid item xs={12} md={7}>
                {tokenRecord &&
                  <>
                    <Typography variant="h2" style={{fontWeight: 'bold'}}>{`PRO Token`}</Typography>
                    {/* <div className={[classes.actionInfoContainer, 'secondary-text-light-mode'].join(" ")}>
                      <div className={[classes.actionInfoEntry, 'clickable', isMetadataRefreshing ? 'disable-click' : ''].join(" ")} onClick={() => refreshTokenMetadata()}>
                        {!isMetadataRefreshing && <RefreshIcon className={classes.actionInfoEntryIcon} />}
                        {isMetadataRefreshing && <CircularProgress className={classes.actionInfoProgressIcon} style={{width: 18, height: 18}} color="inherit"/>}
                        <Typography variant="body1" className={classes.actionInfoEntryText}>Refresh Metadata</Typography>
                      </div>
                    </div> */}
                    <GenericTitleContainer variant={"h5"} paddingBottom={8} marginBottom={12} marginTop={16} title="History"/>
                    {tokenRecord && tokenRecord?.transfer_events_erc20 && <EventHistoryContainer eventRecords={tokenRecord?.transfer_events_erc20} />}
                  </>
                }
              </Grid>
            </Grid>
          }
          {/* {`tokenRecord:`}
          <pre style={{maxWidth: '500px', overflow: 'scroll'}}>
            {JSON.stringify(tokenRecord, null, 4)}
          </pre>
          {`tokenMetadata:`}
          <pre style={{maxWidth: '500px', overflow: 'scroll'}}>
            {JSON.stringify(tokenMetadata, null, 4)}
          </pre> */}
        </GenericPageContainer>
    )
};

export default SingleTokenPage;