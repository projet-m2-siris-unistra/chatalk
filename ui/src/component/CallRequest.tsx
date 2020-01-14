import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Fab } from '@material-ui/core';
import CallIcon from '@material-ui/icons/Call';
import CallEndIcon from '@material-ui/icons/CallEnd';
import { useWebRTC } from './WebRTCProvider';
import { State } from '../store/state';
import { useSelector } from 'react-redux';
import { useWebsocket } from './WebsocketProvider';

const useStyles = makeStyles({
  fs: {
    position: 'fixed',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#212121',
    color: '#fff',
    zIndex: 999,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    fontSize: '24px',
  },
  headerTitle: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    padding: '20px',
  },
  icon: {
    margin: '20px',
  },
});

const CallRequest: React.FC = () => {
  const classes = useStyles();
  const { joinPeer } = useWebRTC();
  const { connection, isOpen } = useWebsocket();
  const auth = useSelector((state: State) => state.auth);
  const call = useSelector((state: State) => state.call);
  const myUserId = auth && auth.userid;

  const acceptCall = () => {
    if (call.offer === null) {
      console.warn('no offer');
      return;
    }
    if (connection === null || !isOpen) {
      console.warn('no ws connection');
      return;
    }
    if (!myUserId) {
      console.warn('no user id');
      return;
    }
    joinPeer(call.offer).then(answer => {
      connection.send(
        JSON.stringify({
          action: 'msg_sender',
          type: 'webrtc-join',
          source: '' + myUserId,
          destination: '' + call.conversationId,
          device: '1',
          payload: answer,
        })
      );
    });
  };

  const declineCall = () => {
    if (connection === null || !isOpen || !myUserId) {
      console.warn('ws is closed or unable to get userId');
      return;
    }
    connection.send(
      JSON.stringify({
        action: 'msg_sender',
        type: 'webrtc-end',
        source: '' + myUserId,
        destination: '' + call.conversationId,
        device: '1',
        payload: 'end call',
      })
    );
  };

  return (
    <div className={classes.fs}>
      <header className={classes.header}>
        <h1 className={classes.headerTitle}>Call Request</h1>
      </header>
      <section className={classes.description}>
        <p>Accept or decline the call</p>
        <p>
          <Fab color="secondary" className={classes.icon} onClick={declineCall}>
            <CallEndIcon />
          </Fab>
          <Fab color="primary" className={classes.icon} onClick={acceptCall}>
            <CallIcon />
          </Fab>
        </p>
      </section>
    </div>
  );
};

export default CallRequest;
