import React from 'react';
import { Link } from 'react-router-dom';

const Homepage: React.FC = () => {
  return (
    <div>
      <h1>Welcome home!</h1>
      <ul>
        <Link to="/login">Login</Link>
        <Link to="/register">SignUp</Link>
        <Link to="/conversation">Conversations</Link>
        <Link to="/credits">Credits</Link>
      </ul>
    </div>
  );
};

export default Homepage;
