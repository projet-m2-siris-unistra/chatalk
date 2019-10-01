import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Homepage from './component/Homepage';
import Login from './component/Login';
import SignUp from './component/SignUp';
import ConversationsList from './component/ConversationsList';
import NotFound from './component/NotFound';

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={ Homepage } />
        <Route exact path="/login" component={ Login } />
        <Route exact path="/register" component={ SignUp } />
        <Route path="/conversation" component={ ConversationsList } />
        <Route component={ NotFound } />
      </Switch>
    </Router>
  );
};

export default App;
