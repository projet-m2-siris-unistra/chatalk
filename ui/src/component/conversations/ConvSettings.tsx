import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import { Link, useParams } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import useAutocomplete from '@material-ui/lab/useAutocomplete';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import styled from 'styled-components';

import { useWebsocket } from '../WebsocketProvider';
import { useSelector } from 'react-redux';
import { State } from '../../store/state';

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
  const conv = useSelector((state: State) => state.conversations).filter(c => parseInt(c.convid) === convid)[0];
  const membersList = conv.members.replace('{','').replace('}','').split(',').map(n => parseInt(n));
  const users = useSelector((state: State) => state.users).filter(u => membersList.indexOf(u.userid) < 0);
  const members = useSelector((state: State) => state.users).filter(u => membersList.indexOf(u.userid) > -1);

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

  const del = useAutocomplete({
    id: 'participant-id',
    defaultValue: [],
    multiple: true,
    options: members,
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
    const delmembers = del.value.map((user:any) => user.userid)
    console.log('ConvSettings:change conv_settings', convname, convtopic);
    connection.send(
      JSON.stringify({
        action: 'conv_manag',
        payload: {
          convid: id,
          convname,
          convtopic,
          newmembers: `{${newmembers}}`,
          delmembers: `{${delmembers}}`,
        },
      })
    );
  };

  return (
    <div className={classes.settings}>
      <header className={classes.header}>
        <Link className={classes.headerBack} to={`/conversation/${id}`}>
          «
        </Link>
        <h1 className={classes.headerTitle}>Conversation Settings</h1>
        <p></p>
      </header>
      <p className={classes.description}>
        Manage Conversation: <strong>{conv.convname}</strong> .
      </p>
      <div className={classes.form}>
        <TextField 
                name="convname"
                label="Conversation Name"
                id="convname"
                onChange={e => setName(e.target.value)} 
                variant="outlined" />
        <TextField
                variant="outlined"
                fullWidth
                id="topic"
                label="Topic"
                name="topic"
                onChange={e => setTopic(e.target.value)} />
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

        <div>
          <div {...del.getRootProps()}>
            <Label {...del.getInputLabelProps()}>Delete Members:</Label>
            <InputWrapper ref={del.setAnchorEl} className={focused ? 'focused' : ''}>
              {del.value.map((option:any, index:any) => (
                <Tag label={option.username} {...del.getTagProps({ index })} />
              ))}

              <input {...del.getInputProps()} />
            </InputWrapper>
          </div>
          {del.groupedOptions.length > 0 ? (
            <Listbox {...del.getListboxProps()}>
              {del.groupedOptions.map((option, index) => (
                <li {...del.getOptionProps({ option, index })}>
                  <span>{option.username}</span>
                  <CheckIcon fontSize="small" />
                </li>
              ))}
            </Listbox>
          ) : null}
        </div>
        <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={convmanagement}
        >
          Save changes
        </Button>
      </div>
      <nav>
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

export default ConvSettings;
