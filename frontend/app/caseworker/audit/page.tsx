"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, FileText, Download, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, Building2 } from "lucide-react";
import { fetchAuditLogs, AuditLogItem, API_BASE } from "@/lib/api";

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const data = await fetchAuditLogs();
    setLogs(data);
    setLoading(false);
  };

  const handleExportCSV = () => {
    window.open(`${API_BASE}/api/audit-logs/export`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30">
      
      {/* Header */}
      <header className="p-4 md:px-8 border-b border-slate-800/60 backdrop-blur-md sticky top-0 z-30 bg-[#070a12]/90 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push("/caseworker/dashboard")}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center space-x-2">
              <span>GovFlow Compliance & Audit Trail</span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                SQLITE ARCHIVE
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Immutable civic record audit log across regional Circle Offices</p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-medium text-xs flex items-center space-x-2 shadow-neon-pass transition-all"
        >
          <Download className="w-4 h-4" />
          <span>1-Click Export Audit Log as CSV</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6">
        
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Historical Civic Intake Audit Ledger</h2>
                <p className="text-xs text-slate-400">Tracks Timestamps, Ref App IDs, DigiLocker e-KYC Usage & Caseworker Actions</p>
              </div>
            </div>

            <button
              onClick={loadLogs}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Audit Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono text-[11px]">
                  <th className="p-3">Audit Log ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Ref App ID</th>
                  <th className="p-3">Citizen Applicant</th>
                  <th className="p-3">Doc Type</th>
                  <th className="p-3">Circle Office</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">e-KYC Fallback</th>
                  <th className="p-3">Caseworker Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500 italic">
                      No compliance audit entries recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/60 transition-all text-[11px]">
                      <td className="p-3 font-bold text-cyan-400">{log.id}</td>
                      <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-3 font-bold text-slate-200">{log.application_id}</td>
                      <td className="p-3 font-sans text-slate-100 font-medium">{log.citizen_name}</td>
                      <td className="p-3 font-sans text-slate-300">{log.document_type}</td>
                      <td className="p-3 font-sans text-slate-400">{log.circle_office}</td>
                      
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-sans text-[10px] font-semibold ${
                          log.status === "Issued" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" :
                          log.status === "Flagged" ? "bg-rose-950 text-rose-300 border border-rose-800" :
                          "bg-slate-900 text-slate-300 border border-slate-800"
                        }`}>
                          {log.status}
                        </span>
                      </td>

                      <td className="p-3 font-sans">
                        {log.ekyc_used ? (
                          <span className="text-emerald-400 font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Yes (DigiLocker)</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">No</span>
                        )}
                      </td>

                      <td className="p-3 font-sans text-slate-300">{log.caseworker_action}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-slate-800/60 backdrop-blur-md text-center text-xs text-slate-500">
        GovFlow Copilot Audit Module • Immutable Regional Ledger
      </footer>
    </div>
  );
}
