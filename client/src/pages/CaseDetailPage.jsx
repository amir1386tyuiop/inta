import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { cases as casesApi, verdicts as verdictsApi, documents as docsApi } from '../services/api';
import toast from 'react-hot-toast';
import { FiCpu, FiFileText, FiUpload, FiImage } from 'react-icons/fi';

export default function CaseDetailPage() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [showVerdictModal, setShowVerdictModal] = useState(false);
  const [verdictForm, setVerdictForm] = useState({ verdictText: '', judge: '', court: '' });
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => { loadCase(); }, [id]);

  const loadCase = async () => {
    try {
      const data = await casesApi.get(id);
      setCaseData(data);
    } catch { toast.error('خطا در بارگذاری پرونده'); }
    finally { setLoading(false); }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await casesApi.analyze(id);
      setCaseData(prev => ({ ...prev, aiAnalysis: res.analysis }));
      toast.success('تحلیل پرونده انجام شد');
    } catch (err) { toast.error(err.message); }
    finally { setAnalyzing(false); }
  };

  const handleSummarize = async () => {
    setSummarizing(true);
    try {
      const res = await casesApi.summarize(id);
      setCaseData(prev => ({ ...prev, aiSummary: res.summary }));
      toast.success('خلاصه پرونده ایجاد شد');
    } catch (err) { toast.error(err.message); }
    finally { setSummarizing(false); }
  };

  const handleAddVerdict = async (e) => {
    e.preventDefault();
    try {
      await verdictsApi.create({ ...verdictForm, caseId: id });
      toast.success('حکم ثبت شد');
      setShowVerdictModal(false);
      setVerdictForm({ verdictText: '', judge: '', court: '' });
      loadCase();
    } catch (err) { toast.error(err.message); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caseId', id);
      await docsApi.upload(formData);
      toast.success('فایل آپلود شد');
      loadCase();
    } catch (err) { toast.error(err.message); }
    finally { setUploadingDoc(false); }
  };

  const handleAnalyzeDoc = async (docId) => {
    try {
      await docsApi.analyze(docId);
      toast.success('تحلیل سند انجام شد');
      loadCase();
    } catch (err) { toast.error(err.message); }
  };

  const handleAnalyzeVerdict = async (verdictId) => {
    try {
      await verdictsApi.analyze(verdictId);
      toast.success('تحلیل حکم انجام شد');
      loadCase();
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!caseData) return <div className="empty-state"><h3>پرونده یافت نشد</h3></div>;

  const statusLabel = { open: 'باز', in_progress: 'در حال بررسی', closed: 'بسته شده' };

  return (
    <div>
      <div className="page-header">
        <h1>{caseData.title}</h1>
        <span className="badge badge-primary">{caseData.caseType}</span>
      </div>

      <div className="detail-grid">
        {/* Info */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>اطلاعات پرونده</h3>
          <div className="info-row"><span>شماره:</span><span>{caseData.caseNumber || '-'}</span></div>
          <div className="info-row"><span>وضعیت:</span><span>{statusLabel[caseData.status] || caseData.status}</span></div>
          <div className="info-row"><span>موکل:</span><span>{caseData.client?.fullName}</span></div>
          <div className="info-row"><span>وکیل:</span><span>{caseData.lawyer?.user?.fullName || 'تعیین نشده'}</span></div>
          <div style={{ marginTop: 16 }}>
            <h4 style={{ marginBottom: 8 }}>شرح پرونده</h4>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 2 }}>{caseData.description}</p>
          </div>
        </div>

        {/* AI Actions */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}><FiCpu style={{ marginLeft: 8 }} />هوش مصنوعی</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
            <button className="btn btn-accent" onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? 'در حال تحلیل...' : 'تحلیل پرونده'}
            </button>
            <button className="btn btn-outline" onClick={handleSummarize} disabled={summarizing}>
              {summarizing ? 'در حال خلاصه‌سازی...' : 'خلاصه پرونده'}
            </button>
          </div>

          {caseData.aiSummary && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ marginBottom: 8, color: 'var(--accent)' }}>خلاصه AI</h4>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 14, background: 'var(--bg)', padding: 16, borderRadius: 8, lineHeight: 2 }}>{caseData.aiSummary}</pre>
            </div>
          )}

          {caseData.aiAnalysis && (
            <div>
              <h4 style={{ marginBottom: 8, color: 'var(--accent)' }}>تحلیل AI</h4>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 14, background: 'var(--bg)', padding: 16, borderRadius: 8, lineHeight: 2 }}>{caseData.aiAnalysis}</pre>
            </div>
          )}
        </div>
      </div>

      {/* Documents */}
      <div className="card" style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3><FiFileText style={{ marginLeft: 8 }} />اسناد و تصاویر</h3>
          <label className="btn btn-sm btn-primary" style={{ cursor: 'pointer' }}>
            <FiUpload /> {uploadingDoc ? 'در حال آپلود...' : 'آپلود فایل'}
            <input type="file" hidden onChange={handleUpload} accept="image/*,.pdf" />
          </label>
        </div>
        {(!caseData.documents || caseData.documents.length === 0) ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>سندی آپلود نشده</p>
        ) : (
          <div className="docs-grid">
            {caseData.documents.map(doc => (
              <div key={doc.id} className="doc-card">
                <FiImage size={24} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{doc.fileName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{doc.fileType}</div>
                </div>
                {doc.fileType === 'image' && (
                  <button className="btn btn-sm btn-accent" onClick={() => handleAnalyzeDoc(doc.id)}>تحلیل AI</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verdicts */}
      <div className="card" style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>احکام</h3>
          <button className="btn btn-sm btn-primary" onClick={() => setShowVerdictModal(true)}>ثبت حکم</button>
        </div>
        {(!caseData.verdicts || caseData.verdicts.length === 0) ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>حکمی ثبت نشده</p>
        ) : (
          caseData.verdicts.map(v => (
            <div key={v.id} style={{ padding: 16, background: 'var(--bg)', borderRadius: 8, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>{v.judge && <span>قاضی: {v.judge}</span>} {v.court && <span> | دادگاه: {v.court}</span>}</div>
                <button className="btn btn-sm btn-accent" onClick={() => handleAnalyzeVerdict(v.id)}>تحلیل AI</button>
              </div>
              <p style={{ fontSize: 14 }}>{v.verdictText}</p>
              {v.aiAnalysis && (
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, marginTop: 12, padding: 12, background: '#fff', borderRadius: 6, lineHeight: 2 }}>{v.aiAnalysis}</pre>
              )}
            </div>
          ))
        )}
      </div>

      {showVerdictModal && (
        <div className="modal-overlay" onClick={() => setShowVerdictModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>ثبت حکم جدید</h2>
            <form onSubmit={handleAddVerdict}>
              <div className="form-group"><label>متن حکم</label><textarea value={verdictForm.verdictText} onChange={e => setVerdictForm({ ...verdictForm, verdictText: e.target.value })} required /></div>
              <div className="form-group"><label>قاضی</label><input value={verdictForm.judge} onChange={e => setVerdictForm({ ...verdictForm, judge: e.target.value })} /></div>
              <div className="form-group"><label>دادگاه</label><input value={verdictForm.court} onChange={e => setVerdictForm({ ...verdictForm, court: e.target.value })} /></div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowVerdictModal(false)}>انصراف</button>
                <button type="submit" className="btn btn-primary">ثبت حکم</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 14px; }
        .info-row span:first-child { font-weight: 500; color: var(--text-secondary); }
        .docs-grid { display: flex; flex-direction: column; gap: 8px; }
        .doc-card { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg); border-radius: var(--radius-sm); }
      `}</style>
    </div>
  );
}
