"use client";

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface CreateProjectFormProps {
  onSuccess: () => void;
}

const CreateProjectForm = ({ onSuccess }: CreateProjectFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:3001/users', { headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3001/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, description, memberIds }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create project');
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
    setMemberIds(selectedIds);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div>
        <label htmlFor="name" className="block text-sm font-medium">Project Name</label>
        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border p-2 rounded" />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium">Description</label>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full border p-2 rounded" rows={3} />
      </div>
      <div>
        <label htmlFor="members" className="block text-sm font-medium">Add Members</label>
        <select id="members" multiple value={memberIds} onChange={handleMemberChange} className="w-full border p-2 rounded h-32">
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">Hold Ctrl (or Cmd) to select multiple members.</p>
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Create Project</button>
    </form>
  );
};

export default CreateProjectForm;