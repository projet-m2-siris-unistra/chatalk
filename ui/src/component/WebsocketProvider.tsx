import React, { ReactNode, Context, useContext } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import {
  Action,
  setAuth,
  clearAuth,
  alertError,
  alertInfo,
  clearAlert,
  setConversations,
} from '../store/actions';
import { DispatchProp, connect } from 'react-redux';

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

type Props = {
  children?: ReactNode;
  wsUrl: string;
} & DispatchProp<Action> &
  RouteComponentProps;

interface State {
  socket: WebSocket | null;
  isOpen: boolean;
  ping: ReturnType<typeof setInterval> | null;
}

class WebsocketProvider extends React.Component<Props, State> {
  state: State = {
    socket: null,
    isOpen: false,
    ping: null,
  };

  componentDidMount() {
    this.createWs(this.props.wsUrl);
  }

  serviceResponseSendInfos(data: any) {
    console.log('svc/send-info: ', data);
    if (!data.success) {
      console.error('send-info failed');
      return;
    }

    if (data.convs) {
      this.props.dispatch(setConversations(data.convs));
    }
  }

  serviceResponseRegister(data: any) {
    console.log('svc/register: ', data);
    if (!data.success) {
      this.props.dispatch(
        alertError(data.error || 'Registration failed. Retry later…')
      );
      return;
    }
    this.props.dispatch(
      alertInfo('Registration succeeded. You can now log in!')
    );
  }

  serviceResponseLogin(data: any) {
    console.log('svc/login: ', data);
    if (!data.success) {
      this.props.dispatch(
        alertError(data.error || 'Login failed. Retry later…')
      );
      return;
    }
    this.props.dispatch(
      alertInfo(`Welcome ${data.displayname || data.username || ''}!`)
    );
    this.props.dispatch(
      setAuth({
        userId: data.userid,
        username: data.username,
        displayName: `${data.displayname}@${data['ws-id']}`,
        avatar: data.picture,
      })
    );
  }

  serviceResponseConvCreation(data: any) {
    console.log('svc/conv_creation: ', data);
    if (!data.success) {
      this.props.dispatch(
        alertError(
          data.error || 'The creation of the conversation failed. Retry later…'
        )
      );
      return;
    }

    // if success (whaaaaaaat?!)
    if (data.error) {
      const convId = parseInt(data.error.match(/int=(\d*)/)[1]);
      this.props.dispatch(
        alertInfo(data.error || 'The conversation was created.')
      );
      this.props.history.push(`/conversation/${convId}`);
    }
  }

  serviceResponsePing(data: any) {
    console.log('svc/ping: ', data);
  }

  sendPing() {
    if (
      !this.state.isOpen ||
      this.state.socket === null ||
      this.state.ping === null
    )
      return;

    this.state.socket.send(
      JSON.stringify({
        action: 'ping',
        payload: {},
      })
    );
  }

  stopPing() {
    if (this.state.ping === null) return;
    clearInterval(this.state.ping);
    this.setState({ ping: null });
  }

  onWsOpen() {
    console.log('ws opened');
    this.setState({
      isOpen: true,
      ping: setInterval(() => this.sendPing(), 15000),
    });
    this.props.dispatch(clearAlert());
  }

  onWsClose() {
    console.log('ws closed');
    this.props.dispatch(clearAuth());
    this.setState({ isOpen: false });
    this.stopPing();
    setTimeout(() => this.createWs(this.props.wsUrl), 2000);
    this.props.dispatch(
      alertError(
        'Server connection lost. Please check your Internet connection and wait…'
      )
    );
  }

  onWsError(error: any) {
    console.log('ws errored:', error);
    this.props.dispatch(clearAuth());
    this.setState({ isOpen: false });
    this.stopPing();
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

      case 'conv_creation':
        this.serviceResponseConvCreation(data);
        break;

      case 'ping':
        this.serviceResponsePing(data);
        break;
    }
  }

  createWs(wsUrl: string) {
    if (this.state.isOpen) return;

    const ws = new WebSocket(wsUrl);
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
        {this.props.children}
      </WebsocketContext.Provider>
    );
  }
}

export default withRouter(connect()(WebsocketProvider));
export { useWebsocket };
