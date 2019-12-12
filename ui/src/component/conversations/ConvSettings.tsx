import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import { Link, useParams } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';

import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import useAutocomplete from '@material-ui/lab/useAutocomplete';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import styled from 'styled-components';

import { useWebsocket } from '../WebsocketProvider';
import { useSelector } from 'react-redux';
import { State } from '../../store/state';

import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';


import {
  createMuiTheme,
  withStyles,
  ThemeProvider,
} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  button: {
    margin: theme.spacing(1),
    left:0,
    top:0,
    position:'absolute'
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

const Label = styled('label')`
  padding: 0 0 4px;
  line-height: 1.5;
  display: block;
`;

const InputWrapper = styled('div')`
  padding: 10px;
  border: 1px solid #d9d9d9;
  background-color: #fff;
  border-radius: 4px;
  padding: 1px;
  display: flex;
  flex-wrap: wrap;

  &:hover {
    border-color: #40a9ff;
  }

  &.focused {
    border-color: #40a9ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }

  & input {
    font-size: 14px;
    line-height: 26px;
    padding: 2px 6px;
    flex-grow: 1;
    border: 0;
    outline: 0;
  }
`;

const Tag = styled(({ label, onDelete, ...props }) => (
  <div {...props}>
    <span>{label}</span>
    <CloseIcon onClick={onDelete} />
  </div>
))`
  display: flex;
  align-items: center;
  height: 24px;
  margin: 2px;
  line-height: 22px;
  background-color: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 2px;
  box-sizing: content-box;
  padding: 0 4px 0 10px;
  outline: 0;
  overflow: hidden;

  &:focus {
    border-color: #40a9ff;
    background-color: #e6f7ff;
  }

  & span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  & svg {
    font-size: 12px;
    cursor: pointer;
    padding: 4px;
  }
`;

const Listbox = styled('ul')`
  margin: 0;
  margin-top: 2px;
  padding: 10px;
  position: absolute;
  list-style: none;
  background-color: #fff;
  overflow: auto;
  max-height: 250px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;

  & li {
    padding: 5px 12px;
    display: flex;

    & span {
      flex-grow: 1;
    }

    & svg {
      color: transparent;
    }
  }

  & li[aria-selected='true'] {
    background-color: #fafafa;
    font-weight: 600;

    & svg {
      color: #1890ff;
    }
  }

  & li[data-focus='true'] {
    background-color: #e6f7ff;
    cursor: pointer;

    & svg {
      color: #000;
    }
  }
`;

type Params = {
  id: string;
};

const ConvSettings: React.FC = () => {
  const { id } = useParams<Params>();
  const convid = parseInt(id);
  const classes = useStyles();
  const { connection, isOpen } = useWebsocket();
  const auth = useSelector((state: State) => state.auth);
  const [convname, setName] = useState('');
  const [convtopic, setTopic] = useState('');
  const conv = useSelector((state: State) => state.conversations).filter(c => parseInt(c.convid) === convid);
  const members = conv[0].members.replace('{','').replace('}','').split(',').map(n => parseInt(n));
  const users = useSelector((state: State) => state.users).filter(u => !members.includes(u.userid));

  const {
    getRootProps,
    getInputLabelProps,
    getInputProps,
    getTagProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    value,
    focused,
    setAnchorEl,
  } = useAutocomplete({
    id: 'participant-id',
    defaultValue: [],
    multiple: true,
    options: users,
    getOptionLabel: option => option.username,
  });

  const convmanagement = () => {
    if (!isOpen || connection === null) {
      console.error('ws is not open');
      return;
    }

    if (!auth) {
      console.error('user is not logged in');
      return;
    }

    const newmembers = value.map((user:any) => user.userid)

    console.log('ConvSettings:change conv_settings', convname, convtopic);
    connection.send(
      JSON.stringify({
        action: 'conv_manag',
        payload: {
          convid: id,
          convname,
          convtopic,
          newmembers: `{${newmembers}}`,
        },
      })
    );
  };

  return (
    <div className={classes.paper}>
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
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Typography className={classes.title} align="center">
          Conversation Managament
        </Typography>

        <form className={classes.form} noValidate>
          <Grid container spacing={2} alignItems="center">

            <Grid item xs={12}>
              <CssTextField
                variant="outlined"
                fullWidth
                name="convname"
                label="Conversation Name"
                id="convname"
                onChange={e => setName(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <CssTextField
                variant="outlined"
                fullWidth
                id="topic"
                label="Topic"
                name="topic"
                onChange={e => setTopic(e.target.value)}
              />
            </Grid>
          </Grid>

          <div>
          <div {...getRootProps()}>
            <Label {...getInputLabelProps()}>Add Members:</Label>
            <InputWrapper ref={setAnchorEl} className={focused ? 'focused' : ''}>
              {value.map((option:any, index:any) => (
                <Tag label={option.username} {...getTagProps({ index })} />
              ))}

              <input {...getInputProps()} />
            </InputWrapper>
          </div>
          {groupedOptions.length > 0 ? (
            <Listbox {...getListboxProps()}>
              {groupedOptions.map((option, index) => (
                <li {...getOptionProps({ option, index })}>
                  <span>{option.username}</span>
                  <CheckIcon fontSize="small" />
                </li>
              ))}
            </Listbox>
          ) : null}
        </div>

        <ThemeProvider theme={theme}>
            <Button
              type="button"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={convmanagement}

            >
              Save changes
            </Button>
          </ThemeProvider>
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

export default ConvSettings;
