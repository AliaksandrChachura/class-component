import { baseApi } from '../baseApi';
import type { RickMortyResponse, CharacterSearchPayload } from '../types';

const charactersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCharacters: builder.query<RickMortyResponse, CharacterSearchPayload>({
      query: ({ pageNumber = 1, name = '', pageSize = 20 }) => {
        return {
          url: '/character',
          method: 'GET',
          params: {
            page: pageNumber,
            name,
            pageSize,
          },
        };
      },
    }),
  }),
});

export const { useGetCharactersQuery } = charactersApi;
