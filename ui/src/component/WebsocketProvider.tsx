import React, {
  ReactNode,
  Context,
  useState,
  // useEffect,
  useRef,
  MutableRefObject,
  useContext,
  useCallback,
} from 'react';
import store from '../store';
import { setAuth, clearAuth } from '../store/actions';

interface WebsocketContextValue {
  isOpen: boolean;
  connection: WebSocket | null;
}

const defaultWebsocketContextValue: WebsocketContextValue = {
  isOpen: false,
  connection: null,
};

const WebsocketContext: Context<WebsocketContextValue> = React.createContext(
  defaultWebsocketContextValue
);

const useWebsocket = () => useContext(WebsocketContext);

interface Props {
  children?: ReactNode;
  wsUrl: string;
}

const WebsocketProvider: React.FC<Props> = ({ children, wsUrl }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const connectionRef: MutableRefObject<WebSocket | null> = useRef<WebSocket>(
    null
  );

  const handleWs = () => {
    if (isOpen) return;

    connectionRef.current = new WebSocket(wsUrl);
    connectionRef.current.binaryType = 'blob';

    connectionRef.current.onopen = () => {
      console.log('ws opened');
      setIsOpen(true);
    };

    connectionRef.current.onclose = () => {
      console.log('ws closed');
      store.dispatch(clearAuth());
      setIsOpen(false);
      // setTimeout(() => {
      //   handleWs();
      // }, 2000);
    };

    connectionRef.current.onerror = error => {
      console.log('ws errored:', error);
      store.dispatch(clearAuth());
      setIsOpen(false);
    };

    connectionRef.current.onmessage = msg => {
      setIsOpen(true);
      const data = JSON.parse(msg.data);
      console.log('ws messaged:', data);
      if (!data || !data.action) return;

      switch (data.action) {
        case 'send-info':
          console.log('got send-info response');
          break;

        case 'register':
          store.dispatch(
            setAuth({
              userId: data.userid,
              username: data.username,
              displayName: `${data.username}@${data['ws-id']}`,
            })
          );
          console.log('got register response');
          break;

        case 'login':
          store.dispatch(
            setAuth({
              userId: data.userid,
              username: data.username,
              displayName: `${data.displayname}@${data['ws-id']}`,
              avatar: data.picture,
            })
          );
          console.log('got login response');
          break;

        case 'ping':
          console.log('got ping response');
          store.dispatch(
            setAuth({
              userId: 42,
              username: 'toto',
              displayName: `Toto@${data['ws-id']}`,
              avatar: 'toto.jpg',
            })
          );
          break;
      }
    };
  };

  const wsCallback = useCallback(handleWs, [wsUrl]);
  wsCallback();

  return (
    <WebsocketContext.Provider
      value={{
        isOpen,
        connection: connectionRef.current,
      }}
    >
      {children}
    </WebsocketContext.Provider>
  );
};

export default WebsocketProvider;
export { useWebsocket };
