import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// নতুন: Comment টাইপ
export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

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
  creator?: {
    // creator ঐচ্ছিক হতে পারে
    id: string;
    name: string;
  };
  assignees?: { id: string; name: string }[];
  activities?: TaskActivity[]; // activities অ্যারে যোগ করুন
  comments?: Comment[];
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
export const fetchTasksByProjectId = createAsyncThunk(
  "tasks/fetchByProject",
  async (projectId: string, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) return rejectWithValue("No token found");
    try {
      // এই নতুন এন্ডপয়েন্টটি আমাদের ব্যাকএন্ডে তৈরি করতে হবে
      const response = await fetch(
        `http://localhost:3001/projects/${projectId}/tasks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch tasks for this project"
        );
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
    // আপনার পুরনো রিডিউসারগুলো এখানে থাকবে
    updateTaskStatus: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(
        (task) => task.id === action.payload.id
      );
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    deleteTaskSuccess: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    },
    // আপনি চাইলে টাস্ক তৈরি করার পর fetch না করে, ম্যানুয়ালি যোগ করতে পারেন
    addTaskSuccess: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },

    addCommentToTask: (
      state,
      action: PayloadAction<{ taskId: string; newComment: Comment }>
    ) => {
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) {
        if (!task.comments) task.comments = [];
        task.comments.push(action.payload.newComment);
      }
    },
  },
  extraReducers: (builder) => {
    // builder এখন fetchTasksByProjectId হ্যান্ডেল করবে
    builder
      .addCase(fetchTasksByProjectId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchTasksByProjectId.fulfilled,
        (state, action: PayloadAction<Task[]>) => {
          state.status = "succeeded";
          state.tasks = action.payload;
        }
      )
      .addCase(fetchTasksByProjectId.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Something went wrong";
      });
  },
});

// --- updateTaskStatus অ্যাকশনটি এক্সপোর্ট করা হয়েছে ---
export const {
  updateTaskStatus,
  deleteTaskSuccess,
  addTaskSuccess,
  addCommentToTask,
} = tasksSlice.actions;

export default tasksSlice.reducer;
