import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { TiLockClosed } from 'react-icons/ti';
import { BsPersonFill } from 'react-icons/bs';
import { AiFillHome } from 'react-icons/ai';
import '../Login/Login.scss';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('/login', { username, password });
      console.log(response.data);
    } catch (error) {
      setError(error.response.data.error); // Handle the login error
    }
  };

  return (
    <div className="login-page">
      <Link to="/" className="home-button">
        <AiFillHome />
      </Link>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            <BsPersonFill />
            Username:
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={handleUsernameChange}
          />
        </div>
        <div>
          <label>
            {' '}
            <TiLockClosed /> Password:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit">Login</button>
      </form>
      <div className="register-link">
        Don't have an account? <Link to="/register">Register</Link>{' '}
      </div>
    </div>
  );
};

export default LoginPage;
