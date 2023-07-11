import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AiFillHome } from 'react-icons/ai';
import '../Register/Register.scss';

const RegistrationPage = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleSurnameChange = (event) => {
    setSurname(event.target.value);
  };

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:3001/register', {
        name,
        surname,
        username,
        email,
        password,
      });
      console.log(response.data);
      navigate('/questions');
    } catch (error) {
      setError(error.response.data.error);
    }
  };

  return (
    <div className="registration-page">
      <Link to="/" className="home-button">
        <AiFillHome />
      </Link>
      <h2>Registration</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleNameChange}
          />
        </div>
        <div>
          <label>Surname:</label>
          <input
            type="text"
            id="surname"
            value={surname}
            onChange={handleSurnameChange}
          />
        </div>
        <div>
          <label>Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={handleUsernameChange}
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit">Register</button>
        <div className="already-have-account">
          <span>Already have an account?</span>
          <Link to="/login">Login</Link>{' '}
        </div>
      </form>
    </div>
  );
};

export default RegistrationPage;
