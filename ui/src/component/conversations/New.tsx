import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Link } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { useWebsocket } from '../WebsocketProvider';
import { useSelector } from 'react-redux';
import { State } from '../../store/state';

const useStyles = makeStyles(theme => ({
  header: {
    padding: '10px',
    lineHeight: '30px',
    fontSize: '18px',
    height: '50px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderBottomColor: theme.palette.grey[200],
  },
  content: {
    minHeight: 'calc(100vh - 50px)',
    maxHeight: 'calc(100vh - 50px)',
    overflowY: 'scroll',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    '& > *': {
      marginBottom: '12px',
    },
  },
  hidden: {
    display: 'none',
  },
  input: {
    width: '100%',
    margin: '16px',
  },
}));

const NewConversation: React.FC = () => {
  const classes = useStyles();
  const isDesktop = useMediaQuery('(min-width:1000px)');
  const { connection, isOpen } = useWebsocket();
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const auth = useSelector((state: State) => state.auth);

  let displayBackBtn = '';
  if (isDesktop) {
    displayBackBtn = classes.hidden;
  }

  const createConversation = () => {
    if (!isOpen || connection === null) {
      console.error('ws is not open');
      return;
    }

    if (!auth) {
      console.error('user is not logged in');
      return;
    }

    console.log('create conv:', name, topic);
    connection.send(
      JSON.stringify({
        action: 'conv_creation',
        payload: {
          userid: `${auth.userId}`,
          convname: name,
          topic,
          picture: '',
        },
      })
    );
  };

  return (
    <>
      <div className={classes.header}>
        <Link to="/conversation" className={displayBackBtn}>
          <ArrowBackIosIcon />
        </Link>
        Create a new conversation
      </div>
      <div className={classes.content}>
        <p>
          Create a new conversation by specifying a conversation name and a
          topic.
        </p>
        <TextField
          label="Conversation name"
          variant="outlined"
          onChange={e => setName(e.target.value)}
        />
        <TextField
          label="Topic"
          variant="outlined"
          onChange={e => setTopic(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={createConversation}
        >
          Create the conversation
        </Button>
      </div>
    </>
  );
};

export default NewConversation;
