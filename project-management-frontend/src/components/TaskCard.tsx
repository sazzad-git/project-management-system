"use client";

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
// deleteTaskSuccess অ্যাকশনটিও ইম্পোর্ট করুন
import { updateTaskStatus, deleteTaskSuccess } from '../store/features/tasks/tasksSlice'; 
import { Task } from '../store/features/tasks/tasksSlice';
import { FaEdit } from 'react-icons/fa'; // Edit আইকন ইম্পোর্ট করুন

const columnTitles: { [key: string]: string } = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

// --- ১. কম্পোনেন্টের props-এর জন্য টাইপ ডিফাইন করুন ---
interface TaskCardProps {
  task: Task;
  onEditClick: (task: Task) => void;
}

// --- ২. কম্পোনেন্টটিকে props গ্রহণ করার জন্য পরিবর্তন করুন ---
const TaskCard = ({ task, onEditClick }: TaskCardProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleStatusChange = async (newStatus: string) => {
    const token = localStorage.getItem('token');
    if (!token) { console.error("Token not found."); return; }
    try {
      const response = await fetch(`http://localhost:3001/tasks/${task.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
  
  const handleDelete = async () => {
    if (!canDeleteTask || !confirm('Are you sure you want to delete this task?')) {
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3001/tasks/${task.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        dispatch(deleteTaskSuccess(task.id));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  // পারমিশন চেক
  const canUpdateStatus = 
    user?.role === 'admin' ||
    user?.role === 'project_manager' ||
    (user?.role === 'developer' && task.assignees?.some(a => a.id === user.id));
    
  const canDeleteTask = 
    user?.role === 'admin' ||
    (user?.role === 'project_manager' && task.creator?.id === user.id);
    
  // --- ৩. টাস্ক এডিট করার পারমিশন ---
  const canEditTask = 
    user?.role === 'admin' ||
    (user?.role === 'project_manager' && task.creator?.id === user.id) ||
    task.assignees?.some(a => a.id === user.id);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const lastActivity = task.activities && task.activities.length > 0 
    ? [...task.activities].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] 
    : null;

  return (
    <div className="p-3 mb-3 rounded-lg shadow-sm bg-white border border-gray-200 flex flex-col justify-between min-h-[200px]">
      <div>
        <div className="flex justify-between items-start gap-2">
          <p className="font-semibold text-gray-800 break-words">{task.title}</p>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* --- ৪. Edit বাটন যোগ করা হয়েছে --- */}
            {canEditTask && (
              <button 
                onClick={() => onEditClick(task)}
                className="text-gray-400 hover:text-blue-600 transition"
                title="Edit Task"
              >
                <FaEdit />
              </button>
            )}

            {canDeleteTask && (
              <button 
                onClick={handleDelete}
                className="text-red-300 hover:text-red-600 font-bold text-xl leading-none transition"
                title="Delete Task"
              >
                &times;
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1 mb-3 break-words">{task.description}</p>
      </div>
      
      <div>
        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Assigned:</strong> {task.assignees?.map(a => a.name).join(', ') || 'N/A'}</p>
            <p><strong>By:</strong> {task.creator?.name || 'N/A'}</p>
          </div>
          
          {canUpdateStatus ? (
            <select 
              value={task.status} 
              onChange={(e => handleStatusChange(e.target.value))}
              className="text-xs p-1 border rounded-md bg-gray-50 focus:ring-1 focus:ring-blue-400 outline-none"
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