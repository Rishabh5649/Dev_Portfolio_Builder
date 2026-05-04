import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { useDispatch } from 'react-redux';
import { addProjects } from '../../store/portfolioSlice';
import api from '../../utils/api';
import Modal from '../ui/Modal';
import { Skeleton } from '../ui/Skeleton';
import { Star, GitFork, Search, Check } from 'lucide-react';

const GitHubIcon = ({ size = 16 }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
  </svg>
);

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#2b7489', Python: '#3572A5',
  Java: '#b07219', 'C++': '#f34b7d', Go: '#00ADD8', Rust: '#dea584',
  HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051', Ruby: '#cc342d',
  PHP: '#777bb4', C: '#555555', 'C#': '#239120', Swift: '#FA7343',
  Kotlin: '#7f52ff', 'Objective-C': '#438eff', R: '#198ce7', MATLAB: '#e16737',
};

export default function GitHubImportModal({ open, onClose, githubUsername }) {
  const [repos, setRepos] = useState([]);
  const [repoMetadata, setRepoMetadata] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingMetadata, setFetchingMetadata] = useState({});
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [importing, setImporting] = useState(false);
  const dispatch = useDispatch();
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setSelected([]);
    setRepoMetadata({});
    api.get('/api/github/repos')
      .then(res => {
        setRepos(res.data || []);
        // Pre-fetch metadata for first few repos
        if (res.data && res.data.length > 0) {
          res.data.slice(0, 5).forEach(repo => fetchRepoMetadata(repo));
        }
      })
      .catch(() => toast.error('Failed to fetch GitHub repos'))
      .finally(() => setLoading(false));
  }, [open]);

  const fetchRepoMetadata = async (repo) => {
    if (repoMetadata[repo.id]) return; // Already fetched

    setFetchingMetadata(prev => ({ ...prev, [repo.id]: true }));

    try {
        const [readmeRes, languagesRes, packageRes] = await Promise.all([
          api.get(`/api/github/repos/${repo.owner}/${repo.name}/readme`).catch(() => ({ data: { description: '', content: '' } })),
          api.get(`/api/github/repos/${repo.owner}/${repo.name}/languages`).catch(() => ({ data: { languages: [] } })),
          api.get(`/api/github/repos/${repo.owner}/${repo.name}/package`).catch(() => ({ data: { dependencies: [] } })),
        ]);

        setRepoMetadata(prev => ({
          ...prev,
          [repo.id]: {
            description: readmeRes.data.description || '',
            readmeContent: readmeRes.data.content || '',
            languages: languagesRes.data.languages || [],
            dependencies: packageRes.data.dependencies || [],
          },
        }));
    } catch (err) {
      console.error('Error fetching metadata:', err);
    } finally {
      setFetchingMetadata(prev => {
        const updated = { ...prev };
        delete updated[repo.id];
        return updated;
      });
    }
  };

  const filtered = repos.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (repo) => {
    setSelected(prev =>
      prev.find(r => r.id === repo.id)
        ? prev.filter(r => r.id !== repo.id)
        : [...prev, repo]
    );
    // Fetch metadata when selected
    if (!repoMetadata[repo.id] && !fetchingMetadata[repo.id]) {
      fetchRepoMetadata(repo);
    }
  };

  const handleImport = async () => {
    if (!selected.length) return;
    setImporting(true);

    try {
      // Ensure all selected repos have metadata fetched
      const metadataPromises = selected
        .filter(r => !repoMetadata[r.id] && !fetchingMetadata[r.id])
        .map(r => new Promise((resolve) => {
          setTimeout(() => fetchRepoMetadata(r).then(resolve), 100);
        }));

      if (metadataPromises.length > 0) {
        await Promise.all(metadataPromises);
      }

      // Wait a moment for state to update
      await new Promise(resolve => setTimeout(resolve, 500));

      const mapDepToFramework = (dep) => {
        const d = dep.toLowerCase();
        if (d.includes('react')) return 'React';
        if (d.includes('next')) return 'Next.js';
        if (d.includes('gatsby')) return 'Gatsby';
        if (d.includes('vue')) return 'Vue.js';
        if (d.includes('@nestjs') || d.includes('nestjs')) return 'NestJS';
        if (d.includes('express')) return 'Express';
        if (d.includes('angular')) return 'Angular';
        if (d.includes('django')) return 'Django';
        if (d.includes('flask')) return 'Flask';
        if (d.includes('spring')) return 'Spring';
        if (d.includes('laravel')) return 'Laravel';
        if (d.includes('ember')) return 'Ember';
        if (d.includes('svelte')) return 'Svelte';
        if (d.includes('rxjs')) return 'RxJS';
        // fallback: return raw package name
        return dep;
      };

      const projects = selected.map(r => {
        const metadata = repoMetadata[r.id] || {};
        // Keep short description from repo description (do not override)
        const shortDescription = r.description || (metadata?.description || '');
        const fullDescription = metadata?.readmeContent || '';

        // languages from GitHub languages API (array)
        const langs = metadata?.languages || (r.language ? [r.language] : []);
        // dependencies mapped to readable names
        const deps = (metadata?.dependencies || []).map(mapDepToFramework);
        // include repo topics if available
        const topics = r.topics || [];

        const techStack = Array.from(new Set([
          ...langs,
          ...deps,
          ...topics,
        ])).filter(Boolean);

        const githubUrl = r.html_url || (`https://github.com/${r.owner}/${r.name}`);
        const liveUrl = r.homepage || r.homepage_url || '';

        return {
          name: r.name,
          description: shortDescription,
          fullDescription: fullDescription,
          techStack,
          githubUrl,
          githubLink: githubUrl,
          liveUrl,
          liveLink: liveUrl,
          image: '',
        };
      });

      dispatch(addProjects(projects));
      toast.success(`${projects.length} project${projects.length > 1 ? 's' : ''} imported!`);
      setImporting(false);
      onClose();
    } catch (err) {
      console.error('Import error:', err);
      toast.error('Failed to import projects');
      setImporting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Import from GitHub" maxWidth="700px">
      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="input-field"
          placeholder="Search repositories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: '42px' }}
        />
      </div>

      {/* Repos grid */}
      <div style={{ maxHeight: '420px', overflowY: 'auto', marginBottom: '20px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[...Array(6)].map((_, i) => <Skeleton key={i} height="100px" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '14px' }}>
            {search ? 'No repos match your search' : 'No public repositories found'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {filtered.map(repo => {
              const isSelected = selected.find(r => r.id === repo.id);
              const metadata = repoMetadata[repo.id];
              const isFetching = fetchingMetadata[repo.id];
              const languages = metadata?.languages || (repo.language ? [repo.language] : []);

              return (
                <motion.div
                  key={repo.id}
                  layout
                  onClick={() => toggleSelect(repo)}
            style={{
                    background: isSelected ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '10px', padding: '14px', cursor: 'pointer',
                    transition: 'all 0.15s ease', position: 'relative',
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute', top: '10px', right: '10px',
                      background: 'var(--accent)', borderRadius: '50%',
                      width: '20px', height: '20px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Check size={12} color="#fff" />
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <GitHubIcon size={14} color="var(--text-muted)" />
                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{repo.name}</span>
                  </div>

                  {/* Description: show README if available, otherwise repo description */}
                  {isFetching ? (
                    <Skeleton height="40px" style={{ marginBottom: '8px' }} />
                  ) : (
                    <p style={{
                      fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.4,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {metadata?.description || repo.description || 'No description available'}
                    </p>
                  )}

                  {/* Languages */}
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px',
                    minHeight: isFetching && languages.length === 0 ? '20px' : 'auto',
                  }}>
                    {languages.slice(0, 3).map(lang => (
                      <span
                        key={lang}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          fontSize: '11px', padding: '4px 8px', borderRadius: '12px',
                          background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)',
                        }}
                      >
                        <span
                          style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: LANG_COLORS[lang] || '#888', flexShrink: 0,
                          }}
                        />
                        {lang}
                      </span>
                    ))}
                    {languages.length > 3 && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        +{languages.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={11} /> {repo.stargazers_count}
                    </span>
                    {repo.forks_count > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <GitFork size={11} /> {repo.forks_count}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          {selected.length} repo{selected.length !== 1 ? 's' : ''} selected
        </span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleImport}
            disabled={!selected.length || importing}
          >
            {importing ? 'Importing...' : `Import ${selected.length > 0 ? selected.length : ''} Project${selected.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
