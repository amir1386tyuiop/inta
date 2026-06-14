import { useState } from 'react';
import { contact as contactApi } from '../services/api';
import toast from 'react-hot-toast';
import { FiPhone, FiMail, FiMapPin, FiSend } from 'react-icons/fi';

export default function ContactPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactApi.submit(form);
      toast.success('پیام شما ارسال شد');
      setSent(true);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  if (sent) {
    return (
      <div className="empty-state card" style={{ maxWidth: 500, margin: '60px auto' }}>
        <FiSend size={48} style={{ color: 'var(--success)' }} />
        <h3>پیام شما ارسال شد</h3>
        <p>به زودی با شما تماس خواهیم گرفت</p>
        <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => { setSent(false); setForm({ fullName: '', email: '', phone: '', subject: '', message: '' }); }}>
          ارسال پیام جدید
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1><FiPhone style={{ marginLeft: 8 }} />تماس با ما</h1>
      </div>

      <div className="contact-grid">
        <div className="card">
          <h2 style={{ marginBottom: 20 }}>ارسال پیام</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group"><label>نام کامل</label><input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required /></div>
              <div className="form-group"><label>ایمیل</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group"><label>تلفن</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="form-group"><label>موضوع</label><input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required /></div>
            </div>
            <div className="form-group"><label>پیام</label><textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required /></div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <FiSend /> {loading ? 'در حال ارسال...' : 'ارسال پیام'}
            </button>
          </form>
        </div>

        <div>
          <div className="card contact-info-card">
            <FiMapPin size={24} className="contact-icon" />
            <h3>آدرس</h3>
            <p>تهران، خیابان ولیعصر</p>
          </div>
          <div className="card contact-info-card">
            <FiPhone size={24} className="contact-icon" />
            <h3>تلفن</h3>
            <p>۰۲۱-۱۲۳۴۵۶۷۸</p>
          </div>
          <div className="card contact-info-card">
            <FiMail size={24} className="contact-icon" />
            <h3>ایمیل</h3>
            <p>info@inta.ir</p>
          </div>
        </div>
      </div>

      <style>{`
        .contact-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
        .contact-info-card { text-align: center; padding: 24px; margin-bottom: 16px; }
        .contact-icon { color: var(--primary); margin-bottom: 8px; }
        .contact-info-card h3 { font-size: 16px; margin-bottom: 4px; }
        .contact-info-card p { font-size: 14px; color: var(--text-secondary); }
        @media (max-width: 768px) { .contact-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
