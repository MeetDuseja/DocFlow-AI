import { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import API from '../api';

function StatCard({ label, value, icon, sub, color }) {
  const colors = {
    emerald: 'from-emerald-600 to-emerald-400',
    blue: 'from-blue-600 to-blue-400',
    orange: 'from-orange-600 to-orange-400',
    red: 'from-red-600 to-red-400',
  };
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colors[color]} opacity-10 rounded-full -mr-8 -mt-8`} />
      <p className="text-3xl mb-3">{icon}</p>
      <p className="text-4xl font-black text-white">{value}</p>
      <p className="text-gray-400 text-sm font-medium mt-1">{label}</p>
      {sub && <p className="text-gray-600 text-xs mt-1">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm">
        <p className="text-gray-400">{label}</p>
        <p className="text-white font-bold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function Overview() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get('/analytics').then(({ data }) => setData(data));
  }, []);

  if (!data) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500 animate-pulse">Loading overview...</p>
    </div>
  );

  const shiftChartData = Object.entries(data.shift_data).map(([k, v]) => ({ shift: k, count: v }));
  const machineChartData = Object.entries(data.machine_data).map(([k, v]) => ({ machine: k, qty: Math.round(v) }));

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Operations Overview</h1>
        <p className="text-gray-400 mt-1">Real-time analytics from all processed documents</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Documents" value={data.total_uploads} icon="📂" color="emerald" />
        <StatCard label="Verified" value={data.verified} icon="✅" color="blue" />
        <StatCard label="Pending Review" value={data.pending} icon="🕐" color="orange" />
        <StatCard label="Flagged Records" value={data.flagged_records} icon="🚩" color="red" />
      </div>

      {/* Total Quantity Banner */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/20 rounded-2xl p-6 mb-8 flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">Total Quantity Produced</p>
          <p className="text-5xl font-black text-white mt-1">
            {data.total_quantity.toLocaleString()}
            <span className="text-2xl text-gray-400 font-normal ml-2">units</span>
          </p>
        </div>
        <span className="text-6xl opacity-30">📦</span>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shift Chart */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-1">Records by Shift</h3>
          <p className="text-gray-500 text-xs mb-5">Number of records per shift</p>
          {shiftChartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-600">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={shiftChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="shift" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Machine Chart */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-1">Output by Machine</h3>
          <p className="text-gray-500 text-xs mb-5">Total quantity produced per machine</p>
          {machineChartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-600">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={machineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="machine" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="qty" fill="#14b8a6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Failed Warning */}
      {data.failed > 0 && (
        <div className="mt-6 p-5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-4">
          <span className="text-3xl">❌</span>
          <div>
            <p className="text-red-400 font-bold">{data.failed} document(s) failed processing</p>
            <p className="text-red-500/70 text-sm mt-0.5">Re-upload the files or check your API configuration</p>
          </div>
        </div>
      )}
    </div>
  );
}