import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/es/integration/react';

import './styles/index.css';
import DappProviderWagmiContainer from './containers/DappProviderWagmiContainer';
import reportWebVitals from './reportWebVitals';
import store, { persistor } from './state';

const PGate = PersistGate as any;

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PGate
        loading={null}
        persistor={persistor}
      >
        <DappProviderWagmiContainer />
      </PGate>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();