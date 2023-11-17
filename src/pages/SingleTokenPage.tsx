import React, { useEffect, useState } from 'react';

import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import Grid from '@mui/material/Grid';

import { useParams } from 'react-router-dom';

import { toast } from 'sonner'

import GenericPageContainer from '../containers/GenericPageContainer';
import TokenInfoAccordionContainer from '../containers/TokenInfoAccordionContainer';
import GenericTitleContainer from '../containers/GenericTitleContainer';
import EventHistoryContainer from '../containers/EventHistoryContainer';
import TokenMetadataTimelineContainer from '../containers/TokenMetadataTimelineContainer';
import SignalInterestContainer from '../containers/SignalInterestContainer';

import LinkWrapper from '../components/LinkWrapper';

import PlaceholderImage from '../assets/img/placeholder.webp';
import DefaultTokenImage from '../assets/img/default-token.webp';

import RefreshIcon from '@mui/icons-material/Refresh';

import {
  NFTService,
} from '../services/api';

import {
  IAssetRecord,
  ITokenMetadata,
  ITransferEventERC20Record,
  ITransferEventERC721Record,
  TokenStandard,
} from '../interfaces';

import {
  API_ENDPOINT,
  TOKEN_NAME_PREFIX,
  TOKEN_NAME_HIDE_ID,
  PROPY_LIGHT_BLUE,
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

    const [tokenRecord, setTokenRecord] = useState<IAssetRecord | null>(null);
    const [tokenEventRecord, setTokenEventRecord] = useState<ITransferEventERC721Record[] | ITransferEventERC20Record[] | null>(null);
    const [tokenMetadata, setTokenMetadata] = useState<ITokenMetadata | null>(null);
    const [fetchIndex, setFetchIndex] = useState<number>(0);
    const [isMetadataRefreshing, setIsMetadataRefreshing] = useState<boolean>(false);
    const [tokenStandard, setTokenStandard] = useState<TokenStandard | null>(null);
    const [allowSignalInterest] = useState(true);

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
          queryUrl = `${API_ENDPOINT}/nft/${network}/${tokenAddress}/${tokenId}`;
        }
        let tokenRecordQueryResponse = await fetch(queryUrl).then(resp => resp.json());
        if(tokenRecordQueryResponse?.status && tokenRecordQueryResponse?.data && isMounted) {
          setTokenRecord(tokenRecordQueryResponse?.data?.asset ? tokenRecordQueryResponse?.data?.asset : tokenRecordQueryResponse?.data);
          setTokenStandard(tokenRecordQueryResponse?.data?.asset ? tokenRecordQueryResponse?.data?.asset?.standard : tokenRecordQueryResponse?.data?.standard);
          if(tokenRecordQueryResponse?.data?.transfer_event_erc20_count) {
            MetadataPRO.attributes.push({
              trait_type: "Transfers",
              value: priceFormat(tokenRecordQueryResponse?.data?.transfer_event_erc20_count, 0, ''),
            })
          }
          if(tokenRecordQueryResponse?.data?.transfer_events_erc721) {
            setTokenEventRecord(tokenRecordQueryResponse?.data?.transfer_events_erc721);
          }
          if(tokenRecordQueryResponse?.data?.transfer_events_erc20) {
            setTokenEventRecord(tokenRecordQueryResponse?.data?.transfer_events_erc20);
          }
          if(tokenRecordQueryResponse?.data?.metadata) {
            let metadata = JSON.parse(tokenRecordQueryResponse?.data?.metadata);
            // // temp timeline shim for testing design
            // if(network === 'goerli') {
            //   metadata.timeline = [
            //     {
            //       milestone: "Offer signed",
            //       due_date: 1695301253,
            //       complete: false,
            //     },
            //     {
            //       milestone: "Deposit payment",
            //       due_date: 1695819674,
            //       complete: false,
            //     },
            //     {
            //       milestone: "Inspection",
            //       due_date: 1696424490,
            //       complete: false,
            //       is_estimate: true,
            //     },
            //     {
            //       milestone: "Closing",
            //       due_date: 1697029313,
            //       complete: false,
            //     }
            //   ]
            // }
            if(metadata && metadata.name !== null && isMounted) {
              setTokenMetadata(metadata);
            }
          }
        } else if(isMounted) {
          setTokenRecord(null);
          setTokenMetadata(null);
          setTokenStandard(null);
          setTokenEventRecord(null);
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
          let refreshMetadataResponse = await NFTService.refreshMetadata(network, tokenAddress, tokenId);
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
                <div className={classes.tokenImage} style={{backgroundImage: `url("${tokenMetadata?.image ? getResolvableIpfsLink(tokenMetadata?.image) : PlaceholderImage}")`}}/>
                {tokenMetadata?.attributes && tokenMetadata?.attributes?.length > 0 && 
                  <div className={classes.sectionSpacer}>
                    <TokenInfoAccordionContainer tokenRecord={tokenRecord} tokenMetadata={tokenMetadata} />
                  </div>
                }
              </Grid>
              <Grid item xs={12} md={7}>
                {tokenRecord &&
                  <>
                    <LinkWrapper link={`collection/${tokenRecord.network_name}/${tokenRecord.slug}`}>
                      <Typography variant="h6" style={{color: PROPY_LIGHT_BLUE}}>
                        {
                          `${tokenRecord.collection_name ? tokenRecord.collection_name : tokenRecord.name} `
                        }
                      </Typography>
                    </LinkWrapper>
                    <Typography variant="h3" style={{fontWeight: 'bold'}}>
                      {
                        tokenMetadata && `${TOKEN_NAME_PREFIX[tokenRecord.address] ? `${TOKEN_NAME_PREFIX[tokenRecord.address]} ${tokenMetadata.name}` : tokenMetadata.name}`
                      }
                      {
                        TOKEN_NAME_HIDE_ID[tokenRecord.address] && tokenMetadata ? '' : ` #${tokenId}`
                      }
                    </Typography>
                    <div className={[classes.actionInfoContainer, 'secondary-text-light-mode'].join(" ")}>
                      <div className={[classes.actionInfoEntry, 'clickable', isMetadataRefreshing ? 'disable-click' : ''].join(" ")} onClick={() => refreshTokenMetadata()}>
                        {!isMetadataRefreshing && <RefreshIcon className={classes.actionInfoEntryIcon} />}
                        {isMetadataRefreshing && <CircularProgress className={classes.actionInfoProgressIcon} style={{width: 18, height: 18}} color="inherit"/>}
                        <Typography variant="body1" className={classes.actionInfoEntryText}>Refresh Metadata</Typography>
                      </div>
                    </div>
                    {tokenMetadata?.description &&
                      <>
                        <GenericTitleContainer variant={"h5"} paddingBottom={8} marginTop={24} title="Description"/>
                        <Typography variant="body1">{tokenMetadata?.description}</Typography>
                      </>
                    }
                    {tokenMetadata?.timeline && tokenMetadata?.timeline.length > 0 &&
                      <>
                        <GenericTitleContainer variant={"h5"} paddingBottom={8} marginTop={24} title="Transaction Timeline"/>
                        <TokenMetadataTimelineContainer timeline={tokenMetadata?.timeline} />
                      </>
                    }
                    <GenericTitleContainer variant={"h5"} paddingBottom={8} marginTop={24} marginBottom={12} title="History"/>
                    {tokenEventRecord && <EventHistoryContainer eventRecords={tokenEventRecord} assetRecord={tokenRecord} />}
                    {allowSignalInterest && tokenId && tokenAddress && network && 
                      <>
                        <GenericTitleContainer variant={"h5"} paddingBottom={8} marginTop={24} marginBottom={12} title="Make an Offer"/>
                        <SignalInterestContainer tokenId={tokenId} tokenAddress={tokenAddress} tokenNetwork={network} />
                      </>
                    }
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
                    {tokenRecord?.transfer_events_erc20 && <EventHistoryContainer eventRecords={tokenRecord?.transfer_events_erc20} assetRecord={tokenRecord} />}
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