"use client";

import { useState, useEffect } from 'react';

// Global type
interface User {
  id: string;
  name: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  members: User[];
}

interface EditProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditProjectModal = ({ project, isOpen, onClose, onSuccess }: EditProjectModalProps) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    memberIds: [] as string[] 
  });
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  // If change project prop
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        memberIds: project.members?.map(m => m.id) || [],
      });
    }
  }, [project]);

  // All user fetch here
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:3001/users', { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setAllUsers(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchUsers();
  }, []);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, memberIds: selectedIds });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    
    
    const updatePayload = {
      name: formData.name,
      description: formData.description,
      memberIds: formData.memberIds,
    };
    
    try {
      const response = await fetch(`http://localhost:3001/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(updatePayload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update project");
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Edit Project</h2>
          <button onClick={onClose} className="text-2xl font-bold hover:text-red-500">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium">Project Name</label>
            <input 
              id="name" 
              name="name" 
              type="text" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              className="w-full border p-2 rounded mt-1" 
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium">Description</label>
            <textarea 
              id="description" 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              required 
              className="w-full border p-2 rounded mt-1" 
              rows={3} 
            />
          </div>
          
          <div>
            <label htmlFor="members" className="block text-sm font-medium">Update Members</label>
            <select 
              id="members" 
              name="memberIds" 
              multiple 
              value={formData.memberIds} 
              onChange={handleMemberChange} 
              className="w-full border p-2 rounded h-32 mt-1"
            >
              {allUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl (or Cmd) to select multiple members.</p>
          </div>
          
          <div className="flex justify-end gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;