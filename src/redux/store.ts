import {
  combineReducers,
  ThunkAction,
  Action,
  createStore,
  applyMiddleware,
} from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import { persistStore, persistReducer } from "redux-persist";
import { WebStorage } from "redux-persist/lib/types";
import { thunk } from "redux-thunk";

// Custom storage with type safety
const createCustomStorage = async (): Promise<WebStorage> => {
  if (typeof window !== "undefined") {
    const storageModule = await import("redux-persist/lib/storage");
    return storageModule.default;
  }
  const webStorageModule = await import(
    "redux-persist/lib/storage/createWebStorage"
  );
  return webStorageModule.default("local");
};

const rootReducer = combineReducers({
  user: userReducer,
});

const initializeStore = async () => {
  const storage = await createCustomStorage();
  const persistConfig = {
    key: "root",
    version: 1,
    storage,
    whitelist: ["user"], // only user will be persisted
    blacklist: [], // add any reducers you don't want to persist here
  };

  const persistedReducer = persistReducer(persistConfig, rootReducer);
  const store = createStore(persistedReducer, applyMiddleware(thunk));
  const persistor = persistStore(store);
  return { store, persistor };
};

export const { store, persistor } = await initializeStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
