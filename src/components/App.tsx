import React, { useLayoutEffect } from 'react';

import { HashRouter } from 'react-router-dom';

import { Toaster } from 'sonner'

import { createTheme, StyledEngineProvider, Theme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import '../styles/App.scss';
import { PropsFromRedux } from '../containers/AppContainer';

import BlockNumberIndicator from './BlockNumberIndicator';
import PageContainer from './PageContainer';

import { useWindowSize } from '../hooks';
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
            <Toaster richColors position="bottom-right" />
            <PageContainer/>
            <BlockNumberIndicator/>
          </ThemeProvider>
        </StyledEngineProvider>
    </HashRouter>
  );
}

export default App;
