"use client"; // <--- এই লাইনটিই সমাধান! এটিকে ফাইলের একদম উপরে যোগ করুন।

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { fetchTasks } from '../../store/features/tasks/tasksSlice';

const DashboardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // এখন এই কোডটি ক্লায়েন্টে চলবে এবং 'status' ভেরিয়েবলটি সঠিকভাবে পাবে
  const { tasks, status, error } = useSelector((state: RootState) => state.tasks);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTasks());
    }
  }, [status, dispatch]);

  let content;

  if (status === 'loading') {
    content = <p>Loading tasks...</p>;
  } else if (status === 'succeeded') {
    content = (
      <ul>
        {Array.isArray(tasks) && tasks.length > 0 ? (
          tasks.map((task) => (
            <li key={task.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <span>Status: {task.status}</span>
            </li>
          ))
        ) : (
          <p>No tasks found.</p>
        )}
      </ul>
    );
  } else if (status === 'failed') {
    content = <p>{error}</p>;
  }

  return (
    <div>
      <h1>Task Management Dashboard</h1>
      {content}
    </div>
  );
};

export default DashboardPage;