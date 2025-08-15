"use client";

import { useState, useEffect } from 'react';

// User টাইপটি এখানে সরাসরি ডিফাইন করা হলো, 
// কারণ এটি authSlice থেকে আনার চেয়ে এখানে রাখা সহজতর হতে পারে।
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]); // সকল ইউজারের তালিকা রাখার জন্য
  const [error, setError] = useState<string | null>(null);

  // কম্পোনেন্ট লোড হওয়ার সময় সকল ইউজারকে fetch করুন
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      
      try {
        // এই এন্ডপয়েন্টটি আপনার ব্যাকএন্ডে তৈরি করতে হবে
        const response = await fetch('http://localhost:3001/users', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        
        const data = await response.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []); // খালি dependency array মানে এটি শুধু একবার চলবে

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const token = localStorage.getItem('token');
     // API-তে পাঠানোর জন্য ডেটা প্রস্তুত করুন, projectId সহ
    const newTaskData = { title, description, assigneeIds, projectId };
    

    try {
      const response = await fetch('http://localhost:3001/tasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newTaskData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create task');
      }
      onSuccess(); // সফল হলে প্যারেন্ট কম্পোনেন্টকে জানান
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  // মাল্টি-সিলেক্ট ইনপুটের মান পরিবর্তনের জন্য হ্যান্ডলার
  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
    setAssigneeIds(selectedIds);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full space-y-4">
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g., Implement the new login page"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Add details about what needs to be done..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400"
          rows={4}
        />
      </div>

      {/* Assignees */}
      <div>
        <label htmlFor="assignees" className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
        <select
          id="assignees"
          multiple={true}
          value={assigneeIds}
          onChange={handleAssigneeChange}
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