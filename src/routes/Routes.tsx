import {
  createBrowserRouter,
  createMemoryRouter,
  type RouteObject,
} from 'react-router-dom';
import App from '../App';
import AboutPage from '../features/About/AboutPage';
import SearchPage from '../features/Search/SearchPage';
import NotFoundPage from '../components/NotFoundPage';
import CharacterDetailsPage from './CharacterDetailsPage';

export const routeConfig: RouteObject[] = [
  {
    path: '/',
    Component: App,
    children: [
      {
        index: true,
        element: <SearchPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'results',
        element: <SearchPage />,
        children: [
          {
            path: ':id',
            element: <CharacterDetailsPage />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
        errorElement: <NotFoundPage />,
      },
    ],
  },
];

export const routes = createBrowserRouter(routeConfig);
export const createTestRouter = (initialEntries = ['/']) =>
  createMemoryRouter(routeConfig, { initialEntries });
