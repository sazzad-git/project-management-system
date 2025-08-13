import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// State-এর টাইপ
interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed'; // নতুন লোডিং স্টেট
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  status: 'idle', // প্রাথমিক স্ট্যাটাস 'idle'
};

const authSlice = createSlice({
  name: 'auth',
  initialState, // initialState এখানে ব্যবহার করা হচ্ছে
  reducers: {
    authLoading(state) {
      state.status = 'loading';
    },
    loginSuccess(state, action: PayloadAction<{ user: any; token: string }>) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem('token'); 
    },
    // স্টেট পুনরুদ্ধার করার জন্য একটি নতুন action
     setAuthState(state, action: PayloadAction<{ user: any; token: string }>) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.status = 'succeeded';
    },
  },
});

export const { loginSuccess,authLoading, logout, setAuthState } = authSlice.actions;
export default authSlice.reducer;