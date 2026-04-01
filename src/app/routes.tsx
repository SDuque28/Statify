import { createBrowserRouter, Navigate } from 'react-router';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Layout } from './pages/Layout';
import { Home } from './pages/Home';
import { Settings } from './pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/auth',
    element: <Auth />,
  },
  {
    path: '/home',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
    ],
  },
  {
    path: '/settings',
    element: <Layout />,
    children: [
      { index: true, element: <Settings /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);