import React, {useState, useEffect, Fragment, useId} from 'react';

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
// import GovernanceIcon from '@mui/icons-material/Gavel';
import StakingIcon from '@mui/icons-material/Diversity2';
import BridgeIcon from '@mui/icons-material/CompareArrows';
import LiquidityIcon from '@mui/icons-material/AccountBalance';
import ExternalLinkIcon from '@mui/icons-material/Launch';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Chip from '@mui/material/Chip';
import V1Icon from '@mui/icons-material/LooksOne';
import V2Icon from '@mui/icons-material/LooksTwo';
// import V3Icon from '@mui/icons-material/Looks3';

import LinkWrapper from './LinkWrapper';

import useCurrentPath from '../hooks/useCurrentPath';

import NetworkSelectDropdownContainer from '../containers/NetworkSelectDropdownContainer';

import { PropsFromRedux } from '../containers/NavigationLeftSideBarContainer';

import {
  PROPY_LIGHT_BLUE,
} from '../utils/constants';

interface IMenuEntry {
  text: string
  path?: string
  pathExtended?: string[]
  icon: any
  externalLink?: string
  onlyConnected?: boolean
  children?: IMenuEntry[]
  new?: boolean
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
    pathExtended: ['/profile/:profileAddressOrUsername'],
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
      // {
      //   text: 'V3',
      //   path: '/staking/v3',
      //   icon: <V3Icon />,
      //   new: true,
      // },
      {
        text: 'V2',
        path: '/stake/v2',
        icon: <V2Icon />,
      },
      {
        text: 'V1',
        path: '/stake/v1',
        icon: <V1Icon />,
      },
    ]
  },
  {
    text: 'Bridge',
    path: '/bridge',
    externalLink: 'https://superbridge.app/base',
    icon: <BridgeIcon />,
  },
  {
    text: 'Asset Browser',
    path: '/collections',
    icon: <TokenIcon />
  },
  // {
  //   text: 'Governance',
  //   path: '/governance',
  //   externalLink: 'https://snapshot.org/#/propy-gov.eth',
  //   icon: <GovernanceIcon />
  // },
  {
    text: 'Liquidity',
    path: '/liquidity',
    externalLink: 'https://info.uniswap.org/#/tokens/0x226bb599a12c826476e3a771454697ea52e9e220',
    icon: <LiquidityIcon />
  },
];

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
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
});

function NavigationLeftSideBar(props: PropsFromRedux) {
  const classes = useStyles();

  const uniqueId = useId();

  const pathMatch = useCurrentPath();

  const { address } = useAccount();

  const {
    darkMode,
  } = props;

  const [openCollapseSections, setOpenCollapseSections] = useState<Number[]>([]);

  const [localShowLeftMenu, setLocalShowLeftMenu] = useState(false)

  useEffect(() => {
    setLocalShowLeftMenu(props.showLeftMenu)
  }, [props.showLeftMenu])

  const toggleDrawer = (setOpen: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent,
  ) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    props.setShowLeftMenu(setOpen)
  };

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

  return (
    <div>
        <React.Fragment key={`${uniqueId}-left`}>
            <Drawer style={{zIndex: 2100}} anchor={'left'} open={localShowLeftMenu} onClose={toggleDrawer(false)}>
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
                                  >
                                      <ListItemIcon className={[(item.path && ((pathMatch === item.path) || (item?.pathExtended && item?.pathExtended?.indexOf(pathMatch) > -1))) ? classes.selectedIcon : "", classes.menuIcon, darkMode ? classes.menuIconDarkMode : classes.menuIconLightMode].join(" ")}>{item.icon}</ListItemIcon>
                                      <ListItemText primary={item.text} />
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
                                          >
                                            <ListItemIcon className={[(child.path && (pathMatch === child.path)) ? classes.selectedIcon : "", classes.menuIcon].join(" ")}>{child.icon}</ListItemIcon>
                                            <ListItemText sx={{
                                              "& .MuiTypography-root": {
                                                fontWeight: 'inherit'
                                              }
                                            }} style={{fontWeight: 'inherit'}} primary={child.text} />
                                            {child?.new &&
                                              <Chip style={{color: 'white', fontWeight: 'bold'}} label="New" color="primary" />
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
                      {address && 
                        <div style={{marginTop: 6, margin: 18}}>
                          <NetworkSelectDropdownContainer width={"100%"} />
                        </div>
                      }
                  </List>
                </div>
            </Drawer>
        </React.Fragment>
    </div>
  );
}

export default NavigationLeftSideBar;