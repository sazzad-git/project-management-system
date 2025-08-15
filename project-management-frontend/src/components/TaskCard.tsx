"use client";

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { updateTaskStatus, deleteTaskSuccess } from '../store/features/tasks/tasksSlice'; 
import { Task } from '../store/features/tasks/tasksSlice';
import { FaEdit } from 'react-icons/fa';
import Link from 'next/link';

const columnTitles: { [key: string]: string } = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

// Props-এর টাইপ আপডেট করুন (onCardClick আর প্রয়োজন নেই)
interface TaskCardProps {
  task: Task;
  onEditClick: (task: Task) => void;
}

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
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Link-এর নেভিগেশন প্রতিরোধ করুন
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

  // পারমিশন চেক (অপরিবর্তিত)
  const canUpdateStatus = 
    user?.role === 'admin' ||
    user?.role === 'project_manager' ||
    (user?.role === 'developer' && task.assignees?.some(a => a.id === user.id));
    
  const canDeleteTask = 
    user?.role === 'admin' ||
    (user?.role === 'project_manager' && task.creator?.id === user.id);
    
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
    <div className="p-3 mb-3 rounded-lg shadow-sm bg-white border border-gray-200 flex flex-col justify-between min-h-[220px]">
      <div>
        <div className="flex justify-between items-start gap-2">
          {/* টাস্কের টাইটেলকে এখন একটি লিংক বানানো হয়েছে */}
          <Link href={`/projects/${task.project?.id}/tasks/${task.id}`} className="block">
            <p className="font-semibold text-gray-800 break-words hover:text-blue-600 transition">{task.title}</p>
          </Link>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {canEditTask && (
              <button 
                onClick={(e) => { e.stopPropagation(); onEditClick(task); }}
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
          </div>
          {canUpdateStatus ? (
            <select 
              value={task.status} 
              onChange={(e) => { e.stopPropagation(); handleStatusChange(e.target.value); }}
              className="text-xs p-1 border rounded-md bg-gray-50 focus:ring-1 focus:ring-blue-400 outline-none"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          ) : (<span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
      {columnTitles[task.status]}
    </span>)}
        </div>

        {/* --- নতুন: View Details বাটন এবং কমেন্ট সংখ্যা --- */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
          <Link 
            href={`/projects/${task.project?.id}/tasks/${task.id}`}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Details & Comments
          </Link>
          <span className="text-xs text-gray-500">
            {task.comments?.length || 0} Comments
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;