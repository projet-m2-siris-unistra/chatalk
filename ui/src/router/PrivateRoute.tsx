import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { State } from '../store/state';
import { useSelector } from 'react-redux';

const PrivateRoute: React.FC<RouteProps> = ({
  component,
  ...options
}: RouteProps) => {
  const auth = useSelector((state: State) => state.auth);

  return auth ? (
    <Route {...options} component={component}></Route>
  ) : (
    <Redirect to="/login"></Redirect>
  );
};

export default PrivateRoute;
