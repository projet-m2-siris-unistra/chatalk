import React from 'react';
import { Provider } from 'react-redux';
import store from './store';
import CssBaseline from '@material-ui/core/CssBaseline';
import WebsocketProvider from './component/WebsocketProvider';
import AppRouter from './router';
import Alert from './component/Alert';

const App: React.FC = () => {
  const websocketEndpoint =
    process.env.REACT_APP_ENDPOINT || 'ws://localhost:42042';

  return (
    <Provider store={store}>
      <WebsocketProvider wsUrl={websocketEndpoint}>
        <CssBaseline />
        <Alert />
        <AppRouter />
      </WebsocketProvider>
    </Provider>
  );
};

export default App;
