"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import GanttChart from '../../../../components/GanttChart';

const TimelinePage = () => {
  const params = useParams();
  const projectId = params.projectId as string;

  const [ganttData, setGanttData] = useState<{ data: any[], links: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // এরর মেসেজ রাখার জন্য নতুন স্টেট

  // --- useEffect হুকটি এখানে আপডেট করা হয়েছে ---
  useEffect(() => {
    if (projectId) {
      const fetchGanttData = async () => {
        setIsLoading(true); // API কল শুরু হওয়ার সাথে সাথেই লোডিং শুরু
        setError(null);     // পুরনো এরর মেসেজ মুছে ফেলুন
        const token = localStorage.getItem('token');
        
        try {
          const response = await fetch(`http://localhost:3001/projects/${projectId}/gantt`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          const data = await response.json();

          if (!response.ok) {
            // যদি সার্ভার কোনো এরর মেসেজ পাঠায়, সেটি ব্যবহার করুন
            throw new Error(data.message || 'Failed to fetch timeline data.');
          }

          setGanttData(data);
        } catch (err: any) {
          console.error("Failed to fetch Gantt data", err);
          // এররটি UI-তে দেখানোর জন্য স্টেট-এ সেট করুন
          setError(err.message);
        } finally {
          setIsLoading(false); // API কল সফল হোক বা ব্যর্থ, লোডিং শেষ
        }
      };
      fetchGanttData();
    }
  }, [projectId]); // projectId পরিবর্তন হলে আবার fetch করুন

  // রেন্ডারিং লজিক
  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center text-gray-500">Loading timeline...</p>;
    }
    if (error) {
      return <p className="text-center text-red-500">Error: {error}</p>;
    }
    if (ganttData && ganttData.data.length > 0) {
      return <GanttChart tasks={ganttData} />;
    }
    if (ganttData && ganttData.data.length === 0) {
      return <p className="text-center text-gray-500">No tasks with dates found in this project to build a timeline.</p>;
    }
    return <p className="text-center text-gray-500">Could not load timeline data.</p>;
  };

  return (
    <div className="p-4 md:p-6 mt-[70px]">
      <div className="mb-4">
        <Link href={`/projects/${projectId}`} className="text-blue-600 hover:underline">
          &larr; Back to Task Board
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-4">Project Timeline (Gantt Chart)</h1>
      
      {isLoading ? (
        <p>Loading timeline...</p>
      ) : ganttData ? (
        <GanttChart tasks={ganttData} />
      ) : (
        <p>Could not load timeline data.</p>
      )}
    </div>
  );
};

export default TimelinePage;