import React, { useState } from 'react';

import { shortenAddress } from '@usedapp/core'

import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import createStyles from '@mui/styles/createStyles';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import IconButton from '@mui/material/IconButton';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FilterIcon from '@mui/icons-material/FilterList';

import { PropsFromRedux } from '../containers/TokenInfoAccordionContainer';

import LinkWrapper from './LinkWrapper';

import {
  IAssetRecord,
  ITokenMetadata,
} from '../interfaces';

import {
  isAddress,
  isIPFSMultiHash,
  getResolvableIpfsLinkFromPlainMultiHash,
  toChecksumAddress,
} from '../utils';

import {
  PROPY_LIGHT_BLUE,
  PROPY_LIGHT_GREY,
  VALID_PROPYKEYS_COLLECTION_NAMES_OR_ADDRESSES,
} from '../utils/constants';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
        position: 'relative',
    },
    content: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
    },
    sectionItem: {
      transition: 'all 0.2s ease-in-out',
      backgroundColor: "#FFFFFF",
      width: '100%',
      padding: 0,
      borderRadius: '20px!important',
      marginBottom: theme.spacing(2),
      marginTop: '0px!important',
      boxShadow: 'none',
      border: `2px solid ${PROPY_LIGHT_GREY}`,
      overflow: 'hidden',
    },
    sectionItemOpened: {
      // backgroundColor: "#000000cc!important",
    },
    sectionItemSummary: {
      margin: '0px!important',
      minHeight: '0px!important',
    },
    sectionItemOpenedSummary: {
      backgroundColor: `${PROPY_LIGHT_GREY}!important`,
      minHeight: '0px!important',
    },
    summaryIcon: {
      marginRight: theme.spacing(1),
    },
    attributeContainer: {
      backgroundColor: PROPY_LIGHT_GREY,
      padding: theme.spacing(1),
      borderRadius: 12,
    },
    attributeText: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    attributeNameAndPrefilterRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }
  }),
);

let sections = [
  {
    sectionId: "attributes",
    sectionTitle: "Asset properties",
  },
]

interface IPresetFilter {[key: string]: (arg0: string) => string};

let propyKeysFilterableAttributes = {
  'Owner': (owner: string) => `?owner=${toChecksumAddress(owner)}`,
  'City': (city: string) => `?city=${city}`,
  'Country': (country: string) => `?country=${country}`,
  'Attached Deed': (attachedDeedValue: string) => isIPFSMultiHash(attachedDeedValue) ? `?attached_deed=true` : `?attached_deed=true`, // in the meantime setting both default filters to true, unless we decide to want to filter by records that don't have a deed attached
  'Landmark': (landmarkValue: string) => `?landmark=${Boolean(landmarkValue)}`,
  'Status': (status: string) => `?status=${status}`,
}

let collectionSlugToAttributeToPresetFilter : {[key: string]: IPresetFilter} = {};

for(let slugOrAddress of VALID_PROPYKEYS_COLLECTION_NAMES_OR_ADDRESSES) {
  collectionSlugToAttributeToPresetFilter[slugOrAddress] = propyKeysFilterableAttributes;
}

interface ITokenInfoAccordian {
  tokenRecord: IAssetRecord | null
  tokenMetadata: ITokenMetadata | null
}

