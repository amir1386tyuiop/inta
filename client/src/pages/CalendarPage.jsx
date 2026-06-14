import { useState, useEffect } from 'react';
import { calendar as calendarApi } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiCalendar } from 'react-icons/fi';

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', eventDate: '', eventTime: '', court: '', branch: '', description: '' });

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    try {
      const data = await calendarApi.list();
      setEvents(data);
    } catch { toast.error('خطا در بارگذاری تقویم'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await calendarApi.create(form);
      toast.success('رویداد ایجاد شد');
      setShowModal(false);
      setForm({ title: '', eventDate: '', eventTime: '', court: '', branch: '', description: '' });
      loadEvents();
    } catch (err) { toast.error(err.message); }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fa-IR');
  };

  const statusLabel = { scheduled: 'برنامه‌ریزی شده', completed: 'برگزار شده', cancelled: 'لغو شده', postponed: 'به تعویق افتاده' };
  const statusColor = { scheduled: 'badge-primary', completed: 'badge-success', cancelled: 'badge-danger', postponed: 'badge-warning' };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1><FiCalendar style={{ marginLeft: 8 }} />تقویم دادگاه</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> رویداد جدید
        </button>
      </div>

      {events.length === 0 ? (
        <div className="empty-state card">
          <FiCalendar size={48} />
          <h3>رویدادی ثبت نشده</h3>
          <p>اولین جلسه دادگاه را ثبت کنید</p>
        </div>
      ) : (
        <div className="events-list">
          {events.map(ev => (
            <div key={ev.id} className="card event-card">
              <div className="event-date-badge">
                <div className="event-day">{formatDate(ev.eventDate)}</div>
                <div className="event-clock">{ev.eventTime || '--:--'}</div>
              </div>
              <div className="event-details">
                <h3>{ev.title}</h3>
                <div className="event-meta">
                  {ev.court && <span>{ev.court}</span>}
                  {ev.branch && <span> - {ev.branch}</span>}
                  {ev.case && <span> | پرونده: {ev.case.title}</span>}
                </div>
                {ev.description && <p style={{ fontSize: 14, marginTop: 8, color: 'var(--text-secondary)' }}>{ev.description}</p>}
              </div>
              <span className={`badge ${statusColor[ev.status]}`}>{statusLabel[ev.status]}</span>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>رویداد جدید</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group"><label>عنوان</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group"><label>تاریخ</label><input type="date" value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })} required /></div>
                <div className="form-group"><label>ساعت</label><input type="time" value={form.eventTime} onChange={e => setForm({ ...form, eventTime: e.target.value })} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group"><label>دادگاه</label><input value={form.court} onChange={e => setForm({ ...form, court: e.target.value })} /></div>
                <div className="form-group"><label>شعبه</label><input value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>توضیحات</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>انصراف</button>
                <button type="submit" className="btn btn-primary">ایجاد رویداد</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .events-list { display: flex; flex-direction: column; gap: 16px; }
        .event-card { display: flex; align-items: center; gap: 20px; }
        .event-date-badge {
          background: var(--primary);
          color: #fff;
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          text-align: center;
          min-width: 100px;
        }
        .event-day { font-size: 13px; font-weight: 600; }
        .event-clock { font-size: 18px; font-weight: 700; margin-top: 4px; }
        .event-details { flex: 1; }
        .event-details h3 { font-size: 16px; margin-bottom: 4px; }
        .event-meta { font-size: 13px; color: var(--text-secondary); }
      `}</style>
    </div>
  );
}
