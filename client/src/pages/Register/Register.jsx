import { useContext, useState } from 'react';
import { UserContext } from '../../context/UserContext';
import { TiLockClosed } from 'react-icons/ti';
import { BsPersonFill } from 'react-icons/bs';
import Button from '../../components/Button/Button';
import './Register.scss';

const Register = () => {
  const { handleRegister } = useContext(UserContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const user = {
      username,
      password,
      passwordConfirmation,
    };

    fetch('http://localhost:3001/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          handleRegister(data);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="register">
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
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>
            {' '}
            <TiLockClosed />
            Password:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>
            {' '}
            <TiLockClosed />
            Confirm Password:
          </label>
          <input
            type="password"
            id="passwordConfirmation"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />
          <div> {error && <p className="error">{error}</p>}</div>
        </div>
        <Button type="submit">Register</Button>
      </form>
    </div>
  );
};

export default Register;
