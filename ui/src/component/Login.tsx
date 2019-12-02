import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Button from '@material-ui/core/Button';
import Logo from './logo.png';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import {
  createMuiTheme,
  withStyles,
  ThemeProvider,
} from '@material-ui/core/styles';
import { useWebsocket } from './WebsocketProvider';

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
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  footer: {
    paddingTop: theme.spacing(10),
    marginTop: 'auto',
    display: 'flex',
  },

  logo: {
    maxWidth: '90vw',
  },
  title: {
    fontSize: '32px',
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
    },
  },
})(TextField);

const Login: React.FC = () => {
  const classes = useStyles();
  const { connection, isOpen } = useWebsocket();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = () => {
    if (!isOpen || connection === null) {
      console.error('ws is not open');
      return;
    }

    connection.send(
      JSON.stringify({
        action: 'login',
        payload: {
          username,
          password,
        },
      })
    );
  };

  return (
    <div className={classes.paper}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <img src={Logo} alt="ChaTalK" className={classes.logo} />
        <Typography className={classes.title} align="center">
          Sign in
        </Typography>
        <form className={classes.form} noValidate>
          <ThemeProvider theme={theme}>
            <CssTextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username or email"
              name="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
            <CssTextField
              variant="outlined"
              margin="normal"
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
          </ThemeProvider>
          <ThemeProvider theme={theme}>
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
          </ThemeProvider>
          <ThemeProvider theme={theme}>
            <Button
              type="button"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={login}
            >
              Sign In
            </Button>
          </ThemeProvider>

          <Grid
            container
            spacing={2}
            direction="column"
            justify="space-between"
            alignItems="center"
          >
            <Grid item xs>
              <Link to="#" style={{ color: '#0b6374' }}>
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link to="/register" style={{ color: '#0b6374' }}>
                Don't have an account? Sign Up
              </Link>
            </Grid>
          </Grid>
        </form>
      </Container>
      <footer className={classes.footer}>
        <Container component="main" maxWidth="sm">
          <Grid
            container
            spacing={1}
            justify="space-between"
            alignItems="center"
          >
            <Grid item xs>
              <Link to="/NotFound" style={{ color: '#0b6374' }}>
                Status
              </Link>
            </Grid>
            <Grid item>
              <a href="https://blog.chatalk.fr" style={{ color: '#0b6374' }}>
                Blog
              </a>
            </Grid>
            <Grid item>
              <Link to="/credits" style={{ color: '#0b6374' }}>
                Credits
              </Link>
            </Grid>
          </Grid>
        </Container>
      </footer>
    </div>
  );
};

export default Login;
