"use client";

import { useState, useEffect } from 'react';
import CreateProjectForm from './CreateProjectForm'; 

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateProjectModal = ({ isOpen, onClose, onSuccess }: CreateProjectModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Create a New Project</h2>
          <button onClick={onClose} className="text-2xl font-bold text-gray-500 hover:text-red-500">&times;</button>
        </div>
        <CreateProjectForm onSuccess={onSuccess} />
      </div>
    </div>
  );
};

export default CreateProjectModal;