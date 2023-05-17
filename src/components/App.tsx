import React, { useLayoutEffect } from 'react';

import { HashRouter } from 'react-router-dom';

import { createTheme, StyledEngineProvider, Theme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import '../styles/App.css';
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
          })
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
        }
      }),
    [props.darkMode],
  );

  return (
    <HashRouter>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <CssBaseline/>
            <PageContainer/>
            <BlockNumberIndicator/>
          </ThemeProvider>
        </StyledEngineProvider>
    </HashRouter>
  );
}

export default App;
