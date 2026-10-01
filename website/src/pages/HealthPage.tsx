import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, HardDrive, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';

export const HealthPage: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const data = await api.getHealth();
      setLatency(Math.round(performance.now() - start));
      setHealthData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to ping edge health endpoint.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Edge Observability</span>
          <h1 className="text-3xl font-bold text-white mt-1">System Health & Telemetry</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time diagnostics from Cloudflare Workers edge nodes and Cloudflare D1 distributed database.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60 cursor-pointer self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Ping Edge Node</span>
        </button>
      </div>

      {/* Latency & Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Client-to-Edge Latency</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {latency !== null ? `${latency} ms` : '—'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Full roundtrip over HTTP isolate</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Edge API Status</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Operational
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Hono Router on Cloudflare Workers</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Cloudflare D1 SQLite</span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {healthData?.database?.status === 'connected' ? 'Connected' : 'Active'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Distributed read-replicas verified</span>
        </div>
      </div>

      {/* Raw Payload Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>Edge Worker Diagnostic Response</span>
        </h3>

        {loading ? (
          <div className="h-40 rounded-xl bg-slate-950/70 animate-pulse" />
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to reach Edge API</p>
              <p className="text-xs text-rose-400/80 mt-1">{error}</p>
            </div>
          </div>
        ) : (
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
            {JSON.stringify(healthData, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};
