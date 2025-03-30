import { configureStore, combineReducers, ThunkAction, Action } from '@reduxjs/toolkit';
import userReducer from './features/userSlice';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { WebStorage } from 'redux-persist/lib/types';

// Custom storage with type safety
const createCustomStorage = (): WebStorage => {
  if (typeof window !== 'undefined') {
    return require('redux-persist/lib/storage').default;
  }
  return require('redux-persist/lib/storage/createWebStorage').default('local');
};

const persistConfig = {
  key: 'root',
  version: 1,
  storage: createCustomStorage(),
  whitelist: ['user'], // only user will be persisted
  blacklist: [], // add any reducers you don't want to persist here
};

const rootReducer = combineReducers({
  user: userReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
