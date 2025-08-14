import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Task-এর জন্য একটি টাইপ ডিফাইন করুন
// আমরা এখানে assignee যোগ করব, কারণ API থেকে এই তথ্যটি আসে
export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  createdAt: string; // createdAt যোগ করুন
  assignee?: {
    id: string;
    name: string;
  };
  activities?: TaskActivity[]; // activities অ্যারে যোগ করুন
}

export interface TaskActivity {
  id: string;
  description: string;
  createdAt: string; // API থেকে ডেট স্ট্রিং হিসেবে আসে
  user: {
    name: string;
  };
}

// State-এর টাইপ ডিফাইন করুন
interface TasksState {
  tasks: Task[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// প্রাথমিক স্টেট
const initialState: TasksState = {
  tasks: [],
  status: "idle",
  error: null,
};

// API থেকে ডেটা আনার জন্য একটি async thunk
// এখন এটি টোকেন ব্যবহার করে রিকোয়েস্ট পাঠাবে
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return rejectWithValue("No token found");
    }
    try {
      const response = await fetch("http://localhost:3001/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      return data as Task[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice তৈরি করুন
const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    // --- নতুন updateTaskStatus রিডিউসারটি এখানে যোগ করা হয়েছে ---
    updateTaskStatus: (state, action: PayloadAction<Task>) => {
      // state.tasks অ্যারের ভেতরে নির্দিষ্ট টাস্কটি খুঁজে বের করুন
      const index = state.tasks.findIndex(
        (task) => task.id === action.payload.id
      );

      // যদি টাস্কটি পাওয়া যায়, তাহলে সেটিকে নতুন তথ্য দিয়ে প্রতিস্থাপন করুন
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    // আপনি ভবিষ্যতে এখানে আরও রিডিউসার যোগ করতে পারেন
    // যেমন: addTask, removeTask ইত্যাদি
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.status = "succeeded";
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Something went wrong";
      });
  },
});

// --- updateTaskStatus অ্যাকশনটি এক্সপোর্ট করা হয়েছে ---
export const { updateTaskStatus } = tasksSlice.actions;

export default tasksSlice.reducer;