const TokenInfoAccordion = (props: PropsFromRedux & ITokenInfoAccordian) => {
    const classes = useStyles();

    const {
      tokenRecord,
      tokenMetadata,
    } = props;

    const [expandedSectionIndex, setExpandedSectionIndex] = useState<number | null>(0);

    const toggleSectionIndexExpansion = (sectionIndex: number) => {
      if(sectionIndex === expandedSectionIndex) {
        setExpandedSectionIndex(null);
      } else {
        setExpandedSectionIndex(sectionIndex);
      }
    }

    const formatPropertyValue = (value: string) => {
      if(isAddress(value)) {
        return shortenAddress(value);
      }
      return value;
    }

    const renderAttribute = (value: string) => {
      if(value) {
        if(value.indexOf("https://") === 0) {
          return (
            <LinkWrapper external={true} link={value}>
              <Typography className={classes.attributeText} style={{fontWeight: 'bold', fontSize: '18px', color: PROPY_LIGHT_BLUE}} variant="subtitle2">{formatPropertyValue(value)}</Typography>
            </LinkWrapper>
          )
        }
        if(isIPFSMultiHash(value)) {
          return (
            <LinkWrapper external={true} link={getResolvableIpfsLinkFromPlainMultiHash(value)}>
              <Typography className={classes.attributeText} style={{fontWeight: 'bold', fontSize: '18px', color: PROPY_LIGHT_BLUE}} variant="subtitle2">{formatPropertyValue(value)}</Typography>
            </LinkWrapper>
          )
        }
        return <Typography className={classes.attributeText} style={{fontWeight: 'bold', fontSize: '18px'}} variant="subtitle2">{formatPropertyValue(value)}</Typography>
      }
    }

    return (
        <>
          <div className={classes.root}>
              <div className={classes.content}>
                {sections && sections.map((item, index) => 
                  <Accordion 
                    expanded={expandedSectionIndex === index}
                    onChange={() => toggleSectionIndexExpansion(index)}
                    className={[classes.sectionItem, expandedSectionIndex === index ? classes.sectionItemOpened : ''].join(' ')}
                    key={`token-info-accordion-${item.sectionTitle}-${index}`}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`section-index-${index}`}
                      id={`section-index-${index}`}
                      className={[expandedSectionIndex === index ? classes.sectionItemOpenedSummary : '', classes.sectionItemSummary].join(' ')}
                      sx={{
                        '& .MuiAccordionSummary-content': {
                          marginTop: '16px',
                          marginBottom: '16px',
                          display: 'flex',
                          alignItems: 'center',
                        }
                      }}
                    >
                      <FormatListBulletedIcon className={classes.summaryIcon}/> <Typography style={{fontWeight: 'bold'}} variant="h6">{item.sectionTitle}</Typography>
                    </AccordionSummary>
                    <AccordionDetails
                      sx={{
                        padding: '16px',
                      }}
                    >
                      {item.sectionId === 'attributes' && tokenMetadata?.attributes && (tokenMetadata?.attributes.length > 0) && 
                        <Grid container spacing={2} columns={12}>
                          {tokenMetadata?.attributes.map((attributeEntry, attributeIndex) => {
                            let attributeValue = renderAttribute(attributeEntry.value);
                            if(attributeValue) {
                              return (
                                <Grid item xs={12} sm={6} lg={6} xl={6} key={`token-info-accordion-${item.sectionId}-${index}-${attributeIndex}`}>
                                  <div className={classes.attributeContainer}>
                                    <div className={classes.attributeNameAndPrefilterRow}>
                                      <Typography className={classes.attributeText} style={{fontWeight: 400}} variant="subtitle2">{attributeEntry.trait_type}</Typography>
                                      {tokenRecord && tokenRecord.slug && collectionSlugToAttributeToPresetFilter?.[tokenRecord.slug]?.[attributeEntry.trait_type] &&
                                        <LinkWrapper external={false} link={`collection/${tokenRecord.network_name}/${tokenRecord.address}${collectionSlugToAttributeToPresetFilter[tokenRecord.slug][attributeEntry.trait_type](attributeEntry.value)}`}>
                                          <IconButton aria-label="filter collection by value" size="small">
                                            <FilterIcon fontSize="inherit" />
                                          </IconButton>
                                        </LinkWrapper>
                                      }
                                    </div>
                                    {attributeValue}
                                  </div>
                                </Grid>
                              )
                            }
                            return null;
                          }
                          )}
                        </Grid>
                      }
                    </AccordionDetails>
                  </Accordion>
                )}
              </div>
          </div>
        </>
    )
};

export default TokenInfoAccordion;