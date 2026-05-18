import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const STEPS = ['Select File', 'Processing', 'Review'];

export default function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setError('');
    setStep(1);
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    const form = new FormData();
    form.append('file', file);
    try {
      const { data } = await API.post('/upload', form);
      setStep(2);
      setTimeout(() => navigate(`/review/${data.document_id}`), 1000);
    } catch (e) {
      setError(e.response?.data?.detail || 'Processing failed.');
      setStep(0);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">New Document</h1>
        <p className="text-gray-400 mt-1">Upload a manufacturing document for AI-powered data extraction</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              i === step
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : i < step
                ? 'bg-emerald-900 text-emerald-400'
                : 'bg-gray-800 text-gray-500'
            }`}>
              <span>{i < step ? '✓' : i + 1}</span>
              <span>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-8 ${i < step ? 'bg-emerald-500' : 'bg-gray-700'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Upload Card */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
        <div
          className="border-2 border-dashed border-gray-600 rounded-xl p-16 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/5 transition-all group"
          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input
            id="fileInput"
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <p className="text-6xl mb-4 group-hover:scale-110 transition-transform">📋</p>
          <p className="text-white font-bold text-lg">Drop your document here</p>
          <p className="text-gray-500 text-sm mt-2">or click to browse files</p>
          <div className="flex justify-center gap-2 mt-4">
            {['JPG', 'PNG', 'PDF'].map(t => (
              <span key={t} className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-md">{t}</span>
            ))}
          </div>
        </div>

        {/* File Preview */}
        {file && (
          <div className="mt-6 p-4 bg-gray-800 rounded-xl border border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📄</span>
              <div>
                <p className="text-white font-semibold text-sm">{file.name}</p>
                <p className="text-gray-500 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <span className="ml-auto text-emerald-400 text-xs font-semibold bg-emerald-400/10 px-2 py-1 rounded-full">
                Ready
              </span>
            </div>
            {preview && (
              <img src={preview} alt="preview" className="w-full max-h-56 object-contain rounded-lg border border-gray-700" />
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm font-medium">❌ {error}</p>
          </div>
        )}

        {/* Success */}
        {step === 2 && (
          <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <p className="text-emerald-400 text-sm font-medium">✅ Extraction complete! Redirecting...</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="mt-6 w-full py-4 rounded-xl font-bold text-sm transition-all bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Extracting data...
            </span>
          ) : 'Extract Data →'}
        </button>
      </div>
    </div>
  );
}