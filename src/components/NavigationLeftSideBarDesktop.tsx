import React, {useState, Fragment} from 'react';
import { useNavigate } from "react-router-dom";

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
import LiquidityIcon from '@mui/icons-material/AccountBalance';
import ExternalLinkIcon from '@mui/icons-material/Launch';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import { PropsFromRedux } from '../containers/NavigationLeftSideBarContainer';

import LinkWrapper from './LinkWrapper';

import useCurrentPath from '../hooks/useCurrentPath';

interface IMenuEntry {
  text: string
  path?: string
  icon: any
  externalLink?: string
  children?: IMenuEntry[]
}

const navigationMenu : IMenuEntry[] = [
  {
    text: 'Dashboard',
    path: '/',
    icon: <DashboardIcon />
  },
  {
    text: 'Token Browser',
    path: '/example',
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
    externalLink: 'https://info.uniswap.org/#/pools/0xc7cf089fb4bc91f1981df2285ca019ab09a5dd3b', // todo use unipilot link
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
    color: 'white',
    border: '1px solid transparent',
    borderRadius: 10,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 11,
    paddingRight: 11,
  },
  entryContainerMargin: {
    marginTop: 6,
    marginBottom: 6,
    marginLeft: 11,
    marginRight: 11,
    borderRadius: 10,
  },
  currentSelection: {
    backgroundColor: '#ffffff1a!important',
    borderRadius: 10,
  },
  menuIcon: {
    color: 'white',
    minWidth: 'auto',
    marginRight: 15,
  },
  selectedIcon: {
    color: '#38A6FB',
  }
});

function NavigationLeftSideBarDesktop(props: PropsFromRedux) {
  const classes = useStyles();

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
                  zIndex: 1,
                  top: 61,
                  backgroundColor: '#141618',
                },
              }}
            >
                <div
                    className={classes.list}
                    role="presentation"
                >
                  <List>
                      {navigationMenu.map((item, index) => 
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
                                  className={[(item.path && (pathMatch === item.path)) ? classes.currentSelection : "", classes.menuEntryItem].join(" ")}
                                  sx={{
                                    "&:hover": {
                                      backgroundColor: "transparent",
                                      border: '1px solid #333436'
                                    }
                                  }}
                                  disableRipple
                                >
                                    <ListItemIcon className={[(item.path && (pathMatch === item.path)) ? classes.selectedIcon : "", classes.menuIcon].join(" ")}>{item.icon}</ListItemIcon>
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
                                        className={[(item.path && (pathMatch === item.path)) ? classes.currentSelection : "", classes.menuEntryItem].join(" ")}
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
                      )}
                  </List>
                </div>
            </Drawer>
        </React.Fragment>
    </div>
  );
}

export default NavigationLeftSideBarDesktop;