import React from 'react';
import Link from '@material-ui/core/Link';
import Button from '@material-ui/core/Button';
import Logo from './logo.png';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  wrapper: {
    padding: '20px',
    background: '#fff',
    minHeight: '100vh',
    width: '100%',
    overflowX: 'hidden',
  },
  header: {
    padding: '0 8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 'auto',
    maxWidth: '1000px',
  },
  navA: {
    textDecoration: 'none',
    display: 'inline-block',
    padding: '20px',
    color: '#212121',
    fontSize: '18px',
    fontWeight: 'bold',
    '&:hover': {
      color: '#0b6374',
    },
  },
  logo: {
    width: '110px',
  },
  h1: {
    textAlign: 'left',
    fontSize: '42px',
    lineHeight: '50px',
    marginBottom: '42px',
  },
  device: {
    borderColor: '#212121',
    borderWidth: '20px',
    borderRadius: '10px',
    borderStyle: 'solid',
    width: '450px',
    transform: 'rotate(5deg)',
    transformOrigin: 'top left',
    float: 'right',
    marginLeft: '150px',
    marginTop: '50px',
  },
  footer: {
    textAlign: 'center',
    margin: 'auto',
    maxWidth: '1000px',
  },
  primaryContent: {
    marginTop: '150px',
    paddingLeft: '0 40px',
    textAlign: 'justify',
    fontSize: '18px',
    lineHeight: '24px',
    margin: 'auto',
    maxWidth: '1000px',
  },
  actionBtnWrapper: {
    margin: '100px 0',
    textAlign: 'center',
  },
  actionBtn: {
    backgroundColor: '#0b6374',
  },
  '@media screen and (max-width: 1000px)': {
    device: {
      marginTop: '100px',
      borderWidth: '15px',
      width: '200px',
      marginLeft: '50px',
    },
    primaryContent: {
      marginTop: '100px',
    },
  },
  '@media screen and (max-width: 800px)': {
    device: {
      display: 'none',
    },
    primaryContent: {
      marginTop: '50px',
    },
    logo: {
      width: '90px',
    },
    navA: {
      textDecoration: 'none',
      display: 'inline-block',
      padding: '12px',
      color: '#212121',
      fontSize: '14px',
      fontWeight: 'bold',
      '&:hover': {
        color: '#0b6374',
      },
    },
  },
});

const Homepage: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
      <header className={classes.header}>
        <img className={classes.logo} src={Logo} alt="ChaTalK's logo" />
        <nav>
          <Link className={classes.navA} href="/login">
            Log In
          </Link>
           | 
          <Link className={classes.navA} href="/register">
            Sign Up
          </Link>
        </nav>
      </header>
      <div>
        <img
          className={classes.device}
          src="screen.png"
          alt="ChaTalK conversation"
        />
      </div>
      <div className={classes.primaryContent}>
        <h1 className={classes.h1}>Secure chat for everyone</h1>
        <p>Connect to your team-mates and speak together securely!</p>
        <p>
          Want to share your work, ask for help or want to drink your coffee
          together? ChaTalK is the perfect solution for you!
        </p>
        <p>
          Security is one of the main key of our application: all exchanges
          between your device and our servers are encrypted and all of your
          communications can never be decoded from our infrastructure.
        </p>
        <p className={classes.actionBtnWrapper}>
          <Link href="/conversation" underline="none">
            <Button
              size="large"
              className={classes.actionBtn}
              variant="contained"
              color="primary"
            >
              Launch application
            </Button>
          </Link>
        </p>
      </div>
      <footer className={classes.footer}>
        <nav>
          <a className={classes.navA} href="https://status.chatalk.fr/">
            Status
          </a>
           - 
          <a className={classes.navA} href="https://blog.chatalk.fr">
            Blog
          </a>
          -
          <Link className={classes.navA} href="/credits">
            Credits
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default Homepage;
