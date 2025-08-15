"use client";

import CreateTaskForm from './CreateTaskForm';

// Props-এর জন্য টাইপ ডিফাইন করুন
interface CreateTaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string; // projectId এখন একটি প্রয়োজনীয় prop
}

const CreateTaskFormModal = ({ isOpen, onClose, onSuccess, projectId }: CreateTaskFormModalProps) => {
  // যদি মডালটি খোলা না থাকে, তাহলে কিছুই রেন্ডার করবে না
  if (!isOpen) {
    return null;
  }

  return (
    // মডালের ব্যাকড্রপ এবং কন্টেইনার
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        {/* মডালের হেডার */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Create a New Task</h2>
          <button 
            onClick={onClose} 
            className="text-2xl font-bold text-gray-500 hover:text-red-500 transition"
          >
            &times;
          </button>
        </div>
        
        {/* টাস্ক তৈরির ফর্ম, projectId সহ */}
        <CreateTaskForm onSuccess={onSuccess} projectId={projectId} />
      </div>
    </div>
  );
};

export default CreateTaskFormModal;