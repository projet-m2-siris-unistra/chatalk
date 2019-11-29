import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { State } from '../store/state';
import { useSelector } from 'react-redux';

const useStyles = makeStyles({
  info: {
    color: '#fff',
    backgroundColor: 'green',
  },
  error: {
    color: '#fff',
    backgroundColor: 'red',
  },
});

const Alert: React.FC = () => {
  const classes = useStyles();
  const alert = useSelector((state: State) => state.alert);

  if (!alert) return null;

  return <div className={classes[alert.kind]}>{alert.content}</div>;
};

export default Alert;
