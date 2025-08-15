"use client";

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import { RootState, AppDispatch } from '../../../store/store';
import { fetchTasksByProjectId, updateTaskStatus } from '../../../store/features/tasks/tasksSlice';
import { Task } from '../../../store/features/tasks/tasksSlice';
import TaskCard from '../../../components/TaskCard';
import EditTaskModal from '../../../components/EditTaskModal';
import CreateTaskFormModal from '../../../components/CreateTaskFormModal';
import { useSocket } from '../../../hooks/useSocket'; // নতুন হুক ইম্পোর্ট

const columnTitles: { [key: string]: string } = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

const ProjectDashboardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { tasks, status: tasksStatus, error } = useSelector((state: RootState) => state.tasks);
  const { user, status: authStatus } = useSelector((state: RootState) => state.auth);
  const [project, setProject] = useState<any>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // --- নতুন: WebSocket কানেকশন ---
  const socket = useSocket(projectId);

  useEffect(() => {
    if (authStatus === 'succeeded' && projectId) {
      // টাস্ক ফেচ
      dispatch(fetchTasksByProjectId(projectId));

      // প্রজেক্ট ডিটেইলস ফেচ
      const fetchProjectDetails = async () => {
        const token = localStorage.getItem('token');
        try {
          const response = await fetch(`http://localhost:3001/projects/${projectId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (response.ok) {
            setProject(data);
          } else {
            throw new Error(data.message);
          }
        } catch (err) {
          console.error("Failed to fetch project details", err);
          router.push('/projects');
        }
      };
      fetchProjectDetails();
    }
  }, [authStatus, projectId, dispatch, router]);

  // --- নতুন: WebSocket ইভেন্ট লিসেন ---
  useEffect(() => {
    if (socket) {
      socket.on('taskUpdated', (updatedTask: Task) => {
        console.log('Received task update from server:', updatedTask);
        dispatch(updateTaskStatus(updatedTask));
      });

      return () => {
        socket.off('taskUpdated');
      };
    }
  }, [socket, dispatch]);

  const handleOpenEditModal = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  const columns = {
    todo: tasks.filter(task => task.status === 'todo'),
    in_progress: tasks.filter(task => task.status === 'in_progress'),
    done: tasks.filter(task => task.status === 'done'),
  };

  const canCreateTask = user?.role === 'admin' || user?.role === 'project_manager';

  if (authStatus !== 'succeeded' || !project) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg">Loading Project...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 mt-[70px]">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">{project.name} - Task Board</h1>
        {canCreateTask && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
          >
            + New Task
          </button>
        )}
      </div>

      {tasksStatus === 'loading' || tasksStatus === 'idle' ? (
        <p className="text-center text-gray-500 py-10">Loading tasks...</p>
      ) : tasksStatus === 'succeeded' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.keys(columns).map(columnId => (
            <div key={columnId} className="p-4 bg-gray-50 rounded-lg shadow-inner min-h-[300px]">
              <h2 className="font-bold mb-4 text-center text-gray-700 uppercase">
                {columnTitles[columnId]} ({columns[columnId].length})
              </h2>
              <div className="space-y-3">
                {columns[columnId].length > 0 ? (
                  columns[columnId].map(task => (
                    <TaskCard key={task.id} task={task} onEditClick={handleOpenEditModal} />
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

      {/* Create Task Modal */}
      <CreateTaskFormModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          dispatch(fetchTasksByProjectId(projectId));
        }}
        projectId={projectId}
      />

      {/* Edit Task Modal */}
      {selectedTask && (
        <EditTaskModal 
          isOpen={isEditModalOpen}
          task={selectedTask}
          onClose={handleCloseEditModal}
          onSuccess={(updatedTask) => {
            dispatch(updateTaskStatus(updatedTask));
            handleCloseEditModal();
          }}
        />
      )}
    </div>
  );
};

export default ProjectDashboardPage;
