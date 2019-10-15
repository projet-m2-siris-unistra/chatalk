import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import Homepage from './component/Homepage';
import Login from './component/Login';
import SignUp from './component/SignUp';
import ConversationsList from './component/ConversationsList';
import NotFound from './component/NotFound';

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
          <Route component={ NotFound } />
        </Switch>
      </Router>
    </>
  );
};

export default App;
