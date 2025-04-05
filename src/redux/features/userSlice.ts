import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  _id?: string;

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
        ...action.payload,
        isAuthenticated: true,
      };
    },
    clearUser: () => initialState,
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
