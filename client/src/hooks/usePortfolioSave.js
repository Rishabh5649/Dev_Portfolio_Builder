import { useCallback, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../utils/api';

export function usePortfolioSave() {
  const dispatch = useDispatch();
  const portfolio = useSelector(s => s.portfolio.data);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [error, setError] = useState(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);

  // Auto-save every 2 seconds
  useEffect(() => {
    if (!portfolio) return;
    
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    
    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        // Save to localStorage
        localStorage.setItem('portfolioBuilder_v2_data', JSON.stringify(portfolio));
        localStorage.setItem('portfolioBuilder_v2_lastSaved', Date.now().toString());
        setLastSavedTime(new Date());
        
        // Optionally sync to server if user is authenticated
        if (portfolio._id) {
          await api.put(`/api/portfolio/${portfolio._id}`, portfolio).catch(() => {
            // Fail silently - localStorage is the backup
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsSaving(false);
      }
    }, 2000);

    setAutoSaveTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [portfolio]);

  const uploadImage = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post('/api/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.url;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const uploadResume = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post('/api/upload/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.url;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return { 
    isSaving, 
    lastSavedTime,
    error,
    uploadImage,
    uploadResume
  };
}
