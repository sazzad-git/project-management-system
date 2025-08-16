"use client";

import { useState, useEffect } from 'react';
import { Task } from '../store/features/tasks/tasksSlice';

// User Type
interface User {
  id: string;
  name: string;
  email: string;
}

interface EditTaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedTask: Task) => void;
}

const EditTaskModal = ({ task, isOpen, onClose, onSuccess }: EditTaskModalProps) => {
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeIds: [] as string[],
  });
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        assigneeIds: task.assignees?.map(a => a.id) || [],
      });
    }
  }, [task]);

  
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:3001/users', { headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (err: any) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  if (!isOpen) return null;

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    
    if (e.target.name === 'assigneeIds') {
      const selectedIds = Array.from((e.target as HTMLSelectElement).selectedOptions, option => option.value);
      setFormData({ ...formData, assigneeIds: selectedIds });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3001/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const updatedTask = await response.json();
      if (!response.ok) throw new Error(updatedTask.message || 'Failed to update task');
      onSuccess(updatedTask); 
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Edit Task</h2>
          <button onClick={onClose} className="text-2xl font-bold hover:text-red-500">&times;</button>
        </div>

        {/* --- CreateTaskForm- with new form --- */}
        <form onSubmit={handleSubmit} className="bg-white w-full space-y-4">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400"
              rows={4}
            />
          </div>

          {/* Assignees */}
          <div>
            <label htmlFor="assigneeIds" className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
            <select
              id="assigneeIds"
              name="assigneeIds"
              multiple={true}
              value={formData.assigneeIds}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg bg-gray-50 h-32 focus:ring-2 focus:ring-blue-400"
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl (or Cmd on Mac) to select multiple team members.</p>
          </div>
          
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;