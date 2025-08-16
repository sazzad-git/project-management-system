"use client";

import { useState, useEffect } from 'react';

// টাইপ ডেফিনিশন
interface User {
  id: string;
  name: string;
  email: string;
}

interface CreateTaskFormProps {
  onSuccess: () => void;
  projectId: string;
}

const CreateTaskForm = ({ onSuccess, projectId }: CreateTaskFormProps) => {
  // ফর্মের ডেটার জন্য একটি একক স্টেট অবজেক্ট ব্যবহার করা সহজতর
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeIds: [] as string[],
    startDate: '',
    duration: 1,
    priority: 'medium',
    dueDate: '',
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  // সকল ইউজার fetch করুন
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:3001/users', { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, assigneeIds: selectedIds });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    
    // duration-কে সংখ্যায় রূপান্তর করুন এবং projectId যোগ করুন
    const submissionData = {
      ...formData,
      duration: Number(formData.duration),
      projectId,
    };
    
    // যদি কোনো ঐচ্ছিক ফিল্ড খালি থাকে, তাহলে সেটিকে payload থেকে বাদ দিন
    if (!submissionData.dueDate) delete (submissionData as any).dueDate;

    try {
      const response = await fetch('http://localhost:3001/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(submissionData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create task');
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input name="title" id="title" type="text" value={formData.title} onChange={handleChange} required className="mt-1 w-full border p-2 rounded-md" />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea name="description" id="description" value={formData.description} onChange={handleChange} required className="mt-1 w-full border p-2 rounded-md" rows={3} />
      </div>

      {/* Assignees */}
      <div>
        <label htmlFor="assignees" className="block text-sm font-medium text-gray-700">Assign To</label>
        <select id="assignees" name="assigneeIds" multiple value={formData.assigneeIds} onChange={handleAssigneeChange} className="mt-1 w-full border p-2 rounded-md h-24">
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">Hold Ctrl (or Cmd) to select multiple users.</p>
      </div>

      {/* Start Date & Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
          <input name="startDate" id="startDate" type="date" value={formData.startDate} onChange={handleChange} required className="mt-1 w-full border p-2 rounded-md" />
        </div>
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (Days)</label>
          <input name="duration" id="duration" type="number" value={formData.duration} onChange={handleChange} required min="1" className="mt-1 w-full border p-2 rounded-md" />
        </div>
      </div>

      {/* Priority & Due Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
          <select name="priority" id="priority" value={formData.priority} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date (Optional)</label>
          <input name="dueDate" id="dueDate" type="date" value={formData.dueDate} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
      >
        Create Task
      </button>
    </form>
  );
};

export default CreateTaskForm;