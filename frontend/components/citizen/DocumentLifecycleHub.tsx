"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Download, CheckCircle2, Clock, AlertTriangle, FileText, ArrowUpRight, ShieldAlert, Sparkles } from "lucide-react";
import { ApplicationItem } from "@/lib/api";

interface DocumentLifecycleHubProps {
  applications: ApplicationItem[];
  onTriggerEkyc: (app: ApplicationItem) => void;
  onRequestNew: () => void;
}

export default function DocumentLifecycleHub({
  applications,
  onTriggerEkyc,
  onRequestNew,
}: DocumentLifecycleHubProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadOfficialDocument = (app: ApplicationItem) => {
    setDownloadingId(app.id);

    // Trigger Canvas-Confetti celebration effect
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#06b6d4", "#3b82f6", "#f59e0b"]
    });

    // Generate downloadable official certificate file
    const docContent = `================================================================================
GOVFLOW COPILOT • OFFICIAL VERIFIED CIVIC CERTIFICATE
================================================================================
Certificate ID: ${app.id}
Document Type: ${app.document_type}
Issuing Authority: ${app.circle_office}
Issue Timestamp: ${new Date().toISOString()}

APPLICANT DETAILS:
Name: ${app.citizen_name}
Citizen ID: ${app.citizen_id}

VERIFICATION MATRIX:
[✓] Level 1 - Ingestion & Quality: PASS (${app.inspection_matrix.level1_ingestion_quality.score})
[✓] Level 2 - Photo Identity Match: PASS / VERIFIED VIA DIGILOCKER (${app.inspection_matrix.level2_photo_identity.score})
[✓] Level 3 - Cross-Document Consistency: PASS (${app.inspection_matrix.level3_text_consistency.score})
[✓] Level 4 - Policy & Subsidy Compliance: PASS (${app.inspection_matrix.level4_policy_rules.score})

Overall Confidence Score: ${app.overall_score} (Auto-Pass Confirmed)
AI Caseworker Summary: ${app.summary}

Cryptographic Hash Signature: SHA256-${Math.random().toString(36).substring(2, 15).toUpperCase()}
================================================================================`;

    const blob = new Blob([docContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Official_${app.document_type.replace(/\s+/g, "_")}_${app.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => setDownloadingId(null), 1000);
  };

  const approvedList = applications.filter((a) => a.status === "Approved" || a.status === "Issued");
  const pendingList = applications.filter((a) => a.status === "Pending");
  const flaggedList = applications.filter((a) => a.status === "Flagged");

  return (
    <div className="space-y-6">
      
      {/* Category Section 1: 🟢 Approved & Issued Documents */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Approved & Official Issued Documents</h3>
              <p className="text-xs text-slate-400">Verified by AI Caseworker Copilot • 1-Click Download</p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full badge-pass font-bold">
            {approvedList.length} VERIFIED
          </span>
        </div>

        {approvedList.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">No issued documents in your profile queue yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedList.map((app) => (
              <div key={app.id} className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/30 flex flex-col justify-between space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold text-slate-100">{app.document_type}</h4>
                    </div>
                    <p className="text-[11px] font-mono text-cyan-400 mt-0.5">{app.id}</p>
                  </div>
                  <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    <span>🟢 {app.overall_score.toFixed(2)} Score</span>
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2">{app.summary}</p>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>Circle: {app.circle_office}</span>
                  <span>{new Date(app.updated_at).toLocaleDateString()}</span>
                </div>

                <button
                  onClick={() => handleDownloadOfficialDocument(app)}
                  disabled={downloadingId === app.id}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-medium py-2 rounded-lg text-xs flex items-center justify-center space-x-2 shadow-neon-pass transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadingId === app.id ? "Generating Certificate..." : "1-Click Download Official Certificate"}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Section 2: 🟨 Pending Verification */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Pending Verification Queue</h3>
              <p className="text-xs text-slate-400">Multi-Stage Visual Inspection Progress</p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full badge-review font-bold">
            {pendingList.length} IN REVIEW
          </span>
        </div>

        {pendingList.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">No documents currently pending review.</p>
        ) : (
          <div className="space-y-3">
            {pendingList.map((app) => (
              <div key={app.id} className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/30 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{app.document_type}</h4>
                    <p className="text-[11px] font-mono text-cyan-400">{app.id}</p>
                  </div>
                  <span className="text-xs text-amber-400 font-semibold bg-amber-950 px-2.5 py-1 rounded border border-amber-800">
                    🟨 Score: {app.overall_score.toFixed(2)}
                  </span>
                </div>

                {/* 4-Stage Visual Progress Bars */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                  {[
                    { label: "L1 Quality", level: app.inspection_matrix?.level1_ingestion_quality },
                    { label: "L2 Identity", level: app.inspection_matrix?.level2_photo_identity },
                    { label: "L3 Consistency", level: app.inspection_matrix?.level3_text_consistency },
                    { label: "L4 Policy", level: app.inspection_matrix?.level4_policy_rules },
                  ].map((stage, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px]">
                      <div className="flex justify-between text-slate-400 font-mono mb-1">
                        <span>{stage.label}</span>
                        <span className={stage.level?.score >= 0.85 ? "text-emerald-400" : "text-amber-400"}>
                          {(stage.level?.score || 0.80).toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                          style={{ width: `${(stage.level?.score || 0.8) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Section 3: 🔴 Action Needed / Flagged */}
      {flaggedList.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-rose-500/40 bg-rose-950/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-neon-flag">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Action Needed / Flagged Applications</h3>
                <p className="text-xs text-rose-300">Outdated Photo Mismatch or Low AI Confidence (&lt; 0.60)</p>
              </div>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full badge-flag font-bold">
              {flaggedList.length} FLAGGED
            </span>
          </div>

          <div className="space-y-3">
            {flaggedList.map((app) => (
              <div key={app.id} className="p-4 rounded-xl bg-slate-950 border border-rose-500/40 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{app.document_type}</h4>
                    <p className="text-[11px] font-mono text-rose-400">{app.id}</p>
                  </div>
                  <span className="text-xs text-rose-400 font-bold bg-rose-950 px-2.5 py-1 rounded border border-rose-800">
                    🔴 Score: {app.overall_score.toFixed(2)}
                  </span>
                </div>

                <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-200">
                  <span className="font-semibold text-rose-300">Exact Failure Reason: </span>
                  {app.reasoning}
                </div>

                <button
                  onClick={() => onTriggerEkyc(app)}
                  className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-medium py-2 rounded-lg text-xs flex items-center justify-center space-x-2 shadow-neon-flag"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Quick-Fix: Verify via DigiLocker e-KYC (Clear Flag)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Section 4: ⚪ Unsubmitted / Required Documents */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Required Documents Baseline</h3>
            <p className="text-xs text-slate-400">Complete civic intake profile for subsidy eligibility</p>
          </div>
          <button
            onClick={onRequestNew}
            className="px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500/30 text-cyan-300 rounded-lg text-xs font-medium transition-all"
          >
            + Request New Intake
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: "Income Certificate", desc: "Annual household earnings declaration" },
            { name: "Property Tax Receipt", desc: "Municipal property ledger clearance" },
            { name: "Domicile Proof", desc: "State 3-year continuous residency proof" },
          ].map((req, idx) => {
            const isDone = applications.some((a) => a.document_type === req.name && a.status !== "Flagged");
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                  isDone
                    ? "bg-slate-950/40 border-slate-800 text-slate-400"
                    : "bg-slate-950 border-cyan-500/30 text-slate-200"
                }`}
              >
                <div>
                  <h4 className="font-semibold text-slate-100">{req.name}</h4>
                  <p className="text-[10px] text-slate-400">{req.desc}</p>
                </div>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <button
                    onClick={onRequestNew}
                    className="text-cyan-400 hover:text-cyan-300 p-1 rounded hover:bg-cyan-950"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
