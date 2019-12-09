import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import Conversation from './Conversation';
import NewConversation from './New';
import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Link } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import SettingsIcon from '@material-ui/icons/Settings';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { useSelector } from 'react-redux';
import { State } from '../../store/state';

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
    backgroundColor: theme.palette.background.paper,
  },
  leftMobile: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    minHeight: '100vh',
    maxHeight: '100vh',
    overflow: 'auto',
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },

  hidden: {
    display: 'none',
  },

  right: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    minHeight: '100vh',
    maxHeight: '100vh',
    width: '100%',
    overflow: 'auto',
    backgroundColor: theme.palette.background.paper,
  },
  header: {
    alignItems: 'center',
    padding: '0 10px',
    lineHeight: '30px',
    fontSize: '18px',
    height: '50px',
    overflow: 'hidden',
    display: 'flex',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderBottomColor: theme.palette.grey[200],
  },
  headerTitle: {
    flex: 1,
    margin: '0 10px',
  },
  headerButton: {
    backgroundColor: '#0b6374',
    color: '#fff',
    marginLeft: '8px',
    '&:hover': {
      backgroundColor: '#0b6374',
      opacity: 0.8,
    },
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
  const isConversation = useRouteMatch('/conversation/:id') != null;
  const classes = useStyles();
  const isDesktop = useMediaQuery('(min-width:1000px)');
  const conversations = useSelector((state: State) => state.conversations);
  console.log("conversationindex: ",conversations);
  const listItems = conversations.map(c => (
    <Link
      to={`/conversation/${c.convid}`}
      key={c.convid}
      className={classes.listLinkItem}
    >
      <ListItem alignItems="flex-start" className={classes.listItem}>
        <ListItemAvatar>
          <Avatar alt={c.convname} />
        </ListItemAvatar>
        <ListItemText
          className={classes.conversationName}
          primary={c.convname}
          secondary={
            <React.Fragment>
              <Typography component="span" variant="body2" color="textPrimary">
                Someone
              </Typography>
              <Typography component="span">- Hello!</Typography>
            </React.Fragment>
          }
        />
      </ListItem>
    </Link>
  ));

  let leftClass = classes.left;
  let rightClass = classes.right;
  if (!isDesktop) {
    if (isConversation) {
      leftClass = classes.hidden;
    } else {
      leftClass = classes.leftMobile;
      rightClass = classes.hidden;
    }
  }

  return (
    <div className={classes.layout}>
      <div className={leftClass}>
        <div className={classes.header}>
          <Avatar>
            <AccountCircle />
          </Avatar>
          <div className={classes.headerTitle}>Conversations</div>
          <IconButton
            aria-label="settings"
            size="small"
            className={classes.headerButton}
          >
            <SettingsIcon />
          </IconButton>
          <Link to="/conversation/new">
            <IconButton
              aria-label="create conversation"
              size="small"
              className={classes.headerButton}
            >
              <AddIcon />
            </IconButton>
          </Link>
        </div>
        <div className={classes.content}>
          <List>{listItems}</List>
        </div>
      </div>
      <div className={rightClass}>
        <Switch>
          <Route exact path="/conversation/new" component={NewConversation} />
          <Route path="/conversation/:id" component={Conversation} />
          <Route>
            <div className={classes.header} />
            <div className={classes.content}>
              <div>No conversation selected.</div>
            </div>
          </Route>
        </Switch>
      </div>
    </div>
  );
};

export default ConversationsList;
