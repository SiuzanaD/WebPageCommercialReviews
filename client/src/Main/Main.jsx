import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaQuestionCircle } from 'react-icons/fa';
import { BsPersonCheckFill } from 'react-icons/bs';
import { RiQuestionnaireFill } from 'react-icons/ri';
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

        <Link to="/question" className="button">
          <RiQuestionnaireFill /> Ask question
        </Link>
        <Link to="/questions" className="button">
          <FaQuestionCircle /> See all questions
        </Link>
      </div>
    </div>
  );
};

export default MainPage;
