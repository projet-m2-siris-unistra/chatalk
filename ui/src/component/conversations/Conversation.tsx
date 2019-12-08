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
    display:'flex',
    height: '60px',
    overflow: 'hidden',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderBottomColor: theme.palette.grey[200],
    },
  content: {
    minHeight: 'calc(100vh - 50px)',
    maxHeight: 'calc(100vh - 50px)',
    overflow: 'auto',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
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
    borderTopColor: theme.palette.grey[200],  },
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
  const [ownmsg, setOwnMsg] = useState('');

  const me = {
      id: 0,
    };
  if (auth) {
    me.id = auth.userId
  }

  const messages = conmsgs.filter(m => m.convid === convid);

  const msg = messages.map(m => {
    let classToUse = classes.msgOther;
    const avatar = <></>;
    if (m.senderid === me.id) {
      classToUse = classes.msgMe;
    }
    return (
      <div key={`msg-${m.msgid}`} className={classes.msg}>
        {avatar}
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
    
    console.log('send message:', auth.userId, ownmsg);
    connection.send(
      JSON.stringify({
        action: 'msg_sender',
        source: `${auth.userId}`,
        destination: `${convid}`,
        device: "1",
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
      </div>
      <div className={classes.content}>{msg}
     
      </div>
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
