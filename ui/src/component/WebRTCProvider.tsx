import React, { ReactNode, Context, useContext } from 'react';
import { DispatchProp, connect } from 'react-redux';
import { Action } from '../store/actions';
import SimplePeer from 'simple-peer';

interface WebRTCContextValue {
  myStream: MediaStream | null;
  otherStream: MediaStream | null;
  startPeer: () => Promise<string>;
  joinPeer: (offer: string) => Promise<string>;
  signal: (data: string) => void;
  // TODO: remove this
  setOnSignal: (callback: (offer: string) => void) => void;
}

const defaultWebRTCContextValue: WebRTCContextValue = {
  myStream: null,
  otherStream: null,
  startPeer: () => new Promise(() => {}),
  joinPeer: (offer: string) => new Promise(() => {}),
  signal: (data: string) => {},
  setOnSignal: () => {},
};

const WebRTCContext: Context<WebRTCContextValue> = React.createContext(
  defaultWebRTCContextValue
);

const useWebRTC = () => useContext(WebRTCContext);

type Props = {
  children?: ReactNode;
} & DispatchProp<Action>;

interface State {
  myStream: MediaStream | null;
  otherStream: MediaStream | null;
  peer: SimplePeer.Instance | null;
  onSignal: (offer: string) => void;
}

const peerConfig = {
  iceServers: [
    {
      'urls': 'stun:turn.chatalk.fr:3478',
      'username': 'chatalk',
      'credential': 'xongah3ieR4ashie7aekeija',
    },
    {
      'urls': 'turn:turn.chatalk.fr:3478',
      'username': 'chatalk',
      'credential': 'xongah3ieR4ashie7aekeija',
    },
  ],
};

class WebRTCProvider extends React.Component<Props, State> {
  state: State = {
    myStream: null,
    otherStream: null,
    peer: null,
    onSignal: (offer: string) => { console.log("offer", offer); },
  };

  initLocalStream(): Promise<MediaStream> {
    return navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        if (Array.isArray(devices)) {
          const kinds = devices.map(d => d.kind);
          const video = kinds.includes('videoinput');
          const audio = kinds.includes('audioinput');
          return { audio, video };
        } else {
          throw new Error('no device found');
        }
      })
      .then(constraints => navigator.mediaDevices.getUserMedia(constraints))
  }

  startPeer(): Promise<string> {
    return this.initLocalStream()
      .then(stream => {
        let p = new SimplePeer({
          initiator: true,
          stream,
          config: peerConfig,
          trickle: false,
        });
        this.setState({
          myStream: stream,
          peer: p,
        });
        this.bindEvents();
      })
      .then(() => {
        return new Promise<string>(resolve => {
          this.setState({ onSignal: resolve })
        })
      })
      .catch(err => {
        console.error('error', err)
        return new Promise(() => {});
      })
  };

  joinPeer(offer: string): Promise<string> {
    return this.initLocalStream()
      .then(stream => {
        let p = new SimplePeer({
          initiator: false,
          stream,
          config: peerConfig,
          trickle: false,
        });
        this.setState({
          myStream: stream,
          peer: p,
        });
        this.bindEvents();
        this.signal(offer);
      })
      .then(() => {
        return new Promise<string>(resolve => {
          this.setState({ onSignal: resolve })
        })
      })
      .catch(err => {
        console.error('error', err)
        return new Promise(() => {});
      })
  };

  bindEvents() {
    if (this.state.peer === null) {
      console.warn('binding with no peer');
      return;
    }

    this.state.peer.on('error', (err: any) => {
      console.error('error', err);
    });

    this.state.peer.on('signal', (data: any) => {
      console.log("signal", data);
      const offer = window.btoa(unescape(encodeURIComponent(
        JSON.stringify(data)
      )));
      this.state.onSignal(offer);
    });

    this.state.peer.on('stream', (stream: MediaStream) => {
      console.log('got stream');
      this.setState({ otherStream: stream });
    });
  };

  signal(data: string) {
    if (this.state.peer === null) {
      console.warn('signal with no peer');
      return;
    }

    const offer = JSON.parse(decodeURIComponent(escape(window.atob(data))));
    try {
      this.state.peer.signal(offer);
    } catch(err) {
      console.error(err);
    };
  }

  render() {
    return (
      <WebRTCContext.Provider
        value={{
          myStream: this.state.myStream,
          otherStream: this.state.otherStream,
          startPeer: () => this.startPeer(),
          joinPeer: (offer: string) => this.joinPeer(offer),
          signal: data => this.signal(data),
          setOnSignal: callback => this.setState({ onSignal: callback }),
        }}
      >
        {this.props.children}
      </WebRTCContext.Provider>
    );
  }
}

export default connect()(WebRTCProvider);
export { useWebRTC, WebRTCContext };
