"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, XCircle, FileText, Download, Sparkles, Camera } from "lucide-react";

interface SampleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SampleGuideModal({ isOpen, onClose }: SampleGuideModalProps) {
  if (!isOpen) return null;

  const downloadSampleTemplate = (filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([
      `OFFICIAL STATE CIVIC DOCUMENT TEMPLATE\nDocument Type: ${filename}\nState Circle Office: Zone 4 Jurisdiction\nDate: 2026-08-01\nApplicant Name: [FULL LEGAL NAME]\nTax Identification: [TAX-ID-NUMBER]\n\nINSTRUCTIONS: Ensure all 4 corners are visible when scanning.`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${filename.toLowerCase().replace(/\s+/g, '_')}_template.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Document Upload Guidelines & Sample Hub</h3>
                <p className="text-xs text-slate-400">Ensure high Gemini AI confidence scoring (&gt;= 0.85 Auto-Pass)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Comparison Matrix Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* Valid Sample Box */}
            <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/40">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>VALID SCAN (🟢 Score &gt;= 0.85)</span>
                </span>
                <span className="text-[11px] text-slate-400">Auto-Pass Compliant</span>
              </div>

              {/* Sample Visual Mock */}
              <div className="h-44 bg-slate-950 rounded-lg border border-emerald-500/40 p-3 flex flex-col justify-between relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="w-20 h-2.5 bg-emerald-400/40 rounded" />
                    <div className="w-32 h-2 bg-slate-700 rounded" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center text-[10px] font-bold text-emerald-300">
                    SEAL
                  </div>
                </div>
                <div className="space-y-1.5 py-2">
                  <div className="w-full h-2 bg-slate-800 rounded" />
                  <div className="w-3/4 h-2 bg-slate-800 rounded" />
                  <div className="w-5/6 h-2 bg-slate-800 rounded" />
                </div>
                <div className="flex justify-between items-center text-[10px] text-emerald-400 font-mono">
                  <span>300 DPI • Crisp Lighting</span>
                  <span>4/4 Corners Visible</span>
                </div>
              </div>

              <ul className="text-xs text-slate-300 space-y-1.5">
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Even, natural lighting without harsh phone flash glare.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400">✓</span>
                  <span>All four document borders and seals clearly in frame.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Text printed or cleanly written in black or blue ink.</span>
                </li>
              </ul>
            </div>

            {/* Invalid Sample Box */}
            <div className="glass-panel p-4 rounded-xl border border-rose-500/30 bg-rose-950/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-rose-400 bg-rose-500/20 px-2.5 py-1 rounded-full border border-rose-500/40">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>INVALID SCAN (🔴 Score &lt; 0.60)</span>
                </span>
                <span className="text-[11px] text-slate-400">Triggers AI Flag</span>
              </div>

              {/* Sample Visual Mock */}
              <div className="h-44 bg-slate-950 rounded-lg border border-rose-500/40 p-3 flex flex-col justify-between relative overflow-hidden opacity-80">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none transform rotate-45 scale-150" />
                <div className="flex justify-between items-start opacity-40">
                  <div className="space-y-1">
                    <div className="w-20 h-2.5 bg-rose-400/40 rounded blur-[1px]" />
                    <div className="w-32 h-2 bg-slate-700 rounded blur-[1px]" />
                  </div>
                </div>
                <div className="space-y-1.5 py-2 opacity-30">
                  <div className="w-full h-2 bg-slate-800 rounded blur-[2px]" />
                  <div className="w-3/4 h-2 bg-slate-800 rounded blur-[2px]" />
                </div>
                <div className="flex justify-between items-center text-[10px] text-rose-400 font-mono">
                  <span>Flash Glare • Heavy Tilt</span>
                  <span>Cut-off Margins</span>
                </div>
              </div>

              <ul className="text-xs text-slate-300 space-y-1.5">
                <li className="flex items-center space-x-2">
                  <span className="text-rose-400">✗</span>
                  <span>Heavy camera flash reflecting on glossy document surface.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-rose-400">✗</span>
                  <span>Cropped corners, fingers obstructing tax ID numbers.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-rose-400">✗</span>
                  <span>Outdated photo mismatch compared to state identity record.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Downloadable Sample Templates */}
          <div className="border-t border-slate-800 pt-4">
            <h4 className="text-xs font-semibold text-slate-200 mb-3 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Download Official Blank Document Templates</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                "Income Certificate Template",
                "Property Tax Receipt Template",
                "Domicile Declaration Template"
              ].map((templateName, idx) => (
                <button
                  key={idx}
                  onClick={() => downloadSampleTemplate(templateName)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all text-left text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span className="text-slate-200 truncate font-medium">{templateName}</span>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
