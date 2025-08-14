"use client";

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchTasks } from '../../store/features/tasks/tasksSlice';
import CreateTaskForm from '../../components/CreateTaskForm'; // সঠিক রিলেটিভ পাথ ব্যবহার করুন
import TaskCard from '../../components/TaskCard'; // নতুন TaskCard কম্পোনেন্ট ইম্পোর্ট করুন

const columnTitles: { [key: string]: string } = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

const DashboardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, status: tasksStatus, error } = useSelector((state: RootState) => state.tasks);
  const { user, status: authStatus } = useSelector((state: RootState) => state.auth);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (authStatus === 'succeeded' && tasksStatus === 'idle') {
      dispatch(fetchTasks());
    }
  }, [authStatus, tasksStatus, dispatch]);

  const columns = {
    todo: tasks.filter(task => task.status === 'todo'),
    in_progress: tasks.filter(task => task.status === 'in_progress'),
    done: tasks.filter(task => task.status === 'done'),
  };

  const canCreateTask = user?.role === 'admin' || user?.role === 'project_manager';



  if (authStatus !== 'succeeded') {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-500">Loading User Information...</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-6 mt-[70px]">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Task Board</h1>
        {canCreateTask == true && (
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            + Create New Task
          </button>
        )}
      </div>
      
      {tasksStatus === 'loading' || tasksStatus === 'idle' ? (
        <p className="text-center text-gray-500 py-10">Loading tasks...</p>
      ) : tasksStatus === 'succeeded' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.keys(columns).map(columnId => (
            <div key={columnId} className="p-4 rounded-lg shadow-inner bg-gray-50 min-h-[300px]">
              <h2 className="font-bold mb-4 text-center text-gray-700 tracking-wider uppercase">
                {columnTitles[columnId]} ({columns[columnId].length})
              </h2>
              <div className="space-y-3">
                {columns[columnId].length > 0 ? (
                  columns[columnId].map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))
                ) : (
                  <p className="text-sm text-center text-gray-400 mt-10">No tasks in this column.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-red-500 py-10">{error}</p>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Create a New Task</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-2xl font-bold hover:text-red-500">&times;</button>
            </div>
            <CreateTaskForm onSuccess={() => {
              setIsCreateModalOpen(false);
              dispatch(fetchTasks());
            }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;