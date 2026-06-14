import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cases as casesApi } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEye } from 'react-icons/fi';

export default function CasesPage() {
  const [casesList, setCasesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', caseType: 'حقوقی', caseNumber: '' });

  useEffect(() => { loadCases(); }, []);

  const loadCases = async () => {
    try {
      const data = await casesApi.list();
      setCasesList(data.cases || []);
    } catch { toast.error('خطا در بارگذاری پرونده‌ها'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await casesApi.create(form);
      toast.success('پرونده ایجاد شد');
      setShowModal(false);
      setForm({ title: '', description: '', caseType: 'حقوقی', caseNumber: '' });
      loadCases();
    } catch (err) { toast.error(err.message); }
  };

  const statusLabel = { open: 'باز', in_progress: 'در حال بررسی', closed: 'بسته شده', archived: 'بایگانی' };
  const statusColor = { open: 'badge-primary', in_progress: 'badge-warning', closed: 'badge-success', archived: 'badge-danger' };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1>پرونده‌ها</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> پرونده جدید
        </button>
      </div>

      {casesList.length === 0 ? (
        <div className="empty-state card">
          <FiEye size={48} />
          <h3>پرونده‌ای یافت نشد</h3>
          <p>اولین پرونده خود را ایجاد کنید</p>
        </div>
      ) : (
        <div className="card table-wrapper">
          <table>
            <thead>
              <tr>
                <th>عنوان</th>
                <th>شماره پرونده</th>
                <th>نوع</th>
                <th>وضعیت</th>
                <th>وکیل</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {casesList.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.title}</td>
                  <td>{c.caseNumber || '-'}</td>
                  <td>{c.caseType}</td>
                  <td><span className={`badge ${statusColor[c.status]}`}>{statusLabel[c.status]}</span></td>
                  <td>{c.lawyer?.user?.fullName || '-'}</td>
                  <td><Link to={`/cases/${c.id}`} className="btn btn-sm btn-outline"><FiEye /> مشاهده</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>پرونده جدید</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>عنوان پرونده</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>شماره پرونده (اختیاری)</label>
                <input value={form.caseNumber} onChange={e => setForm({ ...form, caseNumber: e.target.value })} />
              </div>
              <div className="form-group">
                <label>نوع پرونده</label>
                <select value={form.caseType} onChange={e => setForm({ ...form, caseType: e.target.value })}>
                  <option value="حقوقی">حقوقی</option>
                  <option value="کیفری">کیفری</option>
                  <option value="خانواده">خانواده</option>
                  <option value="تجاری">تجاری</option>
                  <option value="اداری">اداری</option>
                </select>
              </div>
              <div className="form-group">
                <label>شرح پرونده</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>انصراف</button>
                <button type="submit" className="btn btn-primary">ایجاد پرونده</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
