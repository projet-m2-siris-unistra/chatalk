import React, {ReactNode, Context, useState, useEffect, useRef, MutableRefObject, useContext} from 'react';
import store from '../store';
import { setAuth } from '../store/actions';

interface WebsocketContextValue {
  isOpen: boolean;
  connection: WebSocket | null;
};

const defaultWebsocketContextValue: WebsocketContextValue = {
  isOpen: false,
  connection: null,
};

const WebsocketContext: Context<WebsocketContextValue> = React.createContext(defaultWebsocketContextValue);

const useWebsocket = () => useContext(WebsocketContext);

interface Props {
  children?: ReactNode;
  wsUrl: string;
};

const WebsocketProvider: React.FC<Props> = ({ children, wsUrl }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const connectionRef: MutableRefObject<WebSocket | null> = useRef<WebSocket>(null);

  useEffect(() => {
    connectionRef.current = new WebSocket(wsUrl);
    connectionRef.current.binaryType = 'blob';
    connectionRef.current.onopen = () => {
      console.log('ws opened');
      setIsOpen(true);
    };
    connectionRef.current.onclose = () => {
      console.log('ws closed');
      setIsOpen(false);
    };
    connectionRef.current.onerror = (error) => {
      console.log('ws errored:', error);
      setIsOpen(false);
    };
    connectionRef.current.onmessage = (msg) => {
      setIsOpen(true);
      const data = JSON.parse(msg.data);
      console.log('ws messaged:', data);
      if (!data || !data.action) return;
      switch (data.action) {
        case 'register':
          console.log('got register response');
          break;
        case 'login':
            console.log('got login response');
            break;
        case 'ping':
          console.log('got ping response');
          store.dispatch(setAuth({
            userId: 42,
            username: 'toto',
            displayName: `Toto@${data['ws-id']}`,
            avatar: 'toto.jpg',
          }));
          break;
      }
    };

    // can return disconnect function
  }, [wsUrl]);

  return (
    <WebsocketContext.Provider value={{
      isOpen,
      connection: connectionRef.current,
    }}>
      {children}
    </WebsocketContext.Provider>
  );
};

export default WebsocketProvider;
export {
  useWebsocket,
};
