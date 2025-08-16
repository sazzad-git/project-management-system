"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// একটি গ্লোবাল types ফাইল (যেমন src/types.ts) তৈরি করে সেখানে এই টাইপগুলো রাখা ভালো
// আপাতত, আমরা এগুলো এখানেই ডিফাইন করছি
interface Project {
  id: string;
  name: string;
  description: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  project: Project | null; // project এখন null হতে পারে
}

interface SearchResult {
  projects: Project[];
  tasks: Task[];
}

const SearchResultsContent = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // যদি কোনো সার্চ কোয়েরি না থাকে, তাহলে কিছু করার দরকার নেই
    if (!query) {
      setIsLoading(false);
      setResults(null);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:3001/search?q=${encodeURIComponent(query)}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Search failed');
        setResults(data);
      } catch (err: any) {
        console.error("Failed to fetch search results", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResults();
  }, [query]);

  if (isLoading) {
    return <p className="text-center text-gray-500">Searching for "{query}"...</p>;
  }
  
  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  if (!query) {
    return <p className="text-center text-gray-500">Please enter a search term in the header.</p>;
  }

  if (!results || (results.projects.length === 0 && results.tasks.length === 0)) {
    return <p className="text-center text-gray-500">No results found for "{query}".</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Search Results for "{query}"</h1>
      
      {/* প্রজেক্টের ফলাফল */}
      {results.projects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Projects ({results.projects.length})</h2>
          <div className="space-y-4">
            {results.projects.map(project => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-lg hover:border-blue-400 border transition-all duration-200">
                  <h3 className="font-bold text-blue-700">{project.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* টাস্কের ফলাফল */}
      {results.tasks.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Tasks ({results.tasks.length})</h2>
          <div className="space-y-4">
            {results.tasks.map(task => (
              // --- সমাধানটি এখানে: task.project আছে কিনা তা চেক করুন ---
              task.project ? (
                <Link key={task.id} href={`/projects/${task.project.id}/tasks/${task.id}`}>
                  <div className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-lg hover:border-blue-400 border transition-all duration-200">
                    <h3 className="font-bold">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      In Project: <span className="font-semibold text-gray-700">{task.project.name}</span>
                    </p>
                  </div>
                </Link>
              ) : (
                // যদি task.project না থাকে, তাহলে একটি নন-লিংক div দেখান
                <div key={task.id} className="p-4 bg-gray-100 rounded-lg shadow-sm opacity-80">
                  <h3 className="font-bold">{task.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  <p className="text-xs text-red-500 mt-2 font-semibold">
                    (Task is not associated with any project)
                  </p>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Suspense ব্যবহার করা সেরা অনুশীলন
const SearchPage = () => {
  return (
    <div className="p-4 md:p-6 mt-[70px]">
      <Suspense fallback={<div className="text-center p-10">Loading search results...</div>}>
        <SearchResultsContent />
      </Suspense>
    </div>
  );
};

export default SearchPage;