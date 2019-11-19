import React, {ReactNode, Context, useState, useEffect, useRef, MutableRefObject, useContext} from 'react';

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
      setIsOpen(true);
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