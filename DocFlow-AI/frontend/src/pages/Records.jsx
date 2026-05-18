import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const STATUS_CONFIG = {
  verified: { label: 'Verified', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  extracted: { label: 'Extracted', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  pending: { label: 'Pending', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  failed: { label: 'Failed', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

export default function Records() {
  const [docs, setDocs] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    API.get(`/documents?search=${search}`).then(({ data }) => setDocs(data));
  }, [search]);

  const filtered = filter === 'all' ? docs : docs.filter(d => d.status === filter);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Document Records</h1>
        <p className="text-gray-400 mt-1">All submitted and processed documents</p>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex gap-3 mb-6">
        <input
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          placeholder="🔍 Search by filename..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          {['all', 'extracted', 'verified', 'failed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${
                filter === f
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">📭</p>
          <p className="text-gray-500 font-medium">No documents found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((doc, i) => {
            const cfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending;
            return (
              <div
                key={doc.id}
                className="bg-gray-900 border border-gray-700 rounded-2xl p-5 flex items-center gap-5 hover:border-emerald-500/40 hover:bg-gray-900/80 transition-all cursor-pointer group"
                onClick={() => navigate(`/review/${doc.id}`)}
              >
                {/* Index */}
                <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 text-sm font-bold shrink-0">
                  {i + 1}
                </div>

                {/* File Icon */}
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-xl shrink-0">
                  📄
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{doc.filename}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {new Date(doc.uploaded_at).toLocaleString()}
                  </p>
                </div>

                {/* Status Badge */}
                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${cfg.color} shrink-0`}>
                  {cfg.label}
                </span>

                {/* Arrow */}
                <span className="text-gray-600 group-hover:text-emerald-400 transition text-lg shrink-0">
                  →
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}