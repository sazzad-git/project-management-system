import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

//  Comment Type
export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

// Task type
export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  createdAt: string;
  assignee?: {
    id: string;
    name: string;
  };
  creator?: {
    id: string;
    name: string;
  };
  assignees?: { id: string; name: string }[];
  activities?: TaskActivity[];
  comments?: Comment[];
}

export interface TaskActivity {
  id: string;
  description: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface TasksState {
  tasks: Task[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  status: "idle",
  error: null,
};

export const fetchTasksByProjectId = createAsyncThunk(
  "tasks/fetchByProject",
  async (projectId: string, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) return rejectWithValue("No token found");
    try {
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

// Slice Create
const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
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

// --- updateTaskStatus Export here---
export const {
  updateTaskStatus,
  deleteTaskSuccess,
  addTaskSuccess,
  addCommentToTask,
} = tasksSlice.actions;

export default tasksSlice.reducer;
