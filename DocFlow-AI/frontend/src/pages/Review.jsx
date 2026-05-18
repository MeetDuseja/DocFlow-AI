import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

const FIELDS = [
  { key: 'date', label: 'Date', type: 'text', placeholder: 'YYYY-MM-DD', icon: '📅' },
  { key: 'shift', label: 'Shift', type: 'text', placeholder: 'A / B / C / I / II / III', icon: '🔄' },
  { key: 'employee_number', label: 'Employee Number', type: 'text', placeholder: 'e.g. EMP-001', icon: '👤' },
  { key: 'operation_code', label: 'Operation Code', type: 'text', placeholder: 'e.g. OP-01', icon: '⚙️' },
  { key: 'machine_number', label: 'Machine Number', type: 'text', placeholder: 'e.g. MC-101', icon: '🏭' },
  { key: 'work_order_number', label: 'Work Order Number', type: 'text', placeholder: 'e.g. WO-2024-001', icon: '📋' },
  { key: 'quantity_produced', label: 'Quantity Produced', type: 'number', placeholder: 'e.g. 150', icon: '📦' },
  { key: 'time_taken', label: 'Time Taken (hrs)', type: 'number', placeholder: 'e.g. 8', icon: '⏱️' },
];

function AccuracyBar({ score }) {
  if (score === undefined || score === null) return null;
  const color =
    score >= 80 ? 'bg-emerald-500' :
    score >= 50 ? 'bg-yellow-500' :
    'bg-red-500';
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-8">{score}%</span>
    </div>
  );
}

export default function Review() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [allRecordIds, setAllRecordIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState({});
  const [flags, setFlags] = useState([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load first record and get all record ids
  useEffect(() => {
    API.get(`/records/${id}`).then(({ data }) => {
      setAllRecordIds(data.all_record_ids || [data.id]);
      loadRecord(data);
    });
  }, [id]);

  const loadRecord = (data) => {
    setRecord(data);
    setFlags(data.validation_flags || []);
    setSaved(false);
    setForm({
      date: data.date || '',
      shift: data.shift || '',
      employee_number: data.employee_number || '',
      operation_code: data.operation_code || '',
      machine_number: data.machine_number || '',
      work_order_number: data.work_order_number || '',
      quantity_produced: data.quantity_produced ?? '',
      time_taken: data.time_taken ?? '',
    });
  };

  const switchRecord = async (index) => {
    if (index < 0 || index >= allRecordIds.length) return;
    const recordId = allRecordIds[index];
    const { data } = await API.get(`/record-by-id/${recordId}`);
    setCurrentIndex(index);
    loadRecord(data);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await API.put(`/records/${record.id}`, form);
      setFlags(data.flags || []);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert('Save failed. Please try again.');
    }
    setSaving(false);
  };

  if (!record) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500 animate-pulse">Loading record...</p>
    </div>
  );

  const flaggedFields = flags.map(f => f.field);
  const accuracy = record.accuracy_scores || {};

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white">Verify Document</h1>
          <p className="text-gray-400 mt-1">Review and correct AI-extracted fields</p>
        </div>
        <button
          onClick={() => navigate('/records')}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition"
        >
          ← Back to Records
        </button>
      </div>

      {/* Multi-record switcher */}
      {allRecordIds.length > 1 && (
        <div className="mb-6 p-4 bg-gray-900 border border-gray-700 rounded-2xl flex items-center gap-4">
          <p className="text-gray-400 text-sm">
            📄 This document has <span className="text-white font-bold">{allRecordIds.length}</span> records
          </p>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => switchRecord(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm disabled:opacity-40 transition"
            >
              ← Prev
            </button>
            <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-semibold">
              {currentIndex + 1} / {allRecordIds.length}
            </span>
            <button
              onClick={() => switchRecord(currentIndex + 1)}
              disabled={currentIndex === allRecordIds.length - 1}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm disabled:opacity-40 transition"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Flags Banner */}
      {flags.length > 0 ? (
        <div className="mb-6 p-5 bg-red-500/10 border border-red-500/30 rounded-2xl">
          <p className="text-red-400 font-bold mb-3">🚩 {flags.length} issue(s) require attention</p>
          <div className="grid grid-cols-2 gap-2">
            {flags.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-red-300">
                <span className="mt-0.5 text-xs bg-red-500/20 px-1.5 py-0.5 rounded font-mono uppercase">
                  {f.type}
                </span>
                <span>{f.message}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
          <p className="text-emerald-400 font-semibold">✅ All fields passed validation</p>
        </div>
      )}

      {/* Fields Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {FIELDS.map(({ key, label, type, placeholder, icon }) => {
          const isFlagged = flaggedFields.includes(key);
          const acc = accuracy[key];
          return (
            <div
              key={key}
              className={`p-5 rounded-2xl border transition-all ${
                isFlagged
                  ? 'border-red-500/40 bg-red-500/5'
                  : acc !== undefined && acc < 50
                  ? 'border-yellow-500/40 bg-yellow-500/5'
                  : 'border-gray-700 bg-gray-900'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span>{icon}</span>
                <p className="text-gray-300 text-sm font-semibold">{label}</p>
                {isFlagged && (
                  <span className="ml-auto text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                    Flagged
                  </span>
                )}
              </div>

              <input
                type={type}
                placeholder={placeholder}
                className={`w-full bg-gray-800 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition ${
                  isFlagged
                    ? 'border-red-500/50 focus:ring-red-500/30'
                    : 'border-gray-700 focus:ring-emerald-500/30'
                }`}
                value={form[key] ?? ''}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
              />

              <AccuracyBar score={acc} />

              {isFlagged && (
                <p className="text-xs text-red-400 mt-2">
                  ⚠ {flags.find(f => f.field === key)?.message}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
      >
        {saving ? '💾 Saving...' : saved ? '✅ Verified & Saved!' : 'Verify & Save Record →'}
      </button>
    </div>
  );
}