"use client";

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { updateTaskStatus } from '../store/features/tasks/tasksSlice';
import { Task } from '../store/features/tasks/tasksSlice';

// কলামগুলোর জন্য টাইটেল
const columnTitles: { [key: string]: string } = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

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
        dispatch(updateTaskStatus(updatedTask));
      } else {
        throw new Error(updatedTask.message || 'Failed to update status');
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };
  
  // পারমিশন চেক
  const canEditStatus = 
    user?.role === 'admin' || 
    user?.role === 'project_manager' || 
    user?.id === task.assignee?.id;

  // তারিখ ফরম্যাট করার জন্য হেল্পার ফাংশন
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  // সর্বশেষ অ্যাক্টিভিটি খুঁজে বের করা
  const lastActivity = task.activities && task.activities.length > 0 
    ? [...task.activities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] 
    : null;

  return (
    <div className="p-3 mb-3 rounded-lg shadow-sm bg-white border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between min-h-[180px]">
      <div>
        <p className="font-semibold text-gray-800 break-words">{task.title}</p>
        <p className="text-sm text-gray-600 mt-1 mb-3 break-words">{task.description}</p>
      </div>
      
      <div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">
            Assigned: {task.assignee?.name || 'N/A'}
          </span>
          {canEditStatus ? (
            <select 
              value={task.status} 
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-xs p-1 border rounded-md bg-gray-50 focus:ring-1 focus:ring-blue-400 outline-none"
              onClick={(e) => e.stopPropagation()}
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
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Created: {formatDate(task.createdAt)}
          </p>
          {lastActivity && (
            <p className="text-xs text-gray-500 flex-1 italic mt-1 truncate">
              {lastActivity.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;