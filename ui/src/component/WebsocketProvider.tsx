import React, {
  ReactNode,
  Context,
  useContext,
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

interface State {
  socket: WebSocket | null,
  isOpen: boolean,
}

class WebsocketProvider extends React.Component<Props, State> {
  state: State = {
    socket: null,
    isOpen: false,
  };

  componentDidMount() {
    this.createWs(this.props.wsUrl);
  }

  serviceResponseSendInfos(data: any) {
    console.log('svc/send-info: ', data);
  }

  serviceResponseRegister(data: any) {
    console.log('svc/register: ', data);
    store.dispatch(
      setAuth({
        userId: data.userid,
        username: data.username,
        displayName: `${data.username}@${data['ws-id']}`,
      })
    );
  }

  serviceResponseLogin(data: any) {
    console.log('svc/login: ', data);
    store.dispatch(
      setAuth({
        userId: data.userid,
        username: data.username,
        displayName: `${data.displayname}@${data['ws-id']}`,
        avatar: data.picture,
      })
    );
  }

  serviceResponsePing(data: any) {
    console.log('svc/ping: ', data);
  }

  onWsOpen() {
    console.log('ws opened');
    this.setState({ isOpen: true });
  }

  onWsClose() {
    console.log('ws closed');
    store.dispatch(clearAuth());
    this.setState({ isOpen: false });
    setTimeout(() => this.createWs(this.props.wsUrl), 2000)
  }

  onWsError(error: any) {
    console.log('ws errored:', error);
    store.dispatch(clearAuth());
    this.setState({ isOpen: false });
  }

  onWsMessage(msg: any) {
    this.setState({ isOpen: true });
    const data = JSON.parse(msg.data);
    console.log('ws messaged:', data);
    if (!data || !data.action) return;

    switch (data.action) {
      case 'send-info':
        this.serviceResponseSendInfos(data);
        break;

      case 'register':
        this.serviceResponseRegister(data);
        break;

      case 'login':
        this.serviceResponseLogin(data);
        break;

      case 'ping':
        this.serviceResponsePing(data);
        break;
    }
  }

  createWs(wsUrl: string) {
    if (this.state.isOpen) return;

    let ws = new WebSocket(wsUrl);
    ws.binaryType = 'blob';

    ws.onopen = () => this.onWsOpen();
    ws.onclose = () => this.onWsClose();
    ws.onerror = err => this.onWsError(err);
    ws.onmessage = msg => this.onWsMessage(msg);

    this.setState({ socket: ws });
  }

  render() {
    return (
      <WebsocketContext.Provider
        value={{
          isOpen: this.state.isOpen,
          connection: this.state.socket,
        }}
      >
        { this.props.children }
      </WebsocketContext.Provider>
    );
  }
}

export default WebsocketProvider;
export { useWebsocket };
