import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './features/tasks/tasksSlice';
import authReducer from './features/auth/authSlice'; // ১. authReducer ইম্পোর্ট করুন


export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
        auth: authReducer, // ২. এখানে auth রিডিউসারটি যোগ করুন

    // অন্যান্য রিডিউসার এখানে যোগ হবে
  },
});

// TypeScript-এর জন্য এই টাইপগুলো এক্সপোর্ট করা খুবই ভালো অভ্যাস
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;