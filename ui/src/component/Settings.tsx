import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

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
        <TextField label="Username" variant="outlined" />
        <TextField label="Display name" variant="outlined" />
        <TextField label="Email" type="email" variant="outlined" />
        <TextField
          label="Password (leave empty if no change)"
          type="password"
          variant="outlined"
        />
        <Button type="button" variant="contained" color="primary">
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
