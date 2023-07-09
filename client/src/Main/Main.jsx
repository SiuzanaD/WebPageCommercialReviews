import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { BsPersonCheckFill } from 'react-icons/bs';
import '../Main/Main.scss';

const MainPage = () => {
  return (
    <div className="main-page">
      <h2>Welcome to the best Web Pages Discuss spage</h2>
      <div className="buttons">
        <Link to="/login" className="button">
          <FaUserCircle />
          Login
        </Link>

        <Link to="/register" className="button">
          <BsPersonCheckFill /> Register
        </Link>
      </div>
    </div>
  );
};

export default MainPage;
