import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    color: '#0b6374',
    fontSize: '24px',
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
});

const NotFound: React.FC = () => {
  const classes = useStyles();
  return (
    <>
      <header className={classes.header}>
        <h1 className={classes.headerTitle}>Page Not Found</h1>
      </header>
      <p className={classes.description}>This page does not exist.</p>
      <nav>
        <Link to="/" className={classes.navLink}>
          Go back to the homepage
        </Link>
      </nav>
    </>
  );
};

export default NotFound;
