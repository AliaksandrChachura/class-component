import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseURL = 'https://rickandmortyapi.com/api';

const baseApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: baseURL }),
  endpoints: () => ({}),
  tagTypes: ['Characters', 'Character'],
});

export { baseApi };
