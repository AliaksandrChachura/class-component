import { RouterProvider } from 'react-router-dom';
import { routes } from './Routes';

const RouterProviderComponent: React.FC = () => {
  return <RouterProvider router={routes} />;
};

export default RouterProviderComponent;
