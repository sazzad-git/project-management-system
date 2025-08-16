"use client";

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { FaArrowRight, FaTasks, FaUsers, FaChartLine } from 'react-icons/fa';

const HomePage = () => {
  // check Is in login user 
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-24 pb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
          Streamline Your Workflow
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          ProjectFlow helps you manage tasks, track progress, and collaborate with your team seamlessly. Achieve your goals faster and more efficiently.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          {isAuthenticated ? (
            // If not login then show this 
            <Link href="/projects" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105 flex items-center gap-2">
              Go to Your Projects <FaArrowRight />
            </Link>
          ) : (
            
            <>
              <Link href="/signup" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105 flex items-center gap-2">
                Get Started for Free <FaArrowRight />
              </Link>
              <Link href="/login" className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-full shadow-lg hover:bg-gray-100 transition-transform transform hover:scale-105">
                Login
              </Link>
            </>
          )}
        </div>
      </main>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose ProjectFlow?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="p-8 text-center border rounded-lg shadow-sm hover:shadow-xl transition-shadow">
              <FaTasks className="text-4xl text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Intuitive Task Management</h3>
              <p className="text-gray-600">
                Organize tasks in a clean, visual interface. Set priorities, deadlines, and assign team members with ease.
              </p>
            </div>
            {/* Feature Card 2 */}
            <div className="p-8 text-center border rounded-lg shadow-sm hover:shadow-xl transition-shadow">
              <FaUsers className="text-4xl text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Seamless Collaboration</h3>
              <p className="text-gray-600">
                Comment on tasks, share files, and get real-time updates to keep everyone in sync.
              </p>
            </div>
            {/* Feature Card 3 */}
            <div className="p-8 text-center border rounded-lg shadow-sm hover:shadow-xl transition-shadow">
              <FaChartLine className="text-4xl text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
              <p className="text-gray-600">
                Visualize your project timeline with Gantt charts and monitor your team's progress with insightful reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Boost Your Productivity?</h2>
          <p className="text-lg text-gray-600 mb-8">Join thousands of teams achieving their goals with ProjectFlow.</p>
          <Link href="/signup" className="px-10 py-4 bg-blue-600 text-white font-bold rounded-full shadow-xl hover:bg-blue-700 transition-transform transform hover:scale-105">
            Sign Up Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} ProjectFlow. All Rights Reserved.</p>
          <div className="mt-2 flex justify-center gap-4">
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;