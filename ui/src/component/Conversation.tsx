import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
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
  }
}));

const Conversation: React.FC = () => {
  const classes = useStyles();

  const me = {
    id: 'dbf302b3-3abf-4a48-9ab3-2cc1b99f3f9f'
  };

  const messages = [
    {
      id: '1bf302b3-3abf-4a48-9ab3-2cc1b99f3f9d',
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
      id: '2bf302b3-3abf-4a48-9ab3-2cc1b99f3f9d',
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
    const avatar = (<></>);
    if (m.from.id === me.id) {
      classToUse = classes.msgMe;
    }
    return (
      <>
        {avatar}
        <div key={m.id} className={classToUse}>
          {m.message}
        </div>
      </>
    );
  });

  return (
    <>
      <div className={classes.header}>
        «, Conversation name, config
      </div>
      <div className={classes.content}>
        {msg}
      </div>
    </>
  );
};

export default Conversation;
