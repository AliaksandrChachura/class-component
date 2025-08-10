import { baseApi } from '../baseApi';
import type { RickMortyResponse, CharacterSearchPayload } from '../types';

const charactersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCharacters: builder.query<RickMortyResponse, CharacterSearchPayload>({
      keepUnusedDataFor: 600,
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
      providesTags: (result) =>
        result
          ? [
              { type: 'Characters' as const, id: 'LIST' as const },
              ...result.results.map(({ id }) => ({
                type: 'Character' as const,
                id,
              })),
            ]
          : [{ type: 'Characters' as const, id: 'LIST' as const }],
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { pageNumber, name } = queryArgs;
        return `${endpointName}-${pageNumber}-${name ?? ''}`;
      },
    }),
  }),
});

export const { useGetCharactersQuery } = charactersApi;
