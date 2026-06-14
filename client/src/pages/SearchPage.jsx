import { useState } from 'react';
import { Link } from 'react-router-dom';
import { search as searchApi } from '../services/api';
import toast from 'react-hot-toast';
import { FiSearch, FiBookOpen, FiUsers, FiBriefcase } from 'react-icons/fi';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await searchApi.global(query);
      setResults(data.results || data);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1><FiSearch style={{ marginLeft: 8 }} />جستجو</h1>
      </div>

      <form className="card" style={{ marginBottom: 24 }} onSubmit={handleSearch}>
        <div style={{ display: 'flex', gap: 12 }}>
          <input style={{ flex: 1, padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 15 }} value={query} onChange={e => setQuery(e.target.value)} placeholder="جستجو در وبلاگ‌ها، وکلا و پرونده‌ها..." />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <FiSearch /> {loading ? 'جستجو...' : 'جستجو'}
          </button>
        </div>
      </form>

      {results && (
        <div className="search-results">
          {/* Blog results */}
          {results.blogs?.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 12 }}><FiBookOpen style={{ marginLeft: 6 }} />وبلاگ ({results.blogs.length})</h3>
              {results.blogs.map(b => (
                <Link to={`/blog/${b.slug}`} key={b.id} className="search-item">
                  <h4>{b.title}</h4>
                  <p>{b.excerpt}</p>
                </Link>
              ))}
            </div>
          )}

          {/* Lawyer results */}
          {results.lawyers?.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 12 }}><FiUsers style={{ marginLeft: 6 }} />وکلا ({results.lawyers.length})</h3>
              {results.lawyers.map(l => (
                <div key={l.id} className="search-item">
                  <h4>{l.user?.fullName}</h4>
                  <p>{l.specializations} - {l.city}</p>
                </div>
              ))}
            </div>
          )}

          {/* Case results */}
          {results.cases?.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: 12 }}><FiBriefcase style={{ marginLeft: 6 }} />پرونده‌ها ({results.cases.length})</h3>
              {results.cases.map(c => (
                <Link to={`/cases/${c.id}`} key={c.id} className="search-item">
                  <h4>{c.title}</h4>
                  <p>{c.caseType} - {c.status}</p>
                </Link>
              ))}
            </div>
          )}

          {!results.blogs?.length && !results.lawyers?.length && !results.cases?.length && (
            <div className="empty-state card">
              <FiSearch size={40} />
              <h3>نتیجه‌ای یافت نشد</h3>
              <p>عبارت دیگری جستجو کنید</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        .search-item { display: block; padding: 12px; border-bottom: 1px solid var(--border); text-decoration: none; color: var(--text); }
        .search-item:last-child { border-bottom: none; }
        .search-item:hover { background: var(--bg); }
        .search-item h4 { font-size: 15px; margin-bottom: 4px; }
        .search-item p { font-size: 13px; color: var(--text-secondary); }
      `}</style>
    </div>
  );
}
