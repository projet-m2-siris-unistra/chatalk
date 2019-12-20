import React from 'react';
import { Provider } from 'react-redux';
import store from './store';
import CssBaseline from '@material-ui/core/CssBaseline';
import WebsocketProvider from './component/WebsocketProvider';
import AppRouter from './router';
import Alert from './component/Alert';
import { BrowserRouter as Router } from 'react-router-dom';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#0b6374',
    },
  },
});

const App: React.FC = () => {
  const websocketEndpoint =
    process.env.REACT_APP_ENDPOINT || 'ws://localhost:42042';

  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <Router>
          <WebsocketProvider wsUrl={websocketEndpoint}>
            <CssBaseline />
            <Alert />
            <AppRouter />
          </WebsocketProvider>
        </Router>
      </Provider>
    </ThemeProvider>
  );
};

export default App;
