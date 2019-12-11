import React from 'react';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';

import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';

import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import Avatar from '@material-ui/core/Avatar';
import AccountCircle from '@material-ui/icons/AccountCircle';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';


import {
  createMuiTheme,
  withStyles,
  ThemeProvider,
} from '@material-ui/core/styles';

const options = ['input 1', 'input 3', 'input 3'];
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
    paddingTop: theme.spacing(8),
    marginTop: 'auto',
    display: 'flex',
  },

  logo: {
    maxWidth: '90vw',
  },
  title: {
    fontSize: '32px',
  },
  bigAvatar: {
    width: 120,
    height: 120,
    marginLeft: theme.spacing(16),
  },
  button: {
    margin: theme.spacing(1),
    left:0,
    top:0,
    position:'absolute'
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
  },
})(TextField);

const Settings: React.FC = () => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const handleClick = () => {


    console.info(`You clicked ${options[selectedIndex]}`);
  };

  const handleMenuItemClick = (event: React.MouseEvent<HTMLLIElement, MouseEvent>, index: React.SetStateAction<number>) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = (event: { target: any; }) => {
    if (anchorRef.current) {
      return;
    }

    setOpen(false);
  };


  return (
    <div className={classes.paper}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
          <Link to="/conversation">
            <Button
            type="button"
            style={{ color: '#0b6374' }}
            className={classes.button}
            startIcon={<ArrowBackIosIcon />}
            >
            Back
            </Button>
          </Link>
        <Typography className={classes.title} align="center">
          Settings
        </Typography>

        <form className={classes.form} noValidate>
          <Grid container spacing={2} alignItems="center">
            <Grid>
              <Avatar className={classes.bigAvatar}>
              </Avatar>
            </Grid>
            <Grid item xs={12}>
              <ThemeProvider theme={theme}>
                <CssTextField
                  autoComplete="fname"
                  name="avatar"
                  variant="outlined"
                  fullWidth
                  id="avatar"
                  label="Avatar URL"
                  autoFocus
                />
              </ThemeProvider>
            </Grid>

            <Grid item xs={12}>
              <CssTextField
                variant="outlined"
                fullWidth
                name="displayname"
                label="Display Name"
                id="displayname"
              />
            </Grid>

            <Grid item xs={12}>
              <CssTextField
                variant="outlined"
                fullWidth
                id="username"
                label="Username"
                name="username"
              />
            </Grid>

            <Grid item xs={12}>
              <CssTextField
                variant="outlined"
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
              />
            </Grid>

            <Grid item xs={12}>
              <CssTextField
                variant="outlined"
                fullWidth
                name="passwordconf"
                label="Password Confirmation"
                type="password"
                id="passwordconf"
              />
            </Grid>
      {/* pour input et output mais pas maintenant
      <Grid container direction="column" alignItems="center">
      <Grid item xs={12}>
        <ButtonGroup variant="contained" color="primary" ref={anchorRef} aria-label="split button">
          <Button onClick={handleClick}>{options[selectedIndex]}</Button>
          <Button
            color="primary"
            aria-controls={open ? 'split-button-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-label="select merge strategy"
            aria-haspopup="menu"
            fullWidth
            onClick={handleToggle}
          >
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>
        <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList id="split-button-menu">
                    {options.map((option, index) => (
                      <MenuItem
                        key={option}
                        disabled={index === 2}
                        selected={index === selectedIndex}
                        onClick={event => handleMenuItemClick(event, index)}
                      >
                        {option}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </Grid>
    </Grid>
                    */}
          </Grid>
          <ThemeProvider theme={theme}>
            <Button
              type="button"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}

            >
              Save changes
            </Button>
          </ThemeProvider>
          <Grid container direction="column" alignItems="center">
            <Grid item>
              <a href="/login" style={{ color: '#0b6374' }}>
                Logout
              </a>
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

export default Settings;
