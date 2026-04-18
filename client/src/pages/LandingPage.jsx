import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { FileText, Briefcase, Download, Monitor } from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Monitor className="h-8 w-8 text-indigo-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">DevPortfolio</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">Log in</Link>
              <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-5xl tracking-tight font-extrabold text-gray-900 sm:text-6xl md:text-7xl">
          <span className="block">Your professional</span>
          <span className="block text-indigo-600">developer presence</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Build a stunning public portfolio site and generate ATS-friendly DOCX and PDF resumes from the exact same data. Stop repeating yourself.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link to="/register" className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10">
            Build Your Portfolio
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                <Monitor className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Live Web Portfolio</h3>
              <p className="mt-2 text-base text-gray-500">Pick a template and generate a modern, responsive public portfolio link to share.</p>
            </div>
            <div className="text-center p-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Resume Builder</h3>
              <p className="mt-2 text-base text-gray-500">Auto-fill from your portfolio data. Drag-and-drop sections. Make sure everything fits onto one page!</p>
            </div>
            <div className="text-center p-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                <Download className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">PDF & DOCX Exports</h3>
              <p className="mt-2 text-base text-gray-500">Download a perfectly formatted A4 PDF or a native Microsoft Word DOCX file.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
