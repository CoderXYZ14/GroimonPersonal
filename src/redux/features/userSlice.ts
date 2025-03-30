import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  _id?: string;
  name?: string;
  email?: string;
  image?: string;
  provider?: string;
  instagramId?: string;
  instagramUsername?: string;
  instagramAccessToken?: string;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<Omit<UserState, "isAuthenticated">>
    ) => {
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
      };
    },
    clearUser: () => {
      return {
        isAuthenticated: false,
      };
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
