import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Link } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { useWebsocket } from '../WebsocketProvider';
import { useSelector } from 'react-redux';
import { State } from '../../store/state';
import useAutocomplete from '@material-ui/lab/useAutocomplete';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import styled from 'styled-components';
import crypto from 'crypto';

const useStyles = makeStyles(theme => ({
  header: {
    padding: '10px',
    lineHeight: '30px',
    fontSize: '18px',
    height: '50px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderBottomColor: theme.palette.grey[200],
  },
  content: {
    minHeight: 'calc(100vh - 50px)',
    maxHeight: 'calc(100vh - 50px)',
    overflowY: 'scroll',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    '& > *': {
      marginBottom: '12px',
    },
  },
  hidden: {
    display: 'none',
  },
  input: {
    width: '100%',
    margin: '16px',
  },
}));

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

const NewConversation: React.FC = () => {
  const classes = useStyles();
  const isDesktop = useMediaQuery('(min-width:1000px)');
  const { connection, isOpen } = useWebsocket();
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const auth = useSelector((state: State) => state.auth);
  var users = useSelector((state: State) => state.users);
  if (auth) {
    users = users.filter(u => u.userid !== auth.userid);
  }

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

  let displayBackBtn = '';
  if (isDesktop) {
    displayBackBtn = classes.hidden;
  }

  const createConversation = () => {
    if (!isOpen || connection === null) {
      console.error('ws is not open');
      return;
    }

    if (!auth) {
      console.error('user is not logged in');
      return;
    }

    const init_vect = crypto.randomBytes(16);
    const random_key = crypto.randomBytes(32);
    const shared_key = Buffer.concat([random_key, init_vect]);
    console.log('wtf1');
    const pubkeystr = localStorage.getItem(`publicKey_${auth.username}`);
    if(pubkeystr === null){
      console.error('No public key for this user.');
      return;
    }
    console.log('wtf2');

    const pubkey = Buffer.from(pubkeystr, 'base64');
    const encryptedsk = crypto.publicEncrypt(pubkey, shared_key)
    const encrypted_sk = encryptedsk.toString();
    console.log('wtf3');

    const members_sk = value.map((user: any) =>
    crypto.publicEncrypt(user.publickey, shared_key).toString());
    const members = value.map((user: any) => user.userid);

    console.log('new:create conv:', name, topic);
    connection.send(
      JSON.stringify({
        action: 'conv_creation',
        payload: {
          userid: `${auth.userid}`,
          convname: name,
          topic,
          picture: '',
          sharedkey: encrypted_sk,
          members: `{${members}}`,
          memberssk: `{${members_sk}}`,
        },
      })
    );
  };

  return (
    <>
      <div className={classes.header}>
        <Link to="/conversation" className={displayBackBtn}>
          <ArrowBackIosIcon />
        </Link>
        Create a new conversation
      </div>
      <div className={classes.content}>
        <p>
          Create a new conversation by specifying a conversation name and a
          topic.
        </p>
        <TextField
          label="Conversation name"
          variant="outlined"
          onChange={e => setName(e.target.value)}
        />
        <TextField
          label="Topic"
          variant="outlined"
          onChange={e => setTopic(e.target.value)}
        />
        <div>
          <div {...getRootProps()}>
            <Label {...getInputLabelProps()}>Add Members:</Label>
            <InputWrapper
              ref={setAnchorEl}
              className={focused ? 'focused' : ''}
            >
              {value.map((option: any, index: any) => (
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
        <Button
          variant="contained"
          color="primary"
          onClick={createConversation}
        >
          Create the conversation
        </Button>
      </div>
    </>
  );
};

export default NewConversation;
