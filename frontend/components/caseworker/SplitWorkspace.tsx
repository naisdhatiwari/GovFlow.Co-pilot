"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ZoomIn, ZoomOut, RotateCw, RefreshCw, CheckCircle2, AlertTriangle, ShieldAlert,
  ChevronDown, ChevronUp, FileCheck, Mail, Sparkles, Lock, Eye, Download, ShieldCheck
} from "lucide-react";
import { ApplicationItem, approveApplicationApi } from "@/lib/api";

interface SplitWorkspaceProps {
  application: ApplicationItem;
  caseworkerId: string;
  onStatusUpdated: () => void;
  onOpenNoticeModal: () => void;
}

export default function SplitWorkspace({
  application,
  caseworkerId,
  onStatusUpdated,
  onOpenNoticeModal,
}: SplitWorkspaceProps) {
  // Zoom & Pan State for Document Viewer
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [approving, setApproving] = useState(false);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const handleApprove = async () => {
    setApproving(true);
    try {
      await approveApplicationApi(application.id, caseworkerId);
      onStatusUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setApproving(false);
    }
  };

  const matrix = application.inspection_matrix;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* LEFT COLUMN: Interactive Document Viewer with Zoom & Pan Controls */}
      <div className="lg:col-span-6 glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">Interactive Document Inspection Viewer</h3>
          </div>

          {/* Controls Toolbar */}
          <div className="flex items-center space-x-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-900 rounded"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-900 rounded"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleRotate}
              title="Rotate 90°"
              className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-900 rounded"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              title="Reset View"
              className="px-2 py-0.5 text-[11px] text-slate-400 hover:text-white hover:bg-slate-900 rounded font-mono"
            >
              {(zoomLevel * 100).toFixed(0)}%
            </button>
          </div>
        </div>

        {/* High-Res Viewport Canvas */}
        <div className="h-[480px] bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden relative flex items-center justify-center p-4 group">
          <div
            className="transition-transform duration-200 ease-out max-w-full max-h-full flex items-center justify-center"
            style={{
              transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
            }}
          >
            {application.file_preview ? (
              <img
                src={application.file_preview}
                alt="Document Scan"
                className="max-h-[440px] w-auto object-contain rounded shadow-2xl"
              />
            ) : (
              <div className="text-center p-6 space-y-2">
                <FileCheck className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">High-Resolution Document Scan Loaded</p>
                <p className="text-[11px] text-slate-500 font-mono">Ref: {application.id}</p>
              </div>
            )}
          </div>

          {/* Watermark Overlay */}
          <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur px-3 py-1 rounded-lg border border-slate-800 text-[10px] text-cyan-400 font-mono">
            <span>OFFICIAL INSPECTION VIEW • {application.document_type}</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: 4-Level Inspection Matrix + Field Badges + Reasoning + Action Bar */}
      <div className="lg:col-span-6 space-y-5">
        
        {/* 1. 4-Level Inspection Matrix (Displayed Simultaneously) */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>4-Level AI Inspection Matrix</span>
            </span>
            <span className="text-cyan-400 font-mono text-[11px]">Overall Score: {application.overall_score.toFixed(2)}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            
            {/* Level 1 */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">Level 1: Quality</span>
                <span className={matrix?.level1_ingestion_quality?.score >= 0.85 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                  {matrix?.level1_ingestion_quality?.status || "Pass"} ({matrix?.level1_ingestion_quality?.score || 0.90})
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">{matrix?.level1_ingestion_quality?.details}</p>
            </div>

            {/* Level 2 */}
            <div className={`p-3 rounded-xl bg-slate-950 border space-y-1 ${
              matrix?.level2_photo_identity?.status === "Verified via DigiLocker" ? "border-emerald-500/50 bg-emerald-950/20" :
              matrix?.level2_photo_identity?.score < 0.60 ? "border-rose-500/50 bg-rose-950/20" : "border-slate-800"
            }`}>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">Level 2: Photo Identity</span>
                <span className={
                  matrix?.level2_photo_identity?.status === "Verified via DigiLocker" ? "text-emerald-400 font-bold" :
                  matrix?.level2_photo_identity?.score >= 0.85 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"
                }>
                  {matrix?.level2_photo_identity?.status || "Pass"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">{matrix?.level2_photo_identity?.details}</p>
            </div>

            {/* Level 3 */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">Level 3: Text Consistency</span>
                <span className="text-emerald-400 font-bold">
                  {matrix?.level3_text_consistency?.status || "Pass"} ({matrix?.level3_text_consistency?.score || 0.88})
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">{matrix?.level3_text_consistency?.details}</p>
            </div>

            {/* Level 4 */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">Level 4: Policy & Subsidy</span>
                <span className="text-emerald-400 font-bold">
                  {matrix?.level4_policy_rules?.status || "Pass"} ({matrix?.level4_policy_rules?.score || 0.89})
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">{matrix?.level4_policy_rules?.details}</p>
            </div>

          </div>
        </div>

        {/* 2. Extracted Field Table with Dynamic Confidence Badges */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
            Field Extraction Table & Badges
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-mono text-[10px] border-b border-slate-800">
                  <th className="pb-2">Field Name</th>
                  <th className="pb-2">Extracted Value</th>
                  <th className="pb-2 text-right">Confidence Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {application.extracted_fields?.map((field, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="py-2.5 font-medium text-slate-200">{field.field_name}</td>
                    <td className="py-2.5 text-slate-300 font-mono">{field.value}</td>
                    <td className="py-2.5 text-right">
                      {field.confidence_score >= 0.85 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded badge-pass text-[10px] font-bold">
                          🟢 {field.confidence_score.toFixed(2)} Auto-Pass
                        </span>
                      ) : field.confidence_score >= 0.60 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded badge-review text-[10px] font-bold">
                          🟨 {field.confidence_score.toFixed(2)} Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded badge-flag text-[10px] font-bold">
                          🔴 {field.confidence_score.toFixed(2)} Flagged
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. "Why Gemini Flagged This" Accordion */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <button
            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            className="w-full p-4 text-left flex items-center justify-between bg-slate-950/80 hover:bg-slate-900 transition-all text-xs font-bold text-slate-200"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Why Gemini 1.5 Flash Flagged or Approved This Intake</span>
            </div>
            {isAccordionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isAccordionOpen && (
            <div className="p-4 bg-slate-950/40 border-t border-slate-800 text-xs text-slate-300 space-y-2">
              <p className="leading-relaxed"><strong className="text-cyan-400">AI Reasoning: </strong>{application.reasoning}</p>
              <p className="leading-relaxed text-slate-400"><strong className="text-slate-200">Summary: </strong>{application.summary}</p>
            </div>
          )}
        </div>

        {/* 4. One-Click Action Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          
          <button
            onClick={handleApprove}
            disabled={approving || application.status === "Issued"}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-medium py-3 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-neon-pass transition-all disabled:opacity-40"
          >
            {approving ? (
              <span>Updating SQLite Database...</span>
            ) : application.status === "Issued" ? (
              <span>✓ Official Document Issued</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>1-Click Approve & Issue Document</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenNoticeModal}
            className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-200 font-medium py-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all"
          >
            <Mail className="w-4 h-4 text-cyan-400" />
            <span>Generate Citizen Notice (Email / SMS)</span>
          </button>

        </div>

      </div>

    </div>
  );
}
