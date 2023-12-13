import React, {useState, Fragment} from 'react';
import { useNavigate } from "react-router-dom";

import { useAccount } from 'wagmi';

import makeStyles from '@mui/styles/makeStyles';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Collapse from '@mui/material/Collapse';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TokenIcon from '@mui/icons-material/LocalActivity';
import GovernanceIcon from '@mui/icons-material/Gavel';
import StakingIcon from '@mui/icons-material/Diversity2';
import BridgeIcon from '@mui/icons-material/CompareArrows';
import LiquidityIcon from '@mui/icons-material/AccountBalance';
import ExternalLinkIcon from '@mui/icons-material/Launch';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import { PropsFromRedux } from '../containers/NavigationLeftSideBarContainer';

import LinkWrapper from './LinkWrapper';

import useCurrentPath from '../hooks/useCurrentPath';

import {
  PROPY_LIGHT_BLUE,
  IS_GLOBAL_TOP_BANNER_ENABLED,
  GLOBAL_TOP_BANNER_HEIGHT,
} from '../utils/constants';

interface IMenuEntry {
  text: string
  path?: string
  pathExtended?: string
  icon: any
  externalLink?: string
  onlyConnected?: boolean
  children?: IMenuEntry[]
}

const navigationMenu : IMenuEntry[] = [
  {
    text: 'Dashboard',
    path: '/',
    icon: <DashboardIcon />
  },
  {
    text: 'My Assets',
    path: '/my-assets',
    icon: <AccountBalanceWalletIcon />,
    onlyConnected: true,
  },
  {
    text: 'Stake',
    path: '/stake',
    icon: <StakingIcon />,
  },
  {
    text: 'Bridge',
    path: '/bridge',
    pathExtended: '/bridge/:bridgeSelection',
    icon: <BridgeIcon />,
  },
  {
    text: 'Asset Browser',
    path: '/collections',
    icon: <TokenIcon />
  },
  {
    text: 'Governance',
    path: '/governance',
    externalLink: 'https://snapshot.org/#/propy-gov.eth',
    icon: <GovernanceIcon />
  },
  {
    text: 'Liquidity',
    path: '/liquidity',
    externalLink: 'https://app.unipilot.io/add?vault=0x15a4a47e85aa36fe4ee68e35eedb6bc10489f4af&chainId=1',
    icon: <LiquidityIcon />
  },
  // {
  //   text: 'With Children',
  //   icon: <AccountTreeIcon />,
  //   children: [
  //     {
  //       text: 'Example',
  //       path: '/example',
  //       icon: <ExampleIcon />
  //     },
  //     {
  //       text: 'Home',
  //       path: '/',
  //       icon: <HomeIcon />
  //     },
  //   ]
  // },
];

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
  menuEntryItem: {
    transition: 'all 0.2s ease-in-out',
    fontWeight: '500',
    border: '1px solid transparent',
    borderRadius: 10,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 11,
    paddingRight: 11,
  },
  menuEntryItemDarkMode: {
    color: 'white',
  },
  menuEntryItemLightMode: {
    color: '#111111',
  },
  entryContainerMargin: {
    marginTop: 6,
    marginBottom: 6,
    marginLeft: 11,
    marginRight: 11,
    borderRadius: 10,
  },
  currentSelectionDarkMode: {
    backgroundColor: '#ffffff1a!important',
    borderRadius: 10,
    boxShadow: '0px 0px 20px -1px rgba(0, 0, 0, 0.15)',
  },
  currentSelectionLightMode: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    boxShadow: '0px 0px 20px -1px rgba(0, 0, 0, 0.15)',
  },
  menuIcon: {
    transition: 'all 0.2s ease-in-out',
    minWidth: 'auto',
    marginRight: 15,
  },
  menuIconLightMode: {
    color: "#999999",
  },
  menuIconDarkMode: {
    color: 'white',
  },
  selectedIcon: {
    color: PROPY_LIGHT_BLUE,
  }
});

