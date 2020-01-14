import React, { useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Fab } from '@material-ui/core';
import CallEndIcon from '@material-ui/icons/CallEnd';
import { useWebRTC } from './WebRTCProvider';
import { State } from '../store/state';
import { useSelector } from 'react-redux';
import { useWebsocket } from './WebsocketProvider';

const useStyles = makeStyles({
  fs: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#212121',
    color: '#fff',
    zIndex: 999,
  },
  header: {
    position: 'fixed',
    zIndex: 3,
    top: '20px',
    left: 0,
    right: 0,
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
    zIndex: 3,
    margin: '20px',
    marginLeft: '-28px',
    position: 'fixed',
    bottom: '75px',
  },
  videoOther: {
    position: 'fixed',
    zIndex: 1,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
  },
  videoMe: {
    zIndex: 2,
    position: 'fixed',
    bottom: 0,
    right: 0,
    width: '40vw',
    height: '40vw',
    maxHeight: '80vh',
  },
});

const Call: React.FC = () => {
  const classes = useStyles();
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const otherVideoRef = useRef<HTMLVideoElement>(null);
  const { signal, myStream, otherStream } = useWebRTC();
  const { connection, isOpen } = useWebsocket();
  const auth = useSelector((state: State) => state.auth);
  const call = useSelector((state: State) => state.call);
  const myUserId = auth && auth.userid;

  useEffect(() => {
    if (call.offer === null) {
      console.warn('empty offer');
      return;
    }
    signal(call.offer);
    // eslint-disable-next-line
  }, [ call ]);

  const endCall = () => {
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

  useEffect(() => {
    try {
      if (myStream !== null && myVideoRef.current !== null) {
        myVideoRef.current.srcObject = myStream;
        myVideoRef.current.play().catch(err => {
          console.error(err);
        });
      }
      if (otherStream !== null && otherVideoRef.current !== null) {
        otherVideoRef.current.srcObject = otherStream;
        otherVideoRef.current.play().catch(err => {
          console.error(err);
        });
      }
    } catch (err) {
      console.error(err);
      endCall();
    }
  });

  return (
    <div className={classes.fs}>
      <header className={classes.header}>
        <h1 className={classes.headerTitle}>Call</h1>
      </header>
      <section className={classes.description}>
        <p>
          <video
            className={classes.videoOther}
            ref={otherVideoRef}
            controls
          ></video>
          <video
            className={classes.videoMe}
            ref={myVideoRef}
            controls
            muted
          ></video>
        </p>
        <p>
          <Fab color="secondary" className={classes.icon} onClick={endCall}>
            <CallEndIcon />
          </Fab>
        </p>
      </section>
    </div>
  );
};

export default Call;
