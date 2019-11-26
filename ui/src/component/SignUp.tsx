import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';

import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Logo from "./logo.png";
import { createMuiTheme, withStyles, ThemeProvider } from '@material-ui/core/styles';

import { useWebsocket } from './WebsocketProvider';
import { State } from '../store/state';
import { useSelector } from 'react-redux';

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  footer: {
    paddingTop:theme.spacing(8),
    marginTop:'auto',
    display: 'flex',
  },
}));

const theme = createMuiTheme({
  palette: {
    primary: {
     main: '#0b6374',
    },
  },
});

const CssTextField = withStyles({
  root: {

    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#0b6374',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#0b6374',
      },

  },
  '& label.Mui-focused': {
    color: '#0b6374',
  },
}
})(TextField);

const SignUp: React.FC = () => {
  const classes = useStyles();
  const { connection, isOpen } = useWebsocket();
  const auth = useSelector((state: State) => state.auth);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordconf, setPasswordconf] = useState('');


  const signUp = () => {
    if (!isOpen || connection === null) {
      console.error('ws is not open');
      return;
    }

    connection.send(JSON.stringify({
      action: "register",
      payload:{
        username,
        email,
        password,
        "password-confirmation": passwordconf,
      }
    }));
  };

  return (
    <div className={classes.paper}>
      <Container component="main" maxWidth="xs">
      <CssBaseline />
      <img src={Logo} alt="ChaTalK" />
      <Typography component="h1" variant="h2" align='center' >
        Sign up
      </Typography>
      <pre>{JSON.stringify(auth)}</pre>
      <form className={classes.form} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ThemeProvider theme={theme}>
            <CssTextField
              autoComplete="fname"
              name="Username"
              variant="outlined"
              required
              fullWidth
              id="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              label="Username"
              autoFocus
            />
            </ThemeProvider>
          </Grid>
          <Grid item xs={12}>
            <CssTextField
              variant="outlined"
              required
              fullWidth
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              label="Email Address"
              name="email"
              autoComplete="email"
            />
          </Grid>
          <Grid item xs={12}>
            <CssTextField
              variant="outlined"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Grid>

          <Grid item xs={12}>
            <CssTextField
              variant="outlined"
              required
              fullWidth
              name="passwordconf"
              label="Password confirmation"
              type="password"
              id="passwordconf"
              value={passwordconf}
              onChange={e => setPasswordconf(e.target.value)}
              autoComplete="current-password"
            />
          </Grid>
          <Grid item xs={12}>
          <ThemeProvider theme={theme}>
            <FormControlLabel
              control={<Checkbox value="allowExtraEmails" color="primary" />}
              label={
                <div>
                  <span>I accept the </span>
                  <Link to="/terms" style={{color: '#0b6374'}}>Terms of use</Link>
                  <span> and </span>
                  <Link to="/Privacy" style={{color: '#0b6374'}} >Privacy policy</Link>
                </div>
              }

            />
          </ThemeProvider>
          </Grid>
        </Grid>
        <ThemeProvider theme={theme}>
        <Button
          type="button"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={signUp}
        >
          Sign Up
        </Button>
        </ThemeProvider>
        <Grid container direction="column" alignItems = "center">
          <Grid item>
            <Link to="/login" style={{color: '#0b6374'}}>
              Already have an account? Sign in
            </Link>
          </Grid>
        </Grid>

      </form>
      </Container>
      <footer className={classes.footer}>
             <Container component="main" maxWidth= "sm">
             <Grid container spacing={1} justify="space-between" alignItems ="center">
               <Grid item xs>
                <Link to="/NotFound" style={{color: '#0b6374'}} >
                Status
              </Link>
              </Grid>
                <Grid item>
                <a href="https://blog.chatalk.fr" style={{color: '#0b6374'}}>
                  Blog
                </a>
                </Grid>
                <Grid item>
                <Link to="/credits" style={{color: '#0b6374'}} >
                  Credits
                </Link>
                </Grid>
              </Grid>
            </Container>
          </footer>
    </div>
  );
};

export default SignUp;
