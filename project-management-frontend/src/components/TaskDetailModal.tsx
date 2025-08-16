"use client";

import { useState } from 'react';
import { Task } from '../store/features/tasks/tasksSlice';
import { Comment } from '../types'; 

interface TaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded: (taskId: string, newComment: Comment) => void;
}

const TaskDetailModal = ({ task, isOpen, onClose, onCommentAdded }: TaskDetailModalProps) => {
  const [newComment, setNewComment] = useState('');

  if (!isOpen) return null;
  
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:3001/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: newComment }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      onCommentAdded(task.id, data); 
      setNewComment(''); 
    } catch (err) {
      console.error("Failed to post comment", err);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">{task.title}</h2>
        <p className="mb-4">{task.description}</p>
        
        {/* Comment section */}
        <div className="mt-6">
          <h3 className="font-bold mb-2">Comments</h3>
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {task.comments?.map(comment => (
              <div key={comment.id} className="bg-gray-100 p-3 rounded">
                <p><strong>{comment.user.name}</strong> <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span></p>
                <p>{comment.text}</p>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleCommentSubmit} className="mt-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full border p-2 rounded"
              rows={3}
            />
            <button type="submit" className="mt-2 bg-blue-500 text-white p-2 rounded">Post Comment</button>
          </form>
        </div>
        
        <button onClick={onClose} className="mt-4 bg-gray-300 p-2 rounded">Close</button>
      </div>
    </div>
  );
};

export default TaskDetailModal;