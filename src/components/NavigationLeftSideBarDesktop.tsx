import React, {useState, Fragment, useEffect, useId} from 'react';

import { useAccount } from 'wagmi';

import makeStyles from '@mui/styles/makeStyles';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Collapse from '@mui/material/Collapse';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ProfileIcon from '@mui/icons-material/AccountCircle';
import TokenIcon from '@mui/icons-material/LocalActivity';
import GovernanceIcon from '@mui/icons-material/Gavel';
import StakingIcon from '@mui/icons-material/Diversity2';
import BridgeIcon from '@mui/icons-material/CompareArrows';
import LiquidityIcon from '@mui/icons-material/AccountBalance';
import ExternalLinkIcon from '@mui/icons-material/Launch';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import V1Icon from '@mui/icons-material/LooksOne';
import V2Icon from '@mui/icons-material/LooksTwo';

import { PropsFromRedux } from '../containers/NavigationLeftSideBarContainer';

import LinkWrapper from './LinkWrapper';

import useCurrentPath from '../hooks/useCurrentPath';

import {
  PROPY_LIGHT_BLUE,
  IS_GLOBAL_TOP_BANNER_ENABLED,
  GLOBAL_TOP_BANNER_HEIGHT,
  DESKTOP_MENU_WIDTH,
} from '../utils/constants';

interface IMenuEntry {
  text: string
  path?: string
  pathExtended?: string[]
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
    text: 'Profile',
    path: '/profile',
    icon: <ProfileIcon />,
    onlyConnected: true,
  },
  {
    text: 'My Assets',
    path: '/my-assets',
    icon: <AccountBalanceWalletIcon />,
    onlyConnected: true,
  },
  // {
  //   text: 'Analytics',
  //   path: '/analytics',
  //   icon: <AccountBalanceWalletIcon />,
  // },
  // {
  //   text: 'Stake',
  //   path: '/stake',
  //   icon: <StakingIcon />,
  // },
  {
    text: 'Stake',
    icon: <StakingIcon />,
    children: [
      {
        text: 'V1',
        path: '/stake/v1',
        icon: <V1Icon />,
      },
      {
        text: 'V2',
        path: '/stake/v2',
        icon: <V2Icon />,
      },
    ]
  },
  {
    text: 'Bridge',
    path: '/bridge',
    pathExtended: ['/bridge/:bridgeSelection', '/bridge/:bridgeSelection/:bridgeAction/:transactionHash'],
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
    externalLink: 'https://info.uniswap.org/#/tokens/0x226bb599a12c826476e3a771454697ea52e9e220',
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
    width: DESKTOP_MENU_WIDTH,
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
  menuEntryItemNested: {
    transition: 'all 0.2s ease-in-out',
    fontWeight: '500',
    border: '1px solid transparent',
    borderRadius: 10,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 23,
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

  const uniqueId = useId();

  const {
    darkMode,
  } = props;

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

  useEffect(() => {
    let menuIndex = 0;
    for(let navigationEntry of navigationMenu) {
      if(navigationEntry.children) {
        for(let childNavigationEntry of navigationEntry.children) {
          if(childNavigationEntry.path && (pathMatch === childNavigationEntry.path)) {
            let indexInCurrentState = openCollapseSections.indexOf(menuIndex);
            if(indexInCurrentState === -1) {
              let newOpenCollapseSections = [...openCollapseSections, menuIndex];
              setOpenCollapseSections(newOpenCollapseSections);
            }
          }
        }
      }
      menuIndex++;
    }
  }, [openCollapseSections, pathMatch])

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
        <React.Fragment key={`${uniqueId}-left`}>
            <Drawer
              anchor={'left'}
              variant="persistent"
              open={true}
              sx={{
                width: DESKTOP_MENU_WIDTH,
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
                            <Fragment key={`${uniqueId}-parent-${index}`}>
                              <div
                                className={classes.entryContainerMargin}
                              >
                                <LinkWrapper 
                                  link={item.externalLink ? item.externalLink : item.path}
                                  external={item.externalLink ? true : false}
                                >
                                  <ListItemButton
                                    onClick={() => {
                                      if(item.path) {
                                        props.setShowLeftMenu(false)
                                      } else if (item.children) {
                                        toggleOpenCollapseState(index)
                                      }
                                    }}
                                    className={[(item.path && ((pathMatch === item.path) || (item?.pathExtended && item?.pathExtended?.indexOf(pathMatch) > -1))) ? currentSelectionClass() : "", classes.menuEntryItem, menuEntryItemThemed()].join(" ")}
                                    sx={{
                                      "&:hover": {
                                        backgroundColor: darkMode ? "transparent" : "#ffffff",
                                        border: darkMode ? '1px solid #333436' : '1px solid #ffffff',
                                      }
                                    }}
                                    disableRipple
                                  >
                                      <ListItemIcon className={[(item.path && ((pathMatch === item.path) || (item?.pathExtended && item?.pathExtended?.indexOf(pathMatch) > -1))) ? classes.selectedIcon : "", classes.menuIcon, darkMode ? classes.menuIconDarkMode : classes.menuIconLightMode].join(" ")}>{item.icon}</ListItemIcon>
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
                                          key={`${uniqueId}-parent-${index}-child-${childIndex}`}
                                          className={[(item.path && ((pathMatch === item.path) || (item?.pathExtended && item?.pathExtended?.indexOf(pathMatch) > -1))) ? currentSelectionClass() : "", classes.menuEntryItemNested].join(" ")}
                                        >
                                          <LinkWrapper 
                                            link={child.externalLink ? child.externalLink : child.path}
                                            external={child.externalLink ? true : false}
                                          >
                                            <ListItemButton
                                              onClick={() => {
                                                if(child.path && child.path.length > 0) {
                                                  props.setShowLeftMenu(false)
                                                }
                                              }}
                                              key={`${uniqueId}-child-${index}-${childIndex}`}
                                              className={[(child.path && ((pathMatch === child.path) || (child?.pathExtended && child?.pathExtended?.indexOf(pathMatch) > -1))) ? currentSelectionClass() : "", classes.menuEntryItem, menuEntryItemThemed()].join(" ")}
                                              sx={{ 
                                                pl: 4,
                                                color: 'inherit',
                                                "&:hover": {
                                                  backgroundColor: darkMode ? "transparent" : "#ffffff",
                                                  border: darkMode ? '1px solid #333436' : '1px solid #ffffff',
                                                }
                                              }}
                                              disableRipple
                                            >
                                              <ListItemIcon className={[(child.path && (pathMatch === child.path)) ? classes.selectedIcon : "", classes.menuIcon].join(" ")}>{child.icon}</ListItemIcon>
                                              <ListItemText sx={{
                                                "& .MuiTypography-root": {
                                                  fontWeight: 'inherit'
                                                }
                                              }} style={{fontWeight: 'inherit'}} primary={child.text} />
                                              {child.externalLink &&
                                                <ExternalLinkIcon style={{opacity: 0.5}} />
                                              }
                                            </ListItemButton>
                                          </LinkWrapper>
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