import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { useWebsocket } from './WebsocketProvider';
import { useSelector } from 'react-redux';
import { State } from '../store/state';

const useStyles = makeStyles({
  settings: {
    maxWidth: '1000px',
    margin: 'auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#0b6374',
    fontSize: '24px',
  },
  headerBack: {
    color: '#0b6374',
    padding: '20px',
    textDecoration: 'none',
  },
  headerTitle: {
    textAlign: 'center',
  },
  navLink: {
    display: 'block',
    color: '#0b6374',
    padding: '20px',
    fontWeight: 'bold',
    fontSize: '18px',
    textDecoration: 'none',
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    padding: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    '& > *': {
      marginBottom: '12px',
    },
  },
});

const Settings: React.FC = () => {
  const classes = useStyles();
  const { connection, isOpen } = useWebsocket();
  const auth = useSelector((state: State) => state.auth);
  const [username, setUName] = useState('');
  const [displayname, setDName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPswd] = useState('');


  const usermanag = () => {
    if (!isOpen || connection === null) {
      console.error('ws is not open');
      return;
    }

    if (!auth) {
      console.error('user is not logged in');
      return;
    }

    console.log('Settings:change user settings', username);
    connection.send(
      JSON.stringify({
        action: 'user-manag',
        payload: {
          userid: `${auth.userid}`,
          username,
          displayname,
          email,
          password,
        },
      })
    );
  };

  return (
    <div className={classes.settings}>
      <header className={classes.header}>
        <Link className={classes.headerBack} to="/conversation">
          «
        </Link>
        <h1 className={classes.headerTitle}>Settings</h1>
        <p></p>
      </header>
      <p className={classes.description}>
        On this page you can change some settings and logout if you want.
      </p>
      <div className={classes.form}>
        <TextField 
          label="Username" 
          variant="outlined"
          onChange={e => setUName(e.target.value)} />
        <TextField 
          label="Display name"
          variant="outlined"
          onChange={e => setDName(e.target.value)} />
        <TextField 
          label="Email" 
          type="email" 
          variant="outlined"
          onChange={e => setEmail(e.target.value)} />
        <TextField
          label="Password (leave empty if no change)"
          type="password"
          variant="outlined"
          onChange={e => setPswd(e.target.value)}
        />
        <Button 
            type="button" 
            variant="contained" 
            color="primary"
            onClick={usermanag}>
          Submit
        </Button>
      </div>
      <nav>
        <Link to="/logout" className={classes.navLink}>
          Logout
        </Link>
        <a href="https://blog.chatalk.fr/" className={classes.navLink}>
          Blog
        </a>
        <a href="https://status.chatalk.fr/" className={classes.navLink}>
          Status
        </a>
        <Link to="/credits" className={classes.navLink}>
          Credits
        </Link>
      </nav>
    </div>
  );
};

export default Settings;
