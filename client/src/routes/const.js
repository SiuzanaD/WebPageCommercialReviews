import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import LoginLayout from '../layouts/LoginLayout';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import Profile from '../pages/Profile/Profile';
import AddQuestion from '../pages/AddQuestion/AddQuestion';
import Answers from '../pages/Answers/Answers';
import Questions from '../pages/Questions/Questions';

export const REGISTER_ROUTE = '/register';
export const LOGIN_ROUTE = '/login';
export const PROFILE_ROUTE = '/profile';
export const COMMENTS_ROUTE = '/questions/:id';
export const NEW_QUESTION_ROUTE = '/questions/add';
export const QUESTIONS_ROUTE = '/';

export const loginRoutes = {
  Layout: LoginLayout,
  routes: [
    {
      path: LOGIN_ROUTE,
      Component: Login,
    },
    {
      path: REGISTER_ROUTE,
      Component: Register,
    },
    {
      path: COMMENTS_ROUTE,
      Component: Answers,
    },
    {
      path: QUESTIONS_ROUTE,
      Component: Questions,
    },
  ],
};

export const authenticatedRoutes = {
  Layout: AuthenticatedLayout,
  routes: [
    {
      path: NEW_QUESTION_ROUTE,
      Component: AddQuestion,
    },
    {
      path: PROFILE_ROUTE,
      Component: Profile,
    },
    {
      path: COMMENTS_ROUTE,
      Component: Answers,
    },
    {
      path: QUESTIONS_ROUTE,
      Component: Questions,
    },
  ],
};
