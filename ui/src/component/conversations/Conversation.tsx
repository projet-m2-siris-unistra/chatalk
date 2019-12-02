import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Link, useParams } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  msg: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  header: {
    padding: '10px',
    lineHeight: '30px',
    fontSize: '18px',
    height: '50px',
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
}));

type Params = {
  id: string;
};

const Conversation: React.FC = () => {
  const { id } = useParams<Params>();
  const classes = useStyles();
  const isDesktop = useMediaQuery('(min-width:1000px)');

  const me = {
    id: 'dbf302b3-3abf-4a48-9ab3-2cc1b99f3f9f',
  };

  const messages = [
    {
      id: '1bf302b3-3abf-4a48-9ab3-2cc1b99f3f9a',
      timestamp: Date.now(),
      from: {
        id: 'dbf302b3-3abf-4a48-9ab3-2cc1b99f3f9d',
        displayName: 'Someone',
        username: 'someone',
        avatar: `https://lorempixel.com/120/120/people/?r=${Math.random()}`,
      },
      message: 'Hello',
    },
    {
      id: '2bf302b3-3abf-4a48-9ab3-2cc1b99f3f9b',
      timestamp: Date.now(),
      from: {
        id: 'dbf302b3-3abf-4a48-9ab3-2cc1b99f3f9d',
        displayName: 'Someone',
        username: 'someone',
        avatar: `https://lorempixel.com/120/120/people/?r=${Math.random()}`,
      },
      message: 'world',
    },
    {
      id: '3bf302b3-3abf-4a48-9ab3-2cc1b99f3f9d',
      timestamp: Date.now(),
      from: {
        id: 'dbf302b3-3abf-4a48-9ab3-2cc1b99f3f9f',
        displayName: 'John Doe',
        username: 'me',
        avatar: `https://lorempixel.com/120/120/people/?r=${Math.random()}`,
      },
      message: 'Coucou ! :)',
    },
  ];

  const msg = messages.map(m => {
    let classToUse = classes.msgOther;
    const avatar = <></>;
    if (m.from.id === me.id) {
      classToUse = classes.msgMe;
    }
    return (
      <div key={`msg-${m.id}`} className={classes.msg}>
        {avatar}
        <div key={`msg-content-${m.id}`} className={classToUse}>
          {m.message}
        </div>
      </div>
    );
  });

  let displayBackBtn = '';
  if (isDesktop) {
    displayBackBtn = classes.hidden;
  }

  return (
    <>
      <div className={classes.header}>
        <Link to="/conversation" className={displayBackBtn}>
          «
        </Link>
        Conversation name - config ({id})
      </div>
      <div className={classes.content}>{msg}</div>
    </>
  );
};

export default Conversation;
