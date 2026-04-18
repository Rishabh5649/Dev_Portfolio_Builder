import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { fetchPortfolio } from '../store/portfolioSlice';
import { fetchResume } from '../store/resumeSlice';
import { Monitor, FileText, Globe, LogOut, ArrowRight, CheckCircle2 } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const dispatch = useDispatch();
  const { data: portfolio, loading: portfolioLoading } = useSelector(state => state.portfolio);
  const { data: resume, loading: resumeLoading } = useSelector(state => state.resume);

  useEffect(() => {
    dispatch(fetchPortfolio());
    dispatch(fetchResume());
  }, [dispatch]);

  const loading = portfolioLoading || resumeLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Monitor className="h-8 w-8 text-indigo-600 mr-2" />
              <span className="font-bold text-xl text-gray-900">DevPortfolio</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Hey, {user?.name}</span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your online presence and resume documents.</p>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-gray-200 rounded-xl"></div>
            <div className="h-40 bg-gray-200 rounded-xl"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Portfolio Card */}
            <div className="bg-white overflow-hidden shadow rounded-xl border border-gray-100 flex flex-col">
              <div className="p-6 flex-grow">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-indigo-50 text-indigo-700 rounded-lg">
                    <Globe className="h-6 w-6" />
                  </div>
                  <h2 className="ml-3 text-xl font-semibold text-gray-900">Web Portfolio</h2>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Build and publish your public developer portfolio. Add your projects, skills, education, and social links.
                </p>
                <div className="space-y-3">
                  {portfolio ? (
                    <>
                      <div className="flex items-center text-sm text-green-700 bg-green-50 p-2 rounded">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Portfolio created
                      </div>
                      {portfolio.isPublished && portfolio.slug && (
                        <div className="text-sm">
                          <span className="text-gray-500">Public Link: </span>
                          <Link to={`/p/${portfolio.slug}`} target="_blank" className="text-indigo-600 font-medium hover:underline">
                            /p/{portfolio.slug}
                          </Link>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-gray-500 italic">Not created yet</div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <Link
                  to="/portfolio-builder"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {portfolio ? 'Edit Portfolio' : 'Create Portfolio'}
                  <ArrowRight className="ml-2 -mr-1 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Resume Builder Card */}
            <div className="bg-white overflow-hidden shadow rounded-xl border border-gray-100 flex flex-col relative">
              <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-12 z-10">
                NEW!
              </div>
              <div className="p-6 flex-grow">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-purple-50 text-purple-700 rounded-lg">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h2 className="ml-3 text-xl font-semibold text-gray-900">Resume Builder</h2>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Auto-fill from your portfolio data and generate ATS-friendly, single-page print-ready resumes. Export as PDF or DOCX.
                </p>
                <div className="space-y-3">
                  {resume ? (
                    <div className="flex items-center text-sm text-green-700 bg-green-50 p-2 rounded">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Resume active (using {resume.template} template)
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <Link
                  to="/resume-builder"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  Open Resume Builder
                  <ArrowRight className="ml-2 -mr-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
