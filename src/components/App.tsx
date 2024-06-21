import React, { useLayoutEffect } from 'react';

import { HashRouter } from 'react-router-dom';

import { Toaster } from 'sonner'

import { createTheme, StyledEngineProvider, Theme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import 'leaflet/dist/leaflet.css';
import '../styles/App.scss';
import { PropsFromRedux } from '../containers/AppContainer';

import BlockNumberIndicator from './BlockNumberIndicator';
import PageContainerContainer from '../containers/PageContainerContainer';
import RecentHomeNftScrollingBanner from './RecentHomeNftScrollingBanner';

import { useWindowSize } from '../hooks';

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xxl: true; // adds the `mobile` breakpoint
  }
}
declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const App = (props: PropsFromRedux) => {

  const {
    setConsideredMobile,
    setConsideredMedium,
  } = props;

  const windowSize = useWindowSize();

  useLayoutEffect(() => {
    let sizeConsiderMobile = 1000;
    let sizeConsideredMedium = 1280;
    if (windowSize.width && (windowSize.width <= sizeConsiderMobile)) {
      setConsideredMobile(true);
    }else{
      setConsideredMobile(false);
    }
    if (windowSize.width && (windowSize.width <= sizeConsideredMedium)) {
      setConsideredMedium(true);
    }else{
      setConsideredMedium(false);
    }
  }, [windowSize.width, windowSize.height, setConsideredMobile, setConsideredMedium])

  const theme = React.useMemo(
    () =>
      createTheme({
        breakpoints: {
          values: {
            xs: 0,
            sm: 500,
            md: 800,
            lg: 1300,
            xl: 1600,
            xxl: 1800,
          },
        },
        palette: {
          mode: props.darkMode ? 'dark' : 'light',
          ...(props.darkMode && {
            background: {
              default: "#131313",
              paper: "#2b2b2b"
            }
          }),
          primary: {
            main: "#37a6fa",
          },
          secondary: {
            main: "#434343",
          },
          action: {
            disabledBackground: '#e0e0e08c',
          }
        },
        components: {
          MuiCardContent :{
            styleOverrides: {
              root:{
                borderRadius: 15,
                overflow: 'auto',
                "&:last-child": {
                  paddingBottom: '16px'
                },
              }
            }
          },
          MuiPaper: {
            styleOverrides: {
              root:{
                borderRadius: 15,
              }
            }
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 30,
              }
            }
          },
          MuiStepIcon: {
            styleOverrides: {
              root: {
                text: {
                  fill: '#FFFFFF',
                  fontWeight: 'bold',
                },
              },
              text: {
                fill: '#FFFFFF',
                fontWeight: 'bold',
              },
            }
          }
        }
      }),
    [props.darkMode],
  );

  return (
    <HashRouter>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <CssBaseline/>
            <RecentHomeNftScrollingBanner />
            <Toaster richColors position="bottom-right" />
            <PageContainerContainer/>
            <BlockNumberIndicator/>
          </ThemeProvider>
        </StyledEngineProvider>
    </HashRouter>
  );
}

export default App;
