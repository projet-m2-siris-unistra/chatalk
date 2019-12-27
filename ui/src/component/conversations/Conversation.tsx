import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Link, useParams } from 'react-router-dom';
import { useWebsocket } from '../WebsocketProvider';
import { useSelector } from 'react-redux';
import { State } from '../../store/state';
import Input from '@material-ui/core/Input';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import SettingsIcon from '@material-ui/icons/Settings';
import IconButton from '@material-ui/core/IconButton';

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
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
  },
  headerButton: {
    backgroundColor: '#0b6374',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#0b6374',
      opacity: 0.8,
    },
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
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  hidden: {
    display: 'none',
  },
  footer: {
    padding: '35px',
    lineHeight: '2px',
    fontSize: '18px',
    height: '30px',
    overflow: 'hidden',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    borderTopColor: theme.palette.grey[200],
  },
}));

type Params = {
  id: string;
};

const Conversation: React.FC = () => {
  const { id } = useParams<Params>();
  const convid = parseInt(id);
  const classes = useStyles();
  const { connection, isOpen } = useWebsocket();
  const isDesktop = useMediaQuery('(min-width:1000px)');
  const auth = useSelector((state: State) => state.auth);
  const conmsgs = useSelector((state: State) => state.messages);
  const conv = useSelector((state: State) => state.conversations).filter(
    c => parseInt(c.convid) === convid
  );
  const members = conv[0].members
    .replace('{', '')
    .replace('}', '')
    .split(',')
    .map(n => parseInt(n));
  const users = useSelector((state: State) => state.users).filter(u =>
    members.includes(u.userid)
  );
  const [ownmsg, setOwnMsg] = useState('');

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
    // var avatar = user[0].avatar;
    let username = user[0].username;
    if (m.senderid === me.id) {
      classToUse = classes.msgMe;
      username = '';
      // avatar = '';
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
        source: `${auth.userid}`,
        destination: `${convid}`,
        device: '1',
        payload: ownmsg,
      })
    );
  };

  return (
    <>
      <div className={classes.header}>
        <Link to="/conversation" className={displayBackBtn}>
          «
        </Link>
        Conversation name - config ({id})
        <Link 
          to="/convsettings/${id}"
          key={id}
          >
          <IconButton

            aria-label="settings"
            size="small"
          >
            <SettingsIcon />
          </IconButton>
        </Link>
      </div>
      <div className={classes.content}>{msg}</div>
      <div className={classes.footer}>
        <Input
          placeholder="Your text"
          inputProps={{
            'aria-label': 'description',
          }}
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
    </>
  );
};

export default Conversation;
