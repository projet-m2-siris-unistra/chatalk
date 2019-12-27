import React from 'react';
import { Redirect } from 'react-router-dom';
import { State } from '../store/state';
import { useSelector } from 'react-redux';
import { useWebsocket } from './WebsocketProvider';

const Logout: React.FC = () => {
  const { token, connection, isOpen } = useWebsocket();
  const auth = useSelector((state: State) => state.auth);
  if (!auth || !isOpen || !connection) {
    localStorage.removeItem('token');
    return <Redirect to="/"></Redirect>;
  }

  connection.send(
    JSON.stringify({
      action: 'login',
      payload: {
        method: 'jwt',
        action: 'logout',
        token,
      },
    })
  );

  return <Redirect to="/"></Redirect>;
};

export default Logout;
