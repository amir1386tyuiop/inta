import { useState, useEffect } from 'react';
import { notifications as notifApi } from '../services/api';
import toast from 'react-hot-toast';
import { FiBell, FiCheckCircle, FiCalendar, FiBriefcase } from 'react-icons/fi';

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => { loadNotifs(); }, []);

  const loadNotifs = async () => {
    try {
      const data = await notifApi.list();
      setNotifs(data.notifications || []);
    } catch { toast.error('خطا در بارگذاری'); }
    finally { setLoading(false); }
  };

  const handleView = async (id) => {
    setDetailLoading(true);
    try {
      const data = await notifApi.get(id);
      setSelected(data);
      loadNotifs();
    } catch { toast.error('خطا'); }
    finally { setDetailLoading(false); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notifApi.markAllRead();
      toast.success('همه خوانده شدند');
      loadNotifs();
    } catch { toast.error('خطا'); }
  };

  const typeIcon = { court_reminder: <FiCalendar />, case_update: <FiBriefcase />, general: <FiBell /> };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1><FiBell style={{ marginLeft: 8 }} />نوتیفیکیشن‌ها</h1>
        <button className="btn btn-outline" onClick={handleMarkAllRead}>
          <FiCheckCircle /> خواندن همه
        </button>
      </div>

      <div className="notif-layout">
        <div className="notif-list">
          {notifs.length === 0 ? (
            <div className="empty-state card"><FiBell size={40} /><h3>نوتیفیکیشنی ندارید</h3></div>
          ) : (
            notifs.map(n => (
              <div key={n.id} className={`card notif-item ${!n.isRead ? 'unread' : ''} ${selected?.id === n.id ? 'active' : ''}`} onClick={() => handleView(n.id)}>
                <div className="notif-icon">{typeIcon[n.type] || <FiBell />}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: n.isRead ? 400 : 600, fontSize: 14 }}>{n.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{n.message}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 6 }}>{new Date(n.createdAt).toLocaleDateString('fa-IR')}</div>
                </div>
                {!n.isRead && <div className="unread-dot" />}
              </div>
            ))
          )}
        </div>

        {selected && (
          <div className="notif-detail card">
            {detailLoading ? <div className="loading"><div className="spinner" /></div> : (
              <>
                <h2 style={{ marginBottom: 16 }}>{selected.title}</h2>
                <p style={{ marginBottom: 20, color: 'var(--text-secondary)' }}>{selected.message}</p>

                {selected.calendarEvent && (
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ marginBottom: 12, color: 'var(--accent)' }}>اطلاعات جلسه</h3>
                    <div className="info-row"><span>عنوان:</span><span>{selected.calendarEvent.title}</span></div>
                    <div className="info-row"><span>تاریخ:</span><span>{new Date(selected.calendarEvent.eventDate).toLocaleDateString('fa-IR')}</span></div>
                    <div className="info-row"><span>ساعت:</span><span>{selected.calendarEvent.eventTime || '-'}</span></div>
                    <div className="info-row"><span>دادگاه:</span><span>{selected.calendarEvent.court || '-'}</span></div>
                    <div className="info-row"><span>شعبه:</span><span>{selected.calendarEvent.branch || '-'}</span></div>
                  </div>
                )}

                {selected.calendarEvent?.case && (
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ marginBottom: 12, color: 'var(--accent)' }}>جزئیات پرونده</h3>
                    <div className="info-row"><span>عنوان:</span><span>{selected.calendarEvent.case.title}</span></div>
                    <div className="info-row"><span>نوع:</span><span>{selected.calendarEvent.case.caseType}</span></div>
                    <div className="info-row"><span>وضعیت:</span><span>{selected.calendarEvent.case.status}</span></div>
                    <div className="info-row"><span>موکل:</span><span>{selected.calendarEvent.case.client?.fullName}</span></div>
                    <div className="info-row"><span>وکیل:</span><span>{selected.calendarEvent.case.lawyer?.user?.fullName || '-'}</span></div>
                    {selected.calendarEvent.case.documents?.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <h4>اسناد ({selected.calendarEvent.case.documents.length})</h4>
                        {selected.calendarEvent.case.documents.map(d => (
                          <div key={d.id} style={{ fontSize: 13, padding: '4px 0' }}>{d.fileName}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selected.parsedMetadata?.caseSummary && (
                  <div>
                    <h3 style={{ marginBottom: 12, color: 'var(--accent)' }}>خلاصه پرونده (AI)</h3>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 14, background: 'var(--bg)', padding: 16, borderRadius: 8, lineHeight: 2 }}>{selected.parsedMetadata.caseSummary}</pre>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        .notif-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .notif-list { display: flex; flex-direction: column; gap: 8px; }
        .notif-item { display: flex; align-items: flex-start; gap: 12px; cursor: pointer; transition: var(--transition); padding: 16px; }
        .notif-item:hover { box-shadow: var(--shadow-md); }
        .notif-item.unread { border-right: 3px solid var(--primary); }
        .notif-item.active { border-right: 3px solid var(--accent); background: #fffbeb; }
        .notif-icon { width: 36px; height: 36px; border-radius: 50%; background: var(--bg); display: flex; align-items: center; justify-content: center; color: var(--primary); }
        .unread-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--primary); flex-shrink: 0; margin-top: 6px; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 14px; }
        .info-row span:first-child { font-weight: 500; color: var(--text-secondary); }
        @media (max-width: 768px) { .notif-layout { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
