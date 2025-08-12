"use client";

import { useState } from 'react';

const CreateTaskForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // ১. লোকাল স্টোরেজ থেকে টোকেনটি নিন
    const token = localStorage.getItem('token');

    if (!token) {
      setError('You are not logged in. Please log in to create a task.');
      return;
    }

    const newTaskData = { title, description };

    try {
      // ২. এখানে আপনার API কল করার কোডটি থাকবে
      const response = await fetch('http://localhost:3001/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // টোকেনটি এখানে যোগ করা হচ্ছে
        },
        body: JSON.stringify(newTaskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create task');
      }

      // সফলভাবে টাস্ক তৈরি হলে
      setSuccess('Task created successfully!');
      setTitle('');
      setDescription('');
      // এখানে আপনি চাইলে ড্যাশবোর্ডের টাস্ক লিস্ট রিফ্রেশ করার জন্য Redux action dispatch করতে পারেন

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd' }}>
      <h3>Create a New Task</h3>
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
      </div>
      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
      </div>
      <button type="submit">Create Task</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </form>
  );
};

export default CreateTaskForm;