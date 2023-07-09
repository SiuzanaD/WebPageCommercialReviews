import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './Login/Login';
import RegistrationPage from './Register/Register';
import Main from './Main/Main';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
    </Routes>

    //   <Switch>
    //     <Route exact path="/">
    //       <Main />
    //     </Route>
    //     <Route path="/login">
    //       <LoginPage />
    //     </Route>
    //     <Route path="/register">
    //       <RegistrationPage />
    //     </Route>
    //   </Switch>
    // </Router>
  );
};

export default App;
