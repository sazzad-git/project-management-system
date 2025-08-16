"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../../../store/store';
import { Task, Comment } from '../../../../../store/features/tasks/tasksSlice';
import { addCommentToTask, deleteTaskSuccess, updateTaskStatus } from '../../../../../store/features/tasks/tasksSlice';
import { FaUserCircle } from 'react-icons/fa';
import EditTaskModal from '../../../../../components/EditTaskModal';

const TaskDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const taskId = params.taskId as string;
  const projectId = params.projectId as string;

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);

  
  const fetchTaskDetails = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:3001/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setTask(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId, fetchTaskDetails]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3001/tasks/${task!.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: newCommentText }),
      });
      const newComment = await response.json();
      if (!response.ok) throw new Error(newComment.message);
      
      setTask(prevTask => ({
        ...prevTask!,
        comments: [...(prevTask?.comments || []), newComment],
      }));
      dispatch(addCommentToTask({ taskId: task!.id, comment: newComment }));
      setNewCommentText('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!canManageTask || !confirm('Are you sure you want to delete this task?')) {
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3001/tasks/${task!.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        dispatch(deleteTaskSuccess(task!.id));
        router.push(`/projects/${projectId}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete task');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  if (isLoading) return <div className="p-10 text-center mt-[70px]">Loading task details...</div>;
  if (error) return <div className="p-10 text-center text-red-500 mt-[70px]">Error: {error}</div>;
  if (!task) return <div className="p-10 text-center mt-[70px]">Task not found.</div>;

  // For delete edit button
  const canManageTask = user?.role === 'admin' || user?.id === task.creator?.id;

  return (
    <>
      <div className="p-4 md:p-8 mt-[70px] max-w-4xl mx-auto">
        <div className="mb-4">
          <button onClick={() => router.back()} className="text-blue-600 hover:underline flex items-center">
            <span className="mr-1">&larr;</span> Back to Project Board
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-gray-800">{task.title}</h1>
            {canManageTask && (
              <div className="flex gap-2">
                <button onClick={() => setIsEditModalOpen(true)} className="text-sm bg-yellow-400 text-white py-1 px-3 rounded hover:bg-yellow-500">Edit</button>
                <button onClick={handleDelete} className="text-sm bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600">Delete</button>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500 mt-2">
            <span>Created by {task.creator?.name} on {formatDate(task.createdAt)}</span>
          </div>
          
          <p className="my-6 text-gray-700 whitespace-pre-wrap">{task.description}</p>
          
          {/* Comment Section */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Comments ({task.comments?.length || 0})</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {task.comments && task.comments.length > 0 ? (
                task.comments.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <FaUserCircle size={32} className="text-gray-400 mt-1" />
                    <div className="bg-gray-100 p-3 rounded-lg w-full">
                      <p className="font-semibold text-sm">{comment.user.name} <span className="text-xs text-gray-500 font-normal">{formatDate(comment.createdAt)}</span></p>
                      <p className="text-gray-800 whitespace-pre-wrap">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-center text-gray-400">No comments yet. Be the first to comment!</p>
              )}
            </div>
            <form onSubmit={handleCommentSubmit} className="mt-6">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Add your comment..."
                className="w-full border p-2 rounded-md"
                rows={3}
              />
              <button type="submit" className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">Post Comment</button>
            </form>
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      {task && (
        <EditTaskModal 
          isOpen={isEditModalOpen}
          task={task}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={(updatedTask) => {
           
            setTask(updatedTask);
            dispatch(updateTaskStatus(updatedTask));
            setIsEditModalOpen(false);
          }}
        />
      )}
    </>
  );
};

export default TaskDetailPage;