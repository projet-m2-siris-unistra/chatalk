import React from 'react';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Logo from './logo.png';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';


import { makeStyles } from '@material-ui/core/styles';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
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
  logo: {
    maxWidth: '150vw',
    width: 800,
    height: 450,
    maxWeigh: '150vw',
    paddingTop: theme.spacing(4),
  },
  footer: {
    paddingTop: theme.spacing(14),
    marginTop: 'auto',
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
const Homepage: React.FC = () => {
  const classes = useStyles();
  return (
    <div className={classes.paper}>
      <Typography variant="h2" align="center"style={{ color: '#0b6374' }}>Welcome to the best security chat application</Typography>
      <img src={Logo} alt="ChaTalK" className={classes.logo} />

      <ThemeProvider theme={theme}>
        <ul>
        <Button href="/login"
         variant="contained"
         color="primary"
         style={{marginRight: theme.spacing(5),
          marginTop: theme.spacing(10),
          minWidth:'350px',
          maxWidth:'350px',
          minHeight:'50px',
          maxHeight:'50px'}}>
           Click here to Login !
        </Button>
        <Button href="/register"
         variant="contained"
         color="primary"
         style={{marginRight: theme.spacing(5),
          marginTop: theme.spacing(10),
          minWidth:'350px',
          maxWidth:'350px',
          minHeight:'50px',
          maxHeight:'50px'}}>
           You don't have an account ? Click on me
        </Button>
        </ul>
        </ThemeProvider>
        <footer className={classes.footer}>
        <Container component="main" maxWidth="sm">
          <Grid
            container
            spacing={1}
            justify="space-between"
            alignItems="center"
          >
            <Grid item>
              <a href="https://status.chatalk.fr/" style={{ color: '#0b6374' }}>
                Status
              </a>
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

export default Homepage;
