import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '', role: 'client' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('ثبت‌نام موفقیت‌آمیز');
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
        <h2>ثبت‌نام</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>نام کامل</label>
            <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required placeholder="نام و نام خانوادگی" />
          </div>
          <div className="form-group">
            <label>ایمیل</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="email@example.com" />
          </div>
          <div className="form-group">
            <label>رمز عبور</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} placeholder="حداقل ۶ کاراکتر" />
          </div>
          <div className="form-group">
            <label>تلفن</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="09121234567" />
          </div>
          <div className="form-group">
            <label>نقش</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="client">موکل</option>
              <option value="lawyer">وکیل</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
          </button>
        </form>
        <p className="auth-link">قبلاً ثبت‌نام کرده‌اید؟ <Link to="/login">وارد شوید</Link></p>
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
        .auth-header { text-align: center; margin-bottom: 32px; }
        .auth-header h1 { font-size: 32px; font-weight: 800; color: var(--primary); }
        .auth-header p { color: var(--text-secondary); font-size: 14px; margin-top: 4px; }
        .auth-card h2 { font-size: 18px; margin-bottom: 20px; }
        .auth-link { text-align: center; margin-top: 20px; font-size: 14px; color: var(--text-secondary); }
        .auth-link a { color: var(--primary); font-weight: 500; }
      `}</style>
    </div>
  );
}
