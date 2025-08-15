"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import CreateProjectModal from '../../components/CreateProjectModal';

interface Project {
  id: string;
  name: string;
  description: string;
  members: { name: string }[];
}

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Redux থেকে ইউজার তথ্য নিন
  const { user } = useSelector((state: RootState) => state.auth);

  const fetchProjects = async () => {
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
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // প্রজেক্ট তৈরির পারমিশন চেক
  const canCreateProject = user?.role === 'admin' || user?.role === 'project_manager';

  if (isLoading) {
    return <div className="text-center p-10">Loading projects...</div>;
  }

  return (
    <div className="p-4 md:p-6 mt-[70px]">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Your Projects</h1>
        {canCreateProject && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
          >
            + New Project
          </button>
        )}
      </div>
      
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Link key={project.id} href={`/projects/${project.id}`} className="block">
              <div className="p-6 h-full bg-white rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                <h2 className="text-xl font-bold mb-2 text-gray-800">{project.name}</h2>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <div className="border-t pt-2">
                  <p className="text-sm text-gray-500">Members: {project.members.length}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">You are not a part of any projects yet.</p>
          {canCreateProject && (
            <p className="mt-2 text-gray-500">Click on "New Project" to get started!</p>
          )}
        </div>
      )}

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          fetchProjects(); // নতুন প্রজেক্টটি দেখানোর জন্য তালিকা রিফ্রেশ করুন
        }} 
      />
    </div>
  );
};

export default ProjectsPage;