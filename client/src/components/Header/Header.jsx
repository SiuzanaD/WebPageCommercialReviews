import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import {
  REGISTER_ROUTE,
  LOGIN_ROUTE,
  PROFILE_ROUTE,
  QUESTIONS_ROUTE,
} from '../../routes/const';
import './Header.scss';

import { FaUserCircle } from 'react-icons/fa';

const Header = () => {
  const { isLoggedIn, user } = useContext(UserContext);

  return (
    <header className="navigation">
      <nav className="navigation-items">
        <Link to={QUESTIONS_ROUTE}>All Questions</Link>
        {isLoggedIn ? (
          <div className="logged">
            <Link to={PROFILE_ROUTE} className="user-container">
              <FaUserCircle className="user" />
            </Link>
          </div>
        ) : (
          <div className="notLogged">
            <Link to={LOGIN_ROUTE}>
              <div>Login</div>
            </Link>
            <Link to={REGISTER_ROUTE}>
              <div>Register</div>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
