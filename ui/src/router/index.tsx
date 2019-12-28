import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Homepage from '../component/Homepage';
import Login from '../component/Login';
import SignUp from '../component/SignUp';
import ConversationsList from '../component/conversations';
import Credits from '../component/Credits';
import NotFound from '../component/NotFound';
import Privacy from '../component/Privacy';
import Terms from '../component/Terms';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import Settings from '../component/Settings';
import Logout from '../component/Logout';

const AppRouter: React.FC = () => {
  return (
    <Switch>
      <PublicRoute exact path="/" component={Homepage} />
      <PublicRoute exact path="/login" component={Login} />
      <PublicRoute exact path="/register" component={SignUp} />
      <PrivateRoute path="/conversation" component={ConversationsList} />
      <PrivateRoute path="/settings" component={Settings} />
      <PrivateRoute path="/logout" component={Logout} />
      <Route exact path="/credits" component={Credits} />
      <Route exact path="/privacy" component={Privacy} />
      <Route exact path="/terms" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
};

export default AppRouter;
