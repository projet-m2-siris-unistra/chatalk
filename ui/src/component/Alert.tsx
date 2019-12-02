import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { State } from '../store/state';
import { useSelector, useDispatch } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { clearAlert } from '../store/actions';

const useStyles = makeStyles({
  info: {
    color: '#fff',
    padding: '20px',
    position: 'fixed',
    display: 'flex',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '16px',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: '#22b26a',
  },
  error: {
    color: '#fff',
    padding: '20px',
    position: 'fixed',
    display: 'flex',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '16px',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: '#b22222',
  },
});

const Alert: React.FC = () => {
  const classes = useStyles();
  const alert = useSelector((state: State) => state.alert);
  const dispatch = useDispatch();

  if (!alert) return null;

  return (
    <div className={classes[alert.kind]}>
      <span>{alert.content}</span>
      <IconButton
        color="inherit"
        aria-label="close"
        size="small"
        onClick={() => dispatch(clearAlert())}
      >
        <CloseIcon />
      </IconButton>
    </div>
  );
};

export default Alert;
