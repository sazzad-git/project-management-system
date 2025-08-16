"use client";

import CreateTaskForm from './CreateTaskForm';

// Props-Type define
interface CreateTaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string; 
}

const CreateTaskFormModal = ({ isOpen, onClose, onSuccess, projectId }: CreateTaskFormModalProps) => {
  
  if (!isOpen) {
    return null;
  }

  return (
   
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        {/* Modal header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Create a New Task</h2>
          <button 
            onClick={onClose} 
            className="text-2xl font-bold text-gray-500 hover:text-red-500 transition"
          >
            &times;
          </button>
        </div>
        
        {/* Task form with, projectId */}
        <CreateTaskForm onSuccess={onSuccess} projectId={projectId} />
      </div>
    </div>
  );
};

export default CreateTaskFormModal;