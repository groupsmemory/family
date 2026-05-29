'use client';

import { useState } from 'react';
import { fetchRoutingMetrics } from './actions';
import { Activity, ShieldCheck, MapPin, Server } from 'lucide-react';

export default function PksMetrics() {
  const [queryId, setQueryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setData(null);

    try {
      const result = await fetchRoutingMetrics({ queryId });
      if (!result.success) {
        setError(result.error || 'Failed to fetch metrics.');
      } else {
        setData(result);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 p-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-lg space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-xl mb-2 text-blue-400">
            <Server className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Route Diagnostics</h1>
          <p className="text-neutral-400 text-sm">
            Fetch ground-truth routing metrics. System protected by Upstash Redis edge rate-limiting.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="queryId" className="text-sm font-medium text-neutral-300">
                Diagnostic Query ID
              </label>
              <input
                id="queryId"
                type="text"
                value={queryId}
                onChange={(e) => setQueryId(e.target.value)}
                placeholder="Enter trace sequence..."
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-neutral-100 placeholder:text-neutral-600 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !queryId.trim()}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <span>Fetch Metrics</span>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-start space-x-3">
              <span className="shrink-0 mt-0.5 font-bold">!</span>
              <p>{error}</p>
            </div>
          )}

          {data && data.metrics && (
            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center space-x-2 text-sm text-neutral-400 pb-2 border-b border-neutral-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Validated Request from IP: <span className="font-mono text-neutral-300">{data.ip}</span></span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/50 space-y-1">
                  <div className="flex items-center text-xs text-neutral-500 uppercase tracking-wider font-semibold">
                    <MapPin className="w-3 h-3 mr-1.5" /> Node
                  </div>
                  <div className="text-lg font-medium text-neutral-100">{data.metrics.name}</div>
                </div>
                
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/50 space-y-1">
                  <div className="flex items-center text-xs text-neutral-500 uppercase tracking-wider font-semibold">
                    State
                  </div>
                  <div className="text-lg font-medium text-emerald-400 flex items-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
                    {data.metrics.status}
                  </div>
                </div>

                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/50 space-y-1">
                  <div className="flex items-center text-xs text-neutral-500 uppercase tracking-wider font-semibold">
                    Latency
                  </div>
                  <div className="text-lg font-mono text-neutral-100">{data.metrics.latencyOvh}</div>
                </div>

                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/50 space-y-1">
                  <div className="flex items-center text-xs text-neutral-500 uppercase tracking-wider font-semibold">
                    Bandwidth
                  </div>
                  <div className="text-lg font-mono text-neutral-100">{data.metrics.bandwidthCapacity}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
