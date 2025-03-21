import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <div>Home Page</div>,
      },
    ],
  },
]);

export default router;

