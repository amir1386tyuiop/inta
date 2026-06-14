import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cases as casesApi, calendar as calendarApi, notifications as notifApi } from '../services/api';
import { FiBriefcase, FiCalendar, FiBell, FiArrowLeft } from 'react-icons/fi';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ cases: 0, todayEvents: 0, unread: 0 });
  const [todayEvents, setTodayEvents] = useState([]);
  const [recentCases, setRecentCases] = useState([]);

  useEffect(() => {
    Promise.all([
      casesApi.list('limit=5'),
      calendarApi.today(),
      notifApi.unreadCount(),
    ]).then(([casesData, events, unread]) => {
      setStats({ cases: casesData.pagination?.total || 0, todayEvents: events.length, unread: unread.count });
      setTodayEvents(events);
      setRecentCases(casesData.cases || []);
    }).catch(() => {});
  }, []);

  const statusLabel = { open: 'باز', in_progress: 'در حال بررسی', closed: 'بسته شده', archived: 'بایگانی' };
  const statusColor = { open: 'badge-primary', in_progress: 'badge-warning', closed: 'badge-success', archived: 'badge-danger' };

  return (
    <div>
      <div className="page-header">
        <h1>سلام، {user?.fullName}</h1>
      </div>

      <div className="stats-grid">
        <Link to="/cases" className="stat-card">
          <FiBriefcase size={28} className="stat-icon" />
          <div className="stat-number">{stats.cases}</div>
          <div className="stat-label">پرونده</div>
        </Link>
        <Link to="/calendar" className="stat-card">
          <FiCalendar size={28} className="stat-icon" />
          <div className="stat-number">{stats.todayEvents}</div>
          <div className="stat-label">جلسه امروز</div>
        </Link>
        <Link to="/notifications" className="stat-card">
          <FiBell size={28} className="stat-icon" />
          <div className="stat-number">{stats.unread}</div>
          <div className="stat-label">نوتیفیکیشن خوانده‌نشده</div>
        </Link>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>جلسات امروز</h3>
            <Link to="/calendar" className="btn btn-sm btn-outline">مشاهده تقویم <FiArrowLeft /></Link>
          </div>
          {todayEvents.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>جلسه‌ای برای امروز ثبت نشده</p>
          ) : (
            todayEvents.map(ev => (
              <div key={ev.id} className="event-item">
                <div className="event-time">{ev.eventTime || '--:--'}</div>
                <div>
                  <div style={{ fontWeight: 500 }}>{ev.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{ev.court} {ev.branch && `- ${ev.branch}`}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>پرونده‌های اخیر</h3>
            <Link to="/cases" className="btn btn-sm btn-outline">همه پرونده‌ها <FiArrowLeft /></Link>
          </div>
          {recentCases.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>پرونده‌ای ثبت نشده</p>
          ) : (
            recentCases.map(c => (
              <Link to={`/cases/${c.id}`} key={c.id} className="case-item">
                <div>
                  <div style={{ fontWeight: 500 }}>{c.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.caseType}</div>
                </div>
                <span className={`badge ${statusColor[c.status] || 'badge-primary'}`}>
                  {statusLabel[c.status] || c.status}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>

      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: #fff;
          border-radius: var(--radius);
          padding: 24px;
          box-shadow: var(--shadow);
          text-decoration: none;
          color: var(--text);
          transition: var(--transition);
          text-align: center;
        }
        .stat-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
        .stat-icon { color: var(--primary); margin-bottom: 8px; }
        .stat-number { font-size: 32px; font-weight: 700; color: var(--primary-dark); }
        .stat-label { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }
        .event-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }
        .event-item:last-child { border-bottom: none; }
        .event-time {
          background: var(--primary);
          color: #fff;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          font-weight: 600;
          min-width: 60px;
          text-align: center;
        }
        .case-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
          text-decoration: none;
          color: var(--text);
        }
        .case-item:last-child { border-bottom: none; }
        .case-item:hover { background: #f8fafc; margin: 0 -24px; padding: 12px 24px; }
      `}</style>
    </div>
  );
}