function NavigationLeftSideBarDesktop(props: PropsFromRedux) {
  const classes = useStyles();

  const { address } = useAccount();

  const {
    darkMode,
  } = props;

  let navigate = useNavigate();

  const pathMatch = useCurrentPath();

  const [openCollapseSections, setOpenCollapseSections] = useState<Number[]>([]);

  const toggleOpenCollapseState = (navigationMenuIndex: number) => {
    // Check if the navigationMenuIndex is currently in openCollapseSections
    let indexInCurrentState = openCollapseSections.indexOf(navigationMenuIndex)
    if(indexInCurrentState === -1) {
      // Currently not open
      // We add this index to the list of open collapsable areas to open it
      let newOpenCollapseSections = [...openCollapseSections, navigationMenuIndex];
      setOpenCollapseSections(newOpenCollapseSections);
    } else {
      // Currently open
      // We remove this index from the list of open collapsable areas to close it
      let newOpenCollapseSections = [...openCollapseSections].filter(item => item !== navigationMenuIndex);
      setOpenCollapseSections(newOpenCollapseSections);
    }
  }

  const currentSelectionClass = () => {
    if(darkMode) {
      return classes.currentSelectionDarkMode;
    }
    return classes.currentSelectionLightMode;
  }

  const menuEntryItemThemed = () => {
    if(darkMode) {
      return classes.menuEntryItemDarkMode;
    }
    return classes.menuEntryItemLightMode;
  }

  return (
    <div>
        <React.Fragment key={'left'}>
            <Drawer
              anchor={'left'}
              variant="persistent"
              open={true}
              sx={{
                width: 250,
                position: 'relative',
                '& .MuiDrawer-paper': {
                  borderRadius: 0,
                  zIndex: 1,
                  top: IS_GLOBAL_TOP_BANNER_ENABLED ? (61 + GLOBAL_TOP_BANNER_HEIGHT) : 61,
                  backgroundColor: darkMode ? '#141618' : '#F3F3F3',
                },
              }}
            >
                <div
                    className={classes.list}
                    role="presentation"
                >
                  <List>
                      {navigationMenu.map((item, index) => 
                          (!item.onlyConnected || (item.onlyConnected && address)) ?
                            <Fragment key={`parent-${index}`}>
                              <div
                                className={classes.entryContainerMargin}
                              >
                                <LinkWrapper 
                                  link={item.externalLink ? item.externalLink : undefined}
                                  external={item.externalLink ? true : undefined}
                                >
                                  <ListItemButton
                                    onClick={() => {
                                      if(item.path) {
                                        navigate(item.path)
                                        props.setShowLeftMenu(false)
                                      } else if (item.children) {
                                        toggleOpenCollapseState(index)
                                      }
                                    }}
                                    className={[(item.path && ((pathMatch === item.path) || (pathMatch === item.pathExtended))) ? currentSelectionClass() : "", classes.menuEntryItem, menuEntryItemThemed()].join(" ")}
                                    sx={{
                                      "&:hover": {
                                        backgroundColor: darkMode ? "transparent" : "#ffffff",
                                        border: darkMode ? '1px solid #333436' : '1px solid #ffffff',
                                      }
                                    }}
                                    disableRipple
                                  >
                                      <ListItemIcon className={[(item.path && ((pathMatch === item.path) || (pathMatch === item.pathExtended))) ? classes.selectedIcon : "", classes.menuIcon, darkMode ? classes.menuIconDarkMode : classes.menuIconLightMode].join(" ")}>{item.icon}</ListItemIcon>
                                      <ListItemText sx={{
                                        "& .MuiTypography-root": {
                                          fontWeight: 'inherit'
                                        }
                                      }} style={{fontWeight: 'inherit'}} primary={item.text} />
                                      {item.externalLink &&
                                        <ExternalLinkIcon style={{opacity: 0.5}} />
                                      }
                                      {item.children &&
                                        <>
                                          {openCollapseSections.indexOf(index) > -1 ? <ExpandLess /> : <ExpandMore />}
                                        </>
                                      }
                                  </ListItemButton>
                                </LinkWrapper>
                              </div>
                              {item.children &&
                                <Collapse in={openCollapseSections.indexOf(index) > -1} timeout="auto" unmountOnExit>
                                  <List component="div" disablePadding>
                                    {item.children.map((child, childIndex) => 
                                        <div
                                          className={[(item.path && ((pathMatch === item.path) || (pathMatch === item.pathExtended))) ? currentSelectionClass() : "", classes.menuEntryItem].join(" ")}
                                        >
                                          <ListItemButton
                                            onClick={() => {
                                              if(child.path && child.path.length > 0) {
                                                navigate(child.path)
                                                props.setShowLeftMenu(false)
                                              }
                                            }}
                                            key={`child-${index}-${childIndex}`}
                                            sx={{ pl: 4, color: 'inherit' }}
                                            disableRipple
                                          >
                                            <ListItemIcon className={[(child.path && (pathMatch === child.path)) ? classes.selectedIcon : "", classes.menuIcon].join(" ")}>{child.icon}</ListItemIcon>
                                            <ListItemText primary={child.text} />
                                            {item.externalLink &&
                                              <ExternalLinkIcon />
                                            }
                                          </ListItemButton>
                                        </div>
                                    )}
                                  </List>
                                </Collapse>
                              }
                            </Fragment>
                            : null
                      )}
                  </List>
                </div>
            </Drawer>
        </React.Fragment>
    </div>
  );
}

export default NavigationLeftSideBarDesktop;