import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './features/tasks/tasksSlice';

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    // অন্যান্য রিডিউসার এখানে যোগ হবে
  },
});

// TypeScript-এর জন্য এই টাইপগুলো এক্সপোর্ট করা খুবই ভালো অভ্যাস
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;