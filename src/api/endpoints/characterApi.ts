import { baseApi } from '../baseApi';
import type { Character } from '../types';

const characterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCharacter: builder.query<Character, { id: number }>({
      query: ({ id }) => ({
        url: `/character/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'Character', id }],
    }),
  }),
});

export const { useGetCharacterQuery } = characterApi;
