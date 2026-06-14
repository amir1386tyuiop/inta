import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock } from 'react-icons/fi';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('ورود موفقیت‌آمیز');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>اینتا</h1>
          <p>پلتفرم خدمات حقوقی هوشمند</p>
        </div>
        <h2>ورود به حساب کاربری</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FiMail style={{ marginLeft: 6 }} />ایمیل</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="email@example.com" />
          </div>
          <div className="form-group">
            <label><FiLock style={{ marginLeft: 6 }} />رمز عبور</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="رمز عبور" />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>
        <p className="auth-link">حساب ندارید؟ <Link to="/register">ثبت‌نام کنید</Link></p>
      </div>
      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 50%, var(--primary-light) 100%);
          padding: 20px;
        }
        .auth-card {
          background: #fff;
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: var(--shadow-lg);
        }
        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .auth-header h1 {
          font-size: 32px;
          font-weight: 800;
          color: var(--primary);
        }
        .auth-header p {
          color: var(--text-secondary);
          font-size: 14px;
          margin-top: 4px;
        }
        .auth-card h2 {
          font-size: 18px;
          margin-bottom: 20px;
          color: var(--text);
        }
        .auth-link {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
          color: var(--text-secondary);
        }
        .auth-link a {
          color: var(--primary);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
