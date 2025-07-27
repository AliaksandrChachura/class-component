import {
  createBrowserRouter,
  createMemoryRouter,
  type RouteObject,
} from 'react-router-dom';
import App from '../App';
import AboutPage from '../features/About/AboutPage';
import SearchPage from '../features/Search/SearchPage';
import CharacterDetails from '../components/CharacterDetails';
import { fetchCharacterDetails } from '../api/rickMortyAPI';
import NotFoundPage from '../components/NotFoundPage';

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
            loader: async ({ params }) => {
              const characterId = Number(params.id);
              const character = await fetchCharacterDetails(characterId);
              return { character };
            },
            element: <CharacterDetails isOpen={true} onClose={() => {}} />,
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

export const routes = createBrowserRouter(routeConfig); // for real app
export const createTestRouter = (initialEntries = ['/']) =>
  createMemoryRouter(routeConfig, { initialEntries });
