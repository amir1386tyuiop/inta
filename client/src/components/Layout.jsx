import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiMessageSquare, FiBookOpen, FiPhone, FiUsers, FiBriefcase, FiCalendar, FiBell, FiSearch, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { notifications as notifApi } from '../services/api';
import { useEffect } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notifApi.unreadCount().then(d => setUnreadCount(d.count)).catch(() => {});
    const interval = setInterval(() => {
      notifApi.unreadCount().then(d => setUnreadCount(d.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: <FiHome />, label: 'داشبورد' },
    { to: '/ai-chat', icon: <FiMessageSquare />, label: 'چت هوشمند' },
    { to: '/cases', icon: <FiBriefcase />, label: 'پرونده‌ها' },
    { to: '/calendar', icon: <FiCalendar />, label: 'تقویم دادگاه' },
    { to: '/notifications', icon: <FiBell />, label: 'نوتیفیکیشن', badge: unreadCount },
    { to: '/lawyers', icon: <FiUsers />, label: 'وکلا' },
    { to: '/blog', icon: <FiBookOpen />, label: 'وبلاگ' },
    { to: '/contact', icon: <FiPhone />, label: 'تماس با ما' },
    { to: '/search', icon: <FiSearch />, label: 'جستجو' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile toggle */}
      <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>اینتا</h2>
          <span>پلتفرم حقوقی هوشمند</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.fullName?.[0]}</div>
            <div>
              <div className="user-name">{user?.fullName}</div>
              <div className="user-role">
                {user?.role === 'admin' ? 'مدیر' : user?.role === 'lawyer' ? 'وکیل' : 'موکل'}
              </div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut />
            <span>خروج</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <Outlet />
      </main>

      <style>{`
        .sidebar {
          width: 260px;
          background: var(--bg-sidebar);
          color: #fff;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          z-index: 100;
          transition: transform 0.3s;
        }
        .sidebar-header {
          padding: 24px 20px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .sidebar-header h2 {
          font-size: 22px;
          font-weight: 800;
          color: var(--accent);
        }
        .sidebar-header span {
          font-size: 12px;
          color: rgba(255,255,255,0.6);
        }
        .sidebar-nav {
          flex: 1;
          padding: 12px 10px;
          overflow-y: auto;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          color: rgba(255,255,255,0.7);
          font-size: 14px;
          margin-bottom: 2px;
          transition: var(--transition);
          text-decoration: none;
          position: relative;
        }
        .nav-item:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }
        .nav-item.active {
          background: rgba(200,169,81,0.15);
          color: var(--accent);
        }
        .nav-badge {
          position: absolute;
          left: 14px;
          background: var(--danger);
          color: #fff;
          font-size: 11px;
          padding: 1px 7px;
          border-radius: 10px;
          font-weight: 600;
        }
        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--accent);
          color: var(--primary-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 15px;
        }
        .user-name { font-size: 14px; font-weight: 500; }
        .user-role { font-size: 12px; color: rgba(255,255,255,0.5); }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(220,38,38,0.15);
          border: none;
          color: #f87171;
          padding: 8px 14px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          width: 100%;
          cursor: pointer;
          transition: var(--transition);
        }
        .logout-btn:hover { background: rgba(220,38,38,0.25); }
        .main-content {
          flex: 1;
          margin-right: 260px;
          padding: 32px;
          min-height: 100vh;
        }
        .mobile-menu-btn {
          display: none;
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 200;
          background: var(--primary);
          color: #fff;
          border: none;
          border-radius: var(--radius-sm);
          padding: 8px;
        }
        @media (max-width: 768px) {
          .sidebar { transform: translateX(100%); }
          .sidebar.open { transform: translateX(0); }
          .main-content { margin-right: 0; }
          .mobile-menu-btn { display: block; }
        }
      `}</style>
    </div>
  );
}
