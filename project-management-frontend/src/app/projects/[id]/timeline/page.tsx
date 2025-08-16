"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic'; 


// GanttChart here
const GanttChart = dynamic(() => import('../../../../components/GanttChart'), {
  ssr: false, 
  loading: () => <p className="text-center text-gray-500 py-10">Loading Chart...</p> 
});

const TimelinePage = () => {
  const params = useParams();
  const router = useRouter();
  
  
  const projectId = typeof params.id === 'string' ? params.id : null;

  const [ganttData, setGanttData] = useState<{ data: any[], links: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    
    if (projectId) {
      const fetchGanttData = async () => {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        
        try {
          const response = await fetch(`http://localhost:3001/projects/${projectId}/gantt`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch timeline data.');
          }
          setGanttData(data);
        } catch (err: any) {
          console.error("Failed to fetch Gantt data", err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchGanttData();
    } else {
      
      setIsLoading(false);
    }
  }, [projectId]);

  
  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center text-gray-500 py-10">Loading timeline data...</p>;
    }
    if (error) {
      return <p className="text-center text-red-500 py-10">Error: {error}</p>;
    }
    if (ganttData && ganttData.data.length > 0) {
      return <GanttChart tasks={ganttData} />;
    }
    if (ganttData && ganttData.data.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-600">No tasks with a valid start date and duration were found in this project.</p>
          <p className="text-gray-500 mt-2">Please add or update tasks to build a timeline.</p>
        </div>
      );
    }
    return <p className="text-center text-gray-500 py-10">Could not load timeline data.</p>;
  };

  return (
    <div className="p-4 md:p-6 mt-[70px]">
      <div className="mb-6">
        <button 
          onClick={() => router.back()} 
          className="text-blue-600 hover:underline flex items-center"
        >
          <span className="mr-1">&larr;</span> Back to Project Board
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">Project Timeline</h1>
        <div className="w-full h-full">
          {isLoading ? (
        <p>Loading timeline...</p>
      ) : ganttData ? (
        <GanttChart tasks={ganttData} />
      ) : (
        <p>Could not load timeline data.</p>
      )}
        </div>
      </div>
    </div>
  );
};

export default TimelinePage;