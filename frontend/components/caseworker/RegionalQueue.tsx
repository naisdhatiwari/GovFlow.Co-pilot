"use client";

import { useState } from "react";
import { Search, Filter, CheckCircle2, Clock, AlertTriangle, ShieldAlert, ArrowRight, Sparkles } from "lucide-react";
import { ApplicationItem } from "@/lib/api";

interface RegionalQueueProps {
  applications: ApplicationItem[];
  selectedAppId: string | null;
  onSelectApp: (app: ApplicationItem) => void;
  circleOffice: string;
}

export default function RegionalQueue({
  applications,
  selectedAppId,
  onSelectApp,
  circleOffice,
}: RegionalQueueProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [docFilter, setDocFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Filter queue items specifically for caseworker's assigned jurisdiction area
  const regionalApps = applications.filter((a) => a.circle_office === circleOffice);

  const filteredApps = regionalApps.filter((app) => {
    const matchesSearch =
      app.citizen_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.document_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDoc = docFilter === "ALL" || app.document_type === docFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "GREEN" && app.badge === "green") ||
      (statusFilter === "YELLOW" && app.badge === "yellow") ||
      (statusFilter === "RED" && (app.badge === "red" || app.status === "Flagged"));

    return matchesSearch && matchesDoc && matchesStatus;
  });

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <span>Circle Office Regional Queue</span>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded-full">
              {filteredApps.length} Applications
            </span>
          </h3>
          <p className="text-xs text-slate-400">Applications originating strictly from {circleOffice}</p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Citizen / App ID..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none"
            />
          </div>

          {/* Doc Type Filter */}
          <select
            value={docFilter}
            onChange={(e) => setDocFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Doc Types</option>
            <option value="Income Certificate">Income Certificate</option>
            <option value="Property Tax Receipt">Property Tax Receipt</option>
            <option value="Domicile Proof">Domicile Proof</option>
            <option value="Driver's License">Driver's License</option>
          </select>

          {/* Status Badge Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Flag Statuses</option>
            <option value="GREEN">🟢 Auto-Pass (&gt;= 0.85)</option>
            <option value="YELLOW">🟨 Review (0.60-0.84)</option>
            <option value="RED">🔴 Flagged (&lt; 0.60)</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-[11px]">
              <th className="p-3">Ref App ID</th>
              <th className="p-3">Citizen Applicant</th>
              <th className="p-3">Document Type</th>
              <th className="p-3">Confidence Score</th>
              <th className="p-3">Inspection Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                  No regional applications match your query.
                </td>
              </tr>
            ) : (
              filteredApps.map((app) => {
                const isSelected = selectedAppId === app.id;
                return (
                  <tr
                    key={app.id}
                    onClick={() => onSelectApp(app)}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? "bg-cyan-500/10 border-l-4 border-l-cyan-400"
                        : "hover:bg-slate-900/80"
                    }`}
                  >
                    <td className="p-3 font-mono font-semibold text-cyan-400">{app.id}</td>
                    <td className="p-3 font-medium text-slate-100">{app.citizen_name}</td>
                    <td className="p-3 text-slate-300">{app.document_type}</td>
                    
                    {/* Score & Badge */}
                    <td className="p-3">
                      {app.badge === "green" && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full badge-pass text-[11px] font-bold">
                          <span>🟢 {app.overall_score.toFixed(2)}</span>
                        </span>
                      )}
                      {app.badge === "yellow" && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full badge-review text-[11px] font-bold">
                          <span>🟨 {app.overall_score.toFixed(2)}</span>
                        </span>
                      )}
                      {app.badge === "red" && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full badge-flag text-[11px] font-bold">
                          <span>🔴 {app.overall_score.toFixed(2)}</span>
                        </span>
                      )}
                    </td>

                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded text-[11px] font-medium ${
                        app.status === "Issued" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" :
                        app.status === "Flagged" ? "bg-rose-950 text-rose-300 border border-rose-800" :
                        "bg-slate-900 text-slate-300 border border-slate-800"
                      }`}>
                        {app.status}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectApp(app);
                        }}
                        className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded-lg text-[11px] font-semibold transition-all inline-flex items-center space-x-1"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
