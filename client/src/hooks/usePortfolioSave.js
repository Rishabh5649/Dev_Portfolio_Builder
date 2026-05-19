import { useCallback, useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { savePortfolioToDB } from '../store/portfolioSlice';
import { useToast } from '../context/ToastContext';

/**
 * usePortfolioSave
 * 
 * - Auto-saves to localStorage 2 seconds after any state change
 * - Provides a `save()` function for explicit DB saves (bound to the Save Portfolio button)
 * - Tracks saving state and last-saved timestamp
 */
export function usePortfolioSave() {
  const dispatch = useDispatch();
  const portfolio = useSelector(s => s.portfolio.data);
  const saving = useSelector(s => s.portfolio.saving);
  const { success: toastSuccess } = useToast();
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const autoSaveTimer = useRef(null);

  // ── Auto-save to localStorage on every state change ───────────────────────
  useEffect(() => {
    if (!portfolio) return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem('portfolioBuilder_v2_data', JSON.stringify(portfolio));
        localStorage.setItem('portfolioBuilder_v2_lastSaved', Date.now().toString());
        setLastSavedAt(Date.now());
      } catch (_) { /* storage quota */ }
    }, 1500);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [portfolio]);

  // ── Explicit save (dispatches thunk that saves to DB + localStorage) ───────
  const save = useCallback(async () => {
    const result = await dispatch(savePortfolioToDB());
    if (savePortfolioToDB.fulfilled.match(result)) {
      const now = Date.now();
      localStorage.setItem('portfolioBuilder_v2_lastSaved', now.toString());
      setLastSavedAt(now);
      toastSuccess('Portfolio saved!');
    }
  }, [dispatch, toastSuccess]);

  return {
    save,
    saving,
    lastSavedAt,
    // Legacy compat — some components read these
    isSaving: saving,
    lastSavedTime: lastSavedAt ? new Date(lastSavedAt) : null,
  };
}
