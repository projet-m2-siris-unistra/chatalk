import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import Homepage from './component/Homepage';
import Login from './component/Login';
import SignUp from './component/SignUp';
import ConversationsList from './component/ConversationsList';
import Credits from './component/Credits';
import NotFound from './component/NotFound';
import Privacy from './component/Privacy';
import Terms from './component/Terms';

const App: React.FC = () => {
  return (
    <>
      <CssBaseline/>
      <Router>
        <Switch>
          <Route exact path="/" component={ Homepage } />
          <Route exact path="/login" component={ Login } />
          <Route exact path="/register" component={ SignUp } />
          <Route path="/conversation/:id?" component={ ConversationsList } />
          <Route exact path="/credits" component={ Credits } />
          <Route exact path="/privacy" component= { Privacy } />
	  <Route exact path="/terms" component= { Terms } />
          <Route component={ NotFound } />
        </Switch>
      </Router>
    </>
  );
};

export default App;
