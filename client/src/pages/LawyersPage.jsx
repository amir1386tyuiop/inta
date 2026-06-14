import { useState, useEffect } from 'react';
import { lawyers as lawyersApi } from '../services/api';
import toast from 'react-hot-toast';
import { FiUsers, FiMapPin, FiStar, FiSearch } from 'react-icons/fi';

export default function LawyersPage() {
  const [lawyersList, setLawyersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ specialization: '', city: '' });
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadLawyers(); }, []);

  const loadLawyers = async (params = '') => {
    setLoading(true);
    try {
      const data = await lawyersApi.search(params);
      setLawyersList(data.lawyers || []);
    } catch { toast.error('خطا'); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.specialization) params.set('specialization', search.specialization);
    if (search.city) params.set('city', search.city);
    loadLawyers(params.toString());
  };

  return (
    <div>
      <div className="page-header">
        <h1><FiUsers style={{ marginLeft: 8 }} />پیدا کردن وکیل</h1>
      </div>

      <form className="card" style={{ marginBottom: 20 }} onSubmit={handleSearch}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>تخصص</label>
            <select value={search.specialization} onChange={e => setSearch({ ...search, specialization: e.target.value })}>
              <option value="">همه تخصص‌ها</option>
              <option value="کیفری">کیفری</option>
              <option value="حقوقی">حقوقی</option>
              <option value="خانواده">خانواده</option>
              <option value="تجاری">تجاری</option>
              <option value="اداری">اداری</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>شهر</label>
            <input value={search.city} onChange={e => setSearch({ ...search, city: e.target.value })} placeholder="مثل: تهران" />
          </div>
          <button type="submit" className="btn btn-primary"><FiSearch /> جستجو</button>
        </div>
      </form>

      {loading ? <div className="loading"><div className="spinner" /></div> : (
        <div className="lawyers-grid">
          {lawyersList.length === 0 ? (
            <div className="empty-state card" style={{ gridColumn: '1 / -1' }}>
              <FiUsers size={48} /><h3>وکیلی یافت نشد</h3>
            </div>
          ) : (
            lawyersList.map(l => (
              <div key={l.id} className="card lawyer-card" onClick={() => setSelected(selected?.id === l.id ? null : l)}>
                <div className="lawyer-header">
                  <div className="lawyer-avatar">{l.user?.fullName?.[0]}</div>
                  <div>
                    <h3>{l.user?.fullName}</h3>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>شماره پروانه: {l.licenseNumber}</div>
                  </div>
                  {l.isVerified && <span className="badge badge-success">تأیید شده</span>}
                </div>
                <div className="lawyer-meta">
                  <span><FiMapPin size={14} /> {l.city}، {l.province}</span>
                  <span><FiStar size={14} /> {l.rating}</span>
                  <span>{l.experienceYears} سال سابقه</span>
                </div>
                <div className="lawyer-specs">
                  {l.specializations?.split(',').map((s, i) => (
                    <span key={i} className="badge badge-primary">{s.trim()}</span>
                  ))}
                </div>
                {selected?.id === l.id && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 14, lineHeight: 2 }}>{l.bio}</p>
                    <div style={{ marginTop: 12, fontSize: 14 }}>
                      <div>ایمیل: {l.user?.email}</div>
                      <div>تلفن: {l.user?.phone}</div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <style>{`
        .lawyers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 16px; }
        .lawyer-card { cursor: pointer; transition: var(--transition); }
        .lawyer-card:hover { box-shadow: var(--shadow-md); }
        .lawyer-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .lawyer-avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; }
        .lawyer-header h3 { font-size: 16px; }
        .lawyer-meta { display: flex; gap: 16px; font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; }
        .lawyer-meta span { display: flex; align-items: center; gap: 4px; }
        .lawyer-specs { display: flex; gap: 6px; flex-wrap: wrap; }
      `}</style>
    </div>
  );
}
