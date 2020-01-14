import React, { useState, useEffect, useRef } from 'react';
import { Switch, Route } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Link, useParams } from 'react-router-dom';
import { useWebsocket } from '../WebsocketProvider';
import { useSelector } from 'react-redux';
import { State } from '../../store/state';
import Input from '@material-ui/core/Input';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import EditIcon from '@material-ui/icons/Edit';
import VideocamIcon from '@material-ui/icons/Videocam';
import ConvSettings from './ConvSettings';
import SimplePeer from 'simple-peer';

const useStyles = makeStyles(theme => ({
  msg: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  header: {
    padding: '24.5px',
    lineHeight: '2px',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    height: '60px',
    overflow: 'hidden',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderBottomColor: theme.palette.grey[200],
  },
  content: {
    minHeight: 'calc(100vh - 50px)',
    maxHeight: 'calc(100vh - 50px)',
    headerButton: {
      backgroundColor: '#0b6374',
      color: '#fff',
      marginLeft: '8px',
      '&:hover': {
        backgroundColor: '#0b6374',
        opacity: 0.8,
      },
    },
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  headerTitle: {
    flex: 1,
    margin: '0 20px',
  },
  smallTitle: {
    color: '#ccc',
    fontSize: '12px',
  },
  msgOther: {
    alignSelf: 'flex-start',
    borderRadius: '10px',
    padding: '10px',
    marginBottom: '10px',
    backgroundColor: theme.palette.grey[200],
    color: theme.palette.text.primary,
  },
  msgMe: {
    alignSelf: 'flex-end',
    borderRadius: '10px',
    padding: '10px',
    marginBottom: '10px',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  hidden: {
    display: 'none',
  },
  msgZone: {
    flex: 1,
    padding: '10px',
    overflowY: 'scroll',
  },
  inputZone: {
    padding: '10px',
    display: 'flex',
  },
  inputField: {
    flex: 1,
    marginRight: '16px',
  },
}));

type Params = {
  id: string;
};

const Conversation: React.FC = () => {
  const { id } = useParams<Params>();
  const convid = parseInt(id);
  const classes = useStyles();
  const messagesList = useRef<HTMLDivElement>(null);
  const messagesListEnd = useRef<HTMLSpanElement>(null);
  const { connection, isOpen } = useWebsocket();
  const isDesktop = useMediaQuery('(min-width:1000px)');
  const auth = useSelector((state: State) => state.auth);
  const conmsgs = useSelector((state: State) => state.messages);
  const conv = useSelector((state: State) => state.conversations).filter(
    c => parseInt(c.convid) === convid
  );
  const conversationName = conv[0].convname || 'Conversation';
  const members = conv[0].members
    .replace('{', '')
    .replace('}', '')
    .split(',')
    .map(n => parseInt(n));
  const users = useSelector((state: State) => state.users).filter(u =>
    members.includes(u.userid)
  );
  const [ownmsg, setOwnMsg] = useState('');
  const [scrollToBottom, setScrollToBottom] = useState(true);
  useEffect(() => {
    if (
      scrollToBottom &&
      messagesList.current !== null &&
      messagesListEnd.current !== null
    ) {
      messagesListEnd.current.scrollIntoView();
    }
  });

  const me = {
    id: 0,
  };
  if (auth) {
    me.id = auth.userid;
  }

  const messages = conmsgs.filter(m => m.convid === convid);

  const msg = messages.map(m => {
    let classToUse = classes.msgOther;
    const user = users.filter(u => u.userid === m.senderid);
    let username = user[0].username;
    if (m.senderid === me.id) {
      classToUse = classes.msgMe;
      username = '';
    }
    return (
      <div key={`msg-${m.msgid}`} className={classes.msg}>
        {username}
        <div key={`msg-content-${m.msgid}`} className={classToUse}>
          {m.content}
        </div>
      </div>
    );
  });

  let displayBackBtn = '';
  if (isDesktop) {
    displayBackBtn = classes.hidden;
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

  const bindEvents = (p: any) => {
    p.on('error', (err: any) => {
      console.error('error', err);
    });

    p.on('signal', (data: any) => {
      console.log('my offer',
        window.btoa(unescape(encodeURIComponent(
          JSON.stringify(data)
        ))));
    });

    p.on('stream', (stream: MediaStream) => {
      console.log('got stream');
    });
  };

  const startPeer = (initiator: boolean) => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      if (Array.isArray(devices)) {
        const kinds = devices.map(d => d.kind);
        const video = kinds.includes('videoinput');
        const audio = kinds.includes('audioinput');
        navigator.mediaDevices.getUserMedia({
          video,
          audio,
        }).then(stream => {
          let p = new SimplePeer({
            initiator,
            stream,
            config: peerConfig,
            trickle: false,
          });
          bindEvents(p);
        }).catch(err => console.error('error', err));
      }
    }).catch(err => console.log(err));
  };

  const sendMessage = () => {
    if (!isOpen || connection === null) {
      console.error('ws is not open');
      return;
    }

    if (!auth) {
      console.error('user is not logged in');
      return;
    }

    console.log('send message:', auth.userid, ownmsg);
    connection.send(
      JSON.stringify({
        action: 'msg_sender',
        type: 'text',
        source: `${auth.userid}`,
        destination: `${convid}`,
        device: '1',
        payload: ownmsg,
      })
    );
    setOwnMsg('');
  };

  return (
    <>
      <Switch>
        <Route path="/conversation/:id/convsettings" component={ConvSettings} />
        <Route>
          <div className={classes.header}>
            <Link to="/conversation" className={displayBackBtn}>
              <IconButton
                aria-label="go back to the list of conversations"
                size="small"
              >
                <ArrowBackIosIcon />
              </IconButton>
            </Link>
            <span className={classes.headerTitle}>
              {conversationName}
              <small className={classes.smallTitle}>#{id}</small>
            </span>
            {users.length === 2 && (
              <IconButton aria-label="start a videocall" size="small" onClick={() => startPeer(true)}>
                <VideocamIcon />
              </IconButton>
            )}
            <Link to={`/conversation/${id}/convsettings`}>
              <IconButton aria-label="manage conversation" size="small">
                <EditIcon />
              </IconButton>
            </Link>
          </div>
          <div className={classes.content}>
            <div
              ref={messagesList}
              onScroll={e => {
                if (messagesList && messagesList.current) {
                  setScrollToBottom(
                    messagesList.current.scrollTop ===
                      messagesList.current.scrollHeight -
                        messagesList.current.offsetHeight
                  );
                }
              }}
              className={classes.msgZone}
            >
              {msg}
              <span ref={messagesListEnd}></span>
            </div>
            <div className={classes.inputZone}>
              <Input
                className={classes.inputField}
                placeholder="Enter your message…"
                value={ownmsg}
                onChange={e => setOwnMsg(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                endIcon={<Icon>send</Icon>}
                onClick={sendMessage}
              >
                Send
              </Button>
            </div>
          </div>
        </Route>
      </Switch>
    </>
  );
};

export default Conversation;
