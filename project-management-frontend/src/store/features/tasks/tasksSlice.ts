import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Task-এর জন্য একটি টাইপ ডিফাইন করুন
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
}

// State-এর টাইপ ডিফাইন করুন
interface TasksState {
  tasks: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// প্রাথমিক স্টেট
const initialState: TasksState = {
  tasks: [],
  status: 'idle',
  error: null,
};

// API থেকে ডেটা আনার জন্য একটি async thunk
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const response = await fetch('http://localhost:3001/tasks'); // আপনার ব্যাকএন্ড API এন্ডপয়েন্ট
  const data = await response.json();
  return data as Task[];
});

// Slice তৈরি করুন
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // এখানে সিঙ্ক্রোনাস অ্যাকশন যোগ করতে পারেন, যেমন addTask, updateTask ইত্যাদি
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.status = 'succeeded';
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export default tasksSlice.reducer;