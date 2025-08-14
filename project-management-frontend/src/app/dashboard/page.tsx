"use client";

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchTasks, updateTaskStatus } from '../../store/features/tasks/tasksSlice';
import { Task } from '../../store/features/tasks/tasksSlice';
import CreateTaskForm from '@/components/CreateTaskForm';
// CreateTaskForm কম্পোনেন্টটি ইম্পোর্ট করুন, যদি এটি আলাদা ফাইলে থাকে
// import CreateTaskForm from '../../components/CreateTaskForm';

const columnTitles: { [key: string]: string } = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

// প্রতিটি টাস্ক কার্ডের জন্য একটি আলাদা কম্পোনেন্ট
const TaskCard = ({ task }: { task: Task }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  // স্ট্যাটাস পরিবর্তনের জন্য হ্যান্ডলার
  const handleStatusChange = async (newStatus: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("Authentication token not found.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/tasks/${task.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const updatedTask = await response.json();
      if (response.ok) {
        // API সফল হলে Redux স্টোর আপডেট করুন
        dispatch(updateTaskStatus(updatedTask));
      } else {
        throw new Error(updatedTask.message || 'Failed to update status');
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      // এখানে আপনি চাইলে একটি এরর নোটিফিকেশন দেখাতে পারেন
    }
  };
  
  // পারমিশন চেক: শুধুমাত্র Admin, Project Manager বা অ্যাসাইন করা ইউজারই স্ট্যাটাস পরিবর্তন করতে পারবে
  const canEditStatus = 
    user?.role === 'admin' || 
    user?.role === 'project_manager' || 
    user?.id === task.assignee?.id;

  return (
    <div className="p-3 mb-3 rounded-lg shadow bg-white border border-gray-200">
      <div className="flex justify-between items-start">
        <p className="font-semibold text-gray-800">{task.title}</p>
        {/* আপনি চাইলে এখানে এডিট/ডিলিট করার জন্য একটি মেনু বাটন যোগ করতে পারেন */}
      </div>
      <p className="text-sm text-gray-600 mt-1 mb-3">{task.description}</p>
      
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-500">
          Assigned to: {task.assignee?.name || 'Unassigned'}
        </span>
        
        {canEditStatus ? (
          <select 
            value={task.status} 
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-xs p-1 border rounded-md bg-gray-50 focus:ring-1 focus:ring-blue-400 outline-none"
            onClick={(e) => e.stopPropagation()} // কার্ডের অন্য কোনো on-click ইভেন্ট থেকে বিরত রাখে
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        ) : (
          <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {columnTitles[task.status]}
          </span>
        )}
      </div>
    </div>
  );
};

// মূল ড্যাশবোর্ড কম্পোনেন্ট
const DashboardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, status: tasksStatus, error } = useSelector((state: RootState) => state.tasks);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // শুধুমাত্র যদি টাস্ক লোড না হয়ে থাকে, তাহলেই fetch করুন
    if (tasksStatus === 'idle') {
      dispatch(fetchTasks());
    }
  }, [tasksStatus, dispatch]);

  // টাস্কগুলোকে তাদের স্ট্যাটাস অনুযায়ী কলামে ভাগ করুন
  const columns = {
    todo: tasks.filter(task => task.status === 'todo'),
    in_progress: tasks.filter(task => task.status === 'in_progress'),
    done: tasks.filter(task => task.status === 'done'),
  };

  const canCreateTask = user?.role === 'admin' || user?.role === 'project_manager';

  let content;
  if (tasksStatus === 'loading') {
    content = <p className="text-center text-gray-500">Loading tasks...</p>;
  } else if (tasksStatus === 'succeeded') {
    content = (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.keys(columns).map(columnId => (
          <div key={columnId} className="p-4 rounded-lg shadow-inner bg-gray-100">
            <h2 className="font-bold mb-4 text-center text-gray-700 tracking-wider uppercase">
              {columnTitles[columnId]}
            </h2>
            <div className="space-y-3">
              {columns[columnId].length > 0 ? (
                columns[columnId].map(task => (
                  <TaskCard key={task.id} task={task} />
                ))
              ) : (
                <p className="text-sm text-center text-gray-400">No tasks in this column.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  } else if (tasksStatus === 'failed') {
    content = <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Task Board</h1>
        {canCreateTask && (
          // আপনি চাইলে এখানে একটি CreateTaskForm কম্পোনেন্ট দেখাতে পারেন অথবা একটি মডাল খুলতে পারেন
          <CreateTaskForm/>
        )}
      </div>
      {content}
    </div>
  );
};

export default DashboardPage;