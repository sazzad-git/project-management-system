"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useRouter } from 'next/navigation';
import EditProjectModal from '../../components/EditProjectModal'; // EditProjectModal ইম্পোর্ট করুন
import CreateProjectModal from '../../components/CreateProjectModal';

interface UserSnippet {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  creator: UserSnippet;
  members: UserSnippet[];
}

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const fetchProjects = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3001/projects', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleOpenEditModal = (project: Project) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProject(null);
  };
  
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project and all its tasks? This action cannot be undone.')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:3001/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchProjects(); // ডিলিট করার পর প্রজেক্ট লিস্ট রিফ্রেশ করুন
    } catch (err) {
      console.error("Failed to delete project", err);
    }
  };

  const canCreateProject = user?.role === 'admin' || user?.role === 'project_manager';

  if (isLoading) {
    return <div className="text-center p-10">Loading projects...</div>;
  }

  return (
    <div className="p-4 md:p-6 mt-[70px]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Your Projects</h1>
        {canCreateProject && (
          <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 text-white p-2 rounded">
            + New Project
          </button>
        )}
      </div>
      
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => {
            // পারমিশন চেক: শুধুমাত্র Admin বা প্রজেক্টের স্রষ্টাই এডিট/ডিলিট করতে পারবে
            const canManageProject = user?.role === 'admin' || user?.id === project.creator?.id;

            return (
              <div key={project.id} className="p-6 h-full bg-white rounded-lg shadow-md flex flex-col justify-between">
                <div>
                  <Link href={`/projects/${project.id}`} className="block">
                    <h2 className="text-xl font-bold mb-2 text-gray-800 hover:text-blue-600 transition">{project.name}</h2>
                  </Link>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500">Members: {project.members.length}</p>
                  <div className="mt-4 flex justify-end gap-2">
                    {canManageProject && (
                      <>
                        <button onClick={() => handleOpenEditModal(project)} className="text-sm bg-yellow-400 text-white py-1 px-3 rounded hover:bg-yellow-500">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteProject(project.id)} className="text-sm bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600">
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No projects found. {canCreateProject && 'Click "New Project" to start.'}</p>
        </div>
      )}

      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchProjects();
        }} 
      />
      
      {selectedProject && (
        <EditProjectModal
          isOpen={isEditModalOpen}
          project={selectedProject}
          onClose={handleCloseEditModal}
          onSuccess={() => {
            handleCloseEditModal();
            fetchProjects();
          }}
        />
      )}
    </div>
  );
};

export default ProjectsPage;