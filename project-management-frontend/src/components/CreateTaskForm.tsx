"use client";

import { useState } from 'react';

// ১. কম্পোনেন্টের props-এর জন্য টাইপ ডিফাইন করুন
interface CreateTaskFormProps {
  onSuccess: () => void; // onSuccess একটি ফাংশন যা কিছু রিটার্ন করে না
}

// ২. কম্পোনেন্টটিকে props গ্রহণ করার জন্য পরিবর্তন করুন
const CreateTaskForm = ({ onSuccess }: CreateTaskFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  // `success` স্টেটটির আর প্রয়োজন নেই, কারণ আমরা মডাল বন্ধ করে দেব
  // const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You are not logged in. Please log in to create a task.');
      return;
    }

    const newTaskData = { title, description };

    try {
      const response = await fetch('http://localhost:3001/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newTaskData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create task');
      }

      // সফলভাবে টাস্ক তৈরি হলে
      setTitle('');
      setDescription('');
      
      // ৩. এখানে onSuccess ফাংশনটিকে কল করুন
      onSuccess();

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    // আপনার সুন্দর ডিজাইনটি অপরিবর্তিত রাখা হয়েছে
    <form 
      onSubmit={handleSubmit} 
      className="bg-white p-6 rounded-lg w-full"
    >
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g., Design the new dashboard"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Add more details about the task..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition resize-none"
          rows={4}
        />
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
      >
        Add Task
      </button>

      {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
    </form>
  );
};

export default CreateTaskForm;