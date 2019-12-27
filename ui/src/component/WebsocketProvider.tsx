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
  setUsers,
  setMessages,
  updateMessages,
  updateConversations,
} from '../store/actions';
import { DispatchProp, connect } from 'react-redux';

interface WebsocketContextValue {
  isOpen: boolean;
  connection: WebSocket | null;
  token: string | null;
}

const defaultWebsocketContextValue: WebsocketContextValue = {
  isOpen: false,
  connection: null,
  token: localStorage.getItem('token'),
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
  userid: number | null;
  token: string | null;
  refresh: ReturnType<typeof setInterval> | null;
}

class WebsocketProvider extends React.Component<Props, State> {
  state: State = {
    socket: null,
    isOpen: false,
    ping: null,
    userid: null,
    token: localStorage.getItem('token'),
    refresh: null,
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
    if (data.users) {
      this.props.dispatch(setUsers(data.users));
    }
    if (data.messages) {
      this.props.dispatch(setMessages(data.messages));
    }
  }

  serviceResponseRegister(data: any) {
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
    if (data.type) {
      switch (data.type) {
        case 'logout':
          this.serviceResponseLogout(data);
          return;
        case 'token-refresh':
          this.serviceResponseTokenRefresh(data);
          return;
      }
    }

    if (!data.success) {
      if (data.error) {
        this.props.dispatch(
          alertError(data.error || 'Login failed. Retry later…')
        );
      }

      // log the user out
      localStorage.removeItem('token');
      this.props.dispatch(clearAuth());
      this.props.dispatch(alertInfo('Successfully logged out!'));
      this.setState({ token: null });

      return;
    }
    if (!data.type) {
      this.props.dispatch(
        alertInfo(`Welcome ${data.displayname || data.username || ''}!`)
      );
    }
    this.props.dispatch(
      setAuth({
        userid: data.userid,
        username: data.username,
        displayname: `${data.displayname}@${data['ws-id']}`,
        avatar: data.picture,
      })
    );
    localStorage.setItem('token', data.token);
    this.setState({
      userid: data.userid,
      token: data.token,
    });
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

    if (data.success) {
      this.props.dispatch(alertInfo('The conversation was created.'));
      this.props.dispatch(
        updateConversations({
          convid: data.convid,
          convname: data.convname,
          shared_key: data.sharedkey,
          members: data.members,
        })
      );
      if (data.creator === this.state.userid) {
        this.props.history.push(`/conversation/${data.convid}`);
      } else {
        if (this.state.isOpen && this.state.socket !== null) {
          this.state.socket.send(
            JSON.stringify({
              action: 'conv-sub',
              payload: {
                userid: `${this.state.userid}`,
                convid: `${data.convid}`,
              },
            })
          );
        }
      }
    }
  }

  serviceResponseMsgSender(data: any) {
    console.log('svc/msg_sender: ', data);

    this.props.dispatch(
      updateMessages({
        msgid: data.msgid,
        senderid: data.source,
        convid: data.destination,
        content: data.payload,
      })
    );
  }

  serviceResponseConvSub(data: any) {
    console.log('svc/conv-sub: ', data);
    if (!data.success) {
      this.props.dispatch(
        alertError(data.error || 'Oups, try to reconnect Please.')
      );
      return;
    }
  }

  serviceResponseTokenRefresh(data: any) {
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      this.setState({ token: data.token });
    }
    if (!data.success) {
      localStorage.removeItem('token');
      this.props.dispatch(clearAuth());
      this.props.dispatch(
        alertError('You were disconnected. You will need to login again.')
      );
      this.setState({ token: null });
    }
  }

  serviceResponseLogout(_data: any) {
    console.log('logged out!');
    localStorage.removeItem('token');
    this.props.dispatch(clearAuth());
    this.props.dispatch(alertInfo('Successfully logged out!'));
    this.setState({ token: null });
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

  sendRefresh() {
    if (
      !this.state.isOpen ||
      this.state.socket === null ||
      this.state.refresh === null ||
      !this.state.token
    )
      return;

    this.state.socket.send(
      JSON.stringify({
        action: 'login',
        payload: {
          method: 'jwt',
          action: 'refresh',
          token: this.state.token,
        },
      })
    );
  }

  stopPing() {
    if (this.state.ping === null) return;
    clearInterval(this.state.ping);
    this.setState({ ping: null });
  }

  stopRefresh() {
    if (this.state.refresh === null) return;
    clearInterval(this.state.refresh);
    this.setState({ refresh: null });
  }

  onWsOpen() {
    this.props.dispatch(clearAlert());
    this.setState({
      isOpen: true,
      ping: setInterval(() => this.sendPing(), 15000), // 15 sec
      refresh: setInterval(() => this.sendRefresh(), 300000), // 5 min
    });

    // if a token is present, try to reconnect the user
    if (this.state.token && this.state.socket) {
      this.state.socket.send(
        JSON.stringify({
          action: 'login',
          payload: {
            method: 'jwt',
            action: 'login',
            token: this.state.token,
          },
        })
      );
    }
  }

  onWsClose() {
    this.props.dispatch(clearAuth());
    this.setState({ isOpen: false });
    this.stopPing();
    this.stopRefresh();

    // try to reconnect to the websocket
    setTimeout(() => this.createWs(this.props.wsUrl), 2000);

    // inform the user that the connection was lost
    this.props.dispatch(
      alertError(
        'Server connection lost. Please check your Internet connection and wait…'
      )
    );
  }

  onWsError(error: any) {
    this.props.dispatch(clearAuth());
    this.setState({ isOpen: false });
    this.stopPing();
    this.stopRefresh();
  }

  onWsMessage(msg: any) {
    this.setState({ isOpen: true });
    const data = JSON.parse(msg.data);
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

      case 'msg_sender':
        this.serviceResponseMsgSender(data);
        break;

      case 'conv-sub':
        this.serviceResponseConvSub(data);
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
          token: this.state.token,
        }}
      >
        {this.props.children}
      </WebsocketContext.Provider>
    );
  }
}

export default withRouter(connect()(WebsocketProvider));
export { useWebsocket };
