"use client";

import { useState } from "react";
import { ShieldCheck, Building2, UserCheck, Activity, BarChart2, LogOut, FileText, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { UserProfile, ApplicationItem } from "@/lib/api";

interface OfficialHeaderProps {
  user: UserProfile;
  applications: ApplicationItem[];
  onLogout: () => void;
  onNavigateAudit: () => void;
}

export default function OfficialHeader({
  user,
  applications,
  onLogout,
  onNavigateAudit,
}: OfficialHeaderProps) {
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Filter applications by caseworker's assigned jurisdiction
  const regionalApps = applications.filter((a) => a.circle_office === user.circle_office);
  
  const totalReceived = regionalApps.length;
  const pendingReview = regionalApps.filter((a) => a.status === "Pending").length;
  const autoApproved = regionalApps.filter((a) => (a.status === "Approved" || a.status === "Issued") && a.overall_score >= 0.85).length;
  const flaggedCount = regionalApps.filter((a) => a.status === "Flagged" || a.overall_score < 0.60).length;

  const chartData = [
    { name: "Total Intake", count: totalReceived, color: "#06b6d4" },
    { name: "Pending", count: pendingReview, color: "#f59e0b" },
    { name: "Auto-Approved", count: autoApproved, color: "#10b981" },
    { name: "Flagged", count: flaggedCount, color: "#f43f5e" },
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6 relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] shadow-neon-pass">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-extrabold text-white tracking-tight">{user.full_name}</h2>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                OFFICIAL CASEWORKER
              </span>
            </div>
            <p className="text-xs text-slate-400">
              ID: {user.details?.employee_id || user.id} • Dept: {user.details?.department || "Civic Revenue"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center space-x-2">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Jurisdiction: <strong className="text-white">{user.circle_office}</strong></span>
          </div>

          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-200 flex items-center space-x-1.5 transition-all"
          >
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <span>Analytics</span>
          </button>

          <button
            onClick={onNavigateAudit}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs text-slate-200 flex items-center space-x-1.5 transition-all"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Compliance Audit Logs</span>
          </button>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Top KPI Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
          <p className="text-[11px] text-slate-400 font-medium">Regional Submissions Received</p>
          <p className="text-2xl font-extrabold text-white font-mono">{totalReceived}</p>
          <p className="text-[10px] text-slate-500">Filtered by {user.circle_office}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-500/30 space-y-1">
          <p className="text-[11px] text-amber-400 font-medium">Pending Caseworker Review</p>
          <p className="text-2xl font-extrabold text-amber-300 font-mono">{pendingReview}</p>
          <p className="text-[10px] text-amber-500/80">Requires manual sign-off</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/30 space-y-1">
          <p className="text-[11px] text-emerald-400 font-medium">Auto-Pass Compliant (&gt;= 0.85)</p>
          <p className="text-2xl font-extrabold text-emerald-300 font-mono">{autoApproved}</p>
          <p className="text-[10px] text-emerald-500/80">Ready for 1-click issuance</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-500/30 space-y-1">
          <p className="text-[11px] text-rose-400 font-medium">Flagged for Discrepancy</p>
          <p className="text-2xl font-extrabold text-rose-300 font-mono">{flaggedCount}</p>
          <p className="text-[10px] text-rose-500/80">Photo or identity mismatch</p>
        </div>
      </div>

      {/* Recharts Analytics Drawer */}
      {showAnalytics && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 pt-4">
          <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <span>Circle Office Intake & Caseworker Throughput Analytics ({user.circle_office})</span>
          </h4>
          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
