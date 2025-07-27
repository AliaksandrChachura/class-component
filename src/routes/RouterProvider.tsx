import { RouterProvider } from 'react-router-dom';
import router from './Routes';

const RouterProviderComponent: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default RouterProviderComponent;
