import React from 'react';
import Conversation from './Conversation';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';


const useStyles = makeStyles(theme => ({
  layout: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    minHeight: '100vh',
    maxHeight: '100vh',
    overflow: 'auto',
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper
  },
  right: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    minHeight: '100vh',
    maxHeight: '100vh',
    width: '100%',
    overflow: 'auto',
    backgroundColor: theme.palette.background.paper
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
    overflowY: 'scroll',
    padding: '10px',
  },
  listItem: {
    borderRadius: '10px',
    marginBottom: '5px',
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },
  listLinkItem: {
    textDecoration: 'none',
  },
  conversationName: {
    color: theme.palette.text.primary,
  },
}));

const ConversationsList: React.FC = () => {
  const classes = useStyles();

  const conversations = [
    {
      id: '11132ba9-43e5-4684-9c3f-209453ecd213',
      name: 'Conversation1',
      avatar: `https://lorempixel.com/120/120/people/1`,
      lastMessage: {
        timestamp: Date.now(),
        from: {
          displayName: 'John Doe',
          username: 'jdoe',
          avatar: `https://lorempixel.com/120/120/people/1`,
        },
        message: 'Hello, this is a message! This application is amazing!',
      },
    },
    {
      id: '2d43fb7f-39dd-4a76-b281-65f1efbce7ed',
      name: 'Conversation2',
      avatar: `https://lorempixel.com/120/120/people/2`,
      lastMessage: {
        timestamp: Date.now(),
        from: {
          displayName: 'Jane Doe',
          username: 'j.doe',
          avatar: `https://lorempixel.com/120/120/people/2`,
        },
        message: 'Hi! I am happy to speak with you. :)',
      },
    },
    {
      id: 'dbf302b3-3abf-4a48-9ab3-2cc1b99f3f9d',
      name: 'Conversation3',
      avatar: `https://lorempixel.com/120/120/people/3`,
      lastMessage: {
        id: 'dbf302b3-3abf-4a48-9ab3-2cc1b99f3f9d',
        timestamp: Date.now(),
        from: {
          displayName: 'Someone',
          username: 'someone',
          avatar: `https://lorempixel.com/120/120/people/3`,
        },
        message: 'I am mysterious...',
      },
    },
  ];

  const listItems = conversations.map(c => (
    <Link to={`/conversation/${c.id}`} key={c.id} className={classes.listLinkItem}>
      <ListItem alignItems="flex-start" className={classes.listItem}>
        <ListItemAvatar>
          <Avatar alt={c.name} src={c.avatar} />
        </ListItemAvatar>
        <ListItemText
          className={classes.conversationName}
          primary={c.name}
          secondary={
            <React.Fragment>
              <Typography
                component="span"
                variant="body2"
                color="textPrimary"
              >
                {c.lastMessage.from.displayName}
              </Typography>
              <Typography component="span">{` - ${c.lastMessage.message}`}</Typography>
            </React.Fragment>
          }
        />
      </ListItem>
    </Link>
  ));

  return (
    <div className={classes.layout}>
      <div className={classes.left}>
        <div className={classes.header}>
          User avatar, +, config
        </div>
        <div className={classes.content}>
          <List>
            {listItems}
          </List>
        </div>
      </div>
      <div className={classes.right}>
        <Conversation />
      </div>
    </div>
  );
};

export default ConversationsList;
