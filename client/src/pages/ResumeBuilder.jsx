import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResume } from '../store/resumeSlice';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ResumeForm from '../components/resume/ResumeForm';
import ResumePreview from '../components/resume/ResumePreview';

const ResumeBuilder = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.resume);

  useEffect(() => {
    dispatch(fetchResume());
  }, [dispatch]);

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col">
        <div className="text-red-500 mb-4">{error}</div>
        <Link to="/dashboard" className="text-indigo-600 hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Top Nav Area (Mobile only for now, desktop uses flex column in left panel) */}
      
      {/* Left Panel: Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col h-full bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center bg-white z-10">
          <Link to="/dashboard" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Resume Builder</h1>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
          {data ? <ResumeForm /> : null}
        </div>
      </div>

      {/* Right Panel: Live Preview */}
      <div className="hidden lg:flex flex-1 flex-col h-full bg-gray-200 relative">
        <div className="flex-1 overflow-auto p-8 flex justify-center custom-scrollbar">
          {data ? <ResumePreview /> : null}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
