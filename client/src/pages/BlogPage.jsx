import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blog as blogApi } from '../services/api';
import toast from 'react-hot-toast';
import { FiBookOpen, FiClock, FiTag } from 'react-icons/fi';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogApi.list().then(data => setPosts(data.posts || [])).catch(() => toast.error('خطا')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1><FiBookOpen style={{ marginLeft: 8 }} />وبلاگ</h1>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state card"><FiBookOpen size={48} /><h3>مقاله‌ای منتشر نشده</h3></div>
      ) : (
        <div className="blog-grid">
          {posts.map(post => (
            <Link to={`/blog/${post.slug}`} key={post.id} className="card blog-card">
              <div className="blog-category"><FiTag size={12} /> {post.category}</div>
              <h3>{post.title}</h3>
              <p className="blog-excerpt">{post.excerpt}</p>
              <div className="blog-footer">
                <span>{post.authorName}</span>
                <span><FiClock size={12} /> {new Date(post.publishedAt || post.createdAt).toLocaleDateString('fa-IR')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }
        .blog-card { text-decoration: none; color: var(--text); transition: var(--transition); }
        .blog-card:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); }
        .blog-category { font-size: 12px; color: var(--primary); font-weight: 500; display: flex; align-items: center; gap: 4px; margin-bottom: 8px; }
        .blog-card h3 { font-size: 18px; margin-bottom: 8px; line-height: 1.6; }
        .blog-excerpt { font-size: 14px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .blog-footer { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-light); padding-top: 12px; border-top: 1px solid var(--border); }
        .blog-footer span { display: flex; align-items: center; gap: 4px; }
      `}</style>
    </div>
  );
}
