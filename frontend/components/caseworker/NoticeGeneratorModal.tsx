"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MessageSquare, X, Send, Copy, Check, Sparkles } from "lucide-react";
import { generateNoticeApi, ApplicationItem } from "@/lib/api";

interface NoticeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ApplicationItem;
}

export default function NoticeGeneratorModal({
  isOpen,
  onClose,
  application,
}: NoticeGeneratorModalProps) {
  const [noticeType, setNoticeType] = useState<"Email" | "SMS">("Email");
  const [customInstructions, setCustomInstructions] = useState("");
  const [generatedNotice, setGeneratedNotice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (isOpen && application) {
      loadNotice();
    }
  }, [isOpen, application, noticeType]);

  const loadNotice = async () => {
    setLoading(true);
    const data = await generateNoticeApi(application.id, noticeType, customInstructions);
    setGeneratedNotice(data);
    setLoading(false);
  };

  if (!isOpen || !application) return null;

  const handleCopy = () => {
    const textToCopy = noticeType === "Email" ? generatedNotice?.notice_text : generatedNotice?.sms_text;
    navigator.clipboard.writeText(textToCopy || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendNotice = () => {
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">AI Citizen Notice Generator</h3>
                <p className="text-xs text-slate-400">Pre-drafted Email & SMS for Ref: {application.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Format Switcher */}
          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={() => setNoticeType("Email")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                noticeType === "Email"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan"
                  : "text-slate-400 hover:text-slate-200 bg-slate-950"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Official Email Notice</span>
            </button>

            <button
              onClick={() => setNoticeType("SMS")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                noticeType === "SMS"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan"
                  : "text-slate-400 hover:text-slate-200 bg-slate-950"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>SMS Dispatch Alert</span>
            </button>
          </div>

          {/* Custom Caseworker Guidance Input */}
          <div className="space-y-3 mb-4">
            <label className="block text-xs font-medium text-slate-300">
              Optional Caseworker Custom Note / Corrective Instructions
            </label>
            <input
              type="text"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g. Please re-upload document with clear lighting or complete e-KYC."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
            />
          </div>

          {/* Pre-Drafted Notice Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 mb-6 font-mono text-xs text-slate-300 relative">
            {loading ? (
              <div className="py-12 text-center text-slate-500 italic">Synthesizing notice text with AI...</div>
            ) : noticeType === "Email" ? (
              <div className="space-y-2 whitespace-pre-wrap leading-relaxed">
                <div className="text-cyan-400 font-semibold border-b border-slate-800 pb-2">
                  Subject: {generatedNotice?.subject}
                </div>
                <div className="text-slate-300 pt-1">
                  {generatedNotice?.notice_text}
                </div>
              </div>
            ) : (
              <div className="text-emerald-400 whitespace-pre-wrap">
                {generatedNotice?.sms_text}
              </div>
            )}
          </div>

          {/* Action Footer Buttons */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-200 flex items-center space-x-2 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? "Copied!" : "Copy Text"}</span>
            </button>

            <button
              onClick={handleSendNotice}
              disabled={sent}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-medium text-xs flex items-center space-x-2 shadow-neon-cyan transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{sent ? "Notice Sent to Citizen!" : `Dispatch Notice via ${noticeType}`}</span>
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
