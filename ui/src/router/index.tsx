import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Homepage from '../component/Homepage';
import Login from '../component/Login';
import SignUp from '../component/SignUp';
import ConversationsList from '../component/ConversationsList';
import Credits from '../component/Credits';
import NotFound from '../component/NotFound';
import Privacy from '../component/Privacy';
import Terms from '../component/Terms';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Homepage} />
        <PublicRoute exact path="/login" component={Login} />
        <PublicRoute exact path="/register" component={SignUp} />
        <PrivateRoute path="/conversation/:id?" component={ConversationsList} />
        <Route exact path="/credits" component={Credits} />
        <Route exact path="/privacy" component={Privacy} />
        <Route exact path="/terms" component={Terms} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
};

export default AppRouter;
