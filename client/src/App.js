import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './Login/Login';
import RegistrationPage from './Register/Register';
import AskQuestion from './Questions/AskQuestion';
import AllQuestion from './Questions/AllQuestions';
import Main from './Main/Main';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/question" element={<AskQuestion />} />
      <Route path="/questions" element={<AllQuestion />} />
    </Routes>
  );
};

export default App;
