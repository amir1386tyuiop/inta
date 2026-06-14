import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blog as blogApi } from '../services/api';
import toast from 'react-hot-toast';
import { FiArrowRight, FiClock, FiUser, FiTag } from 'react-icons/fi';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogApi.get(slug).then(setPost).catch(() => toast.error('مقاله یافت نشد')).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!post) return <div className="empty-state"><h3>مقاله یافت نشد</h3></div>;

  return (
    <div>
      <Link to="/blog" className="btn btn-outline btn-sm" style={{ marginBottom: 20 }}>
        <FiArrowRight /> بازگشت به وبلاگ
      </Link>

      <article className="card blog-article">
        <div className="article-meta">
          <span className="badge badge-primary"><FiTag size={12} /> {post.category}</span>
          <span><FiUser size={14} /> {post.authorName}</span>
          <span><FiClock size={14} /> {new Date(post.publishedAt || post.createdAt).toLocaleDateString('fa-IR')}</span>
        </div>
        <h1 style={{ fontSize: 28, lineHeight: 1.6, marginBottom: 24 }}>{post.title}</h1>
        {post.tags && (
          <div style={{ marginBottom: 20, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {post.tags.split(',').map((tag, i) => (
              <span key={i} className="badge badge-primary" style={{ fontSize: 11 }}>{tag.trim()}</span>
            ))}
          </div>
        )}
        <div className="article-content">
          {post.content.split('\n').map((para, i) => (
            <p key={i} style={{ marginBottom: 16 }}>{para}</p>
          ))}
        </div>
      </article>

      <style>{`
        .blog-article { max-width: 800px; }
        .article-meta { display: flex; gap: 16px; align-items: center; margin-bottom: 16px; font-size: 13px; color: var(--text-secondary); }
        .article-meta span { display: flex; align-items: center; gap: 4px; }
        .article-content { font-size: 15px; line-height: 2.2; color: var(--text); }
      `}</style>
    </div>
  );
}
