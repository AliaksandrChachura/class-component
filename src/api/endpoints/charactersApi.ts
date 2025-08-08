import { baseApi } from '../baseApi';
import type { RickMortyResponse, CharacterSearchPayload } from '../types';

const charactersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCharacters: builder.query<RickMortyResponse, CharacterSearchPayload>({
      query: ({ pageNumber = 1, pageSize = 20, name = '' }) => ({
        url: '/character',
        method: 'GET',
        params: {
          page: pageNumber.toString(),
          name,
          pageSize,
        },
      }),
    }),
  }),
});

export const { useGetCharactersQuery } = charactersApi;
