import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import CssBaseline from '@material-ui/core/CssBaseline';
import Homepage from './component/Homepage';
import Login from './component/Login';
import SignUp from './component/SignUp';
import ConversationsList from './component/ConversationsList';
import Credits from './component/Credits';
import NotFound from './component/NotFound';
import Privacy from './component/Privacy';
import Terms from './component/Terms';
import WebsocketProvider from './component/WebsocketProvider';

// import { State } from './store/state';
// import { useSelector } from 'react-redux';

const App: React.FC = () => {
  // const auth = useSelector((state: State) => state.auth);

  return (
    <Provider store={store}>
      <WebsocketProvider wsUrl="ws://localhost:42042">
        <CssBaseline/>
        <Router>
          <Switch>
            <Route exact path="/" component={ Homepage } />
            {/* { !auth && (
              <> */}
                <Route exact path="/login" component={ Login } />
                <Route exact path="/register" component={ SignUp } />
              {/* </>
            )}
            { auth && */}
              <Route path="/conversation/:id?" component={ ConversationsList } />
              {/* } */}
            <Route exact path="/credits" component={ Credits } />
            <Route exact path="/privacy" component= { Privacy } />
            <Route exact path="/terms" component= { Terms } />
            <Route component={ NotFound } />
          </Switch>
        </Router>
      </WebsocketProvider>
    </Provider>
  );
};

export default App;
