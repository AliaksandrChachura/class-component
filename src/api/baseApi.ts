import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseURL = '/api';

const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: baseURL }),
  tagTypes: ['Characters', 'Character'],
  keepUnusedDataFor: 600,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});

export { baseApi };
