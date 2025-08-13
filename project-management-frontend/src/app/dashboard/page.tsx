"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import { fetchTasks } from "../../store/features/tasks/tasksSlice";
import CreateTaskForm from "../../components/CreateTaskForm";

const DashboardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, status, error } = useSelector((state: RootState) => state.tasks);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchTasks());
    }
  }, [status, dispatch]);

  let content;

  if (status === "loading") {
    content = <p className="text-center text-gray-600">Loading tasks...</p>;
  } else if (status === "succeeded") {
    content = (
      <div className="grid gap-4">
        {Array.isArray(tasks) && tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 bg-white rounded-xl shadow hover:shadow-md transition duration-200 border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
              <p className="text-gray-600 mt-1">{task.description}</p>
              <span className="text-sm font-medium text-blue-600 mt-2 inline-block">
                Status: {task.status}
              </span>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No tasks found.</p>
        )}
      </div>
    );
  } else if (status === "failed") {
    content = <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Task Management Dashboard
        </h1>

        {/* Create Task Form */}
        <div className="mb-6">
          <CreateTaskForm />
        </div>

        {/* Task List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Tasks</h2>
          <hr className="mb-4 border-gray-200" />
          {content}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
