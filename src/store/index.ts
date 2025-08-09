import { configureStore } from '@reduxjs/toolkit';
import selectedItemsSlice from './slices/cardsSlicer';
import { baseApi } from '../api/baseApi';

export const store = configureStore({
  reducer: {
    selectedItems: selectedItemsSlice,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
