"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, CheckCircle2, AlertTriangle, X, RefreshCw, KeyRound } from "lucide-react";
import { verifyEkycApi } from "@/lib/api";

interface EkycModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  citizenName: string;
  nationalId: string;
  onSuccess: () => void;
}

export default function EkycModal({
  isOpen,
  onClose,
  applicationId,
  citizenName,
  nationalId,
  onSuccess,
}: EkycModalProps) {
  const [step, setStep] = useState<"otp" | "verifying" | "success">("otp");
  const [otp, setOtp] = useState("892014");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStep("verifying");

    setTimeout(async () => {
      await verifyEkycApi(applicationId, otp, nationalId);
      setStep("success");
      setLoading(false);
    }, 1500);
  };

  const handleDone = () => {
    onSuccess();
    onClose();
    setStep("otp");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Top Banner */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">DigiLocker e-KYC Verification</h3>
                <p className="text-xs text-slate-400">Overriding Photo Mismatch Flag</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === "otp" && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
                <span>
                  Your uploaded document image was flagged due to an outdated photo mismatch. Verify your demographic identity via DigiLocker OTP to clear Level 2 Identity flag.
                </span>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Application Reference:</span>
                  <span className="font-mono text-cyan-400 font-semibold">{applicationId}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Citizen Name:</span>
                  <span className="text-slate-200">{citizenName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">National Identity ID:</span>
                  <span className="font-mono text-slate-200">{nationalId}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Enter 6-Digit DigiLocker OTP Sent to Registered Mobile
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2.5 text-sm font-mono tracking-widest text-center text-cyan-300 focus:outline-none"
                    placeholder="892014"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-medium py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-neon-cyan"
              >
                <Lock className="w-4 h-4" />
                <span>Submit OTP & Clear Identity Flag</span>
              </button>
            </form>
          )}

          {step === "verifying" && (
            <div className="py-12 text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Validating DigiLocker Cryptographic Proof...</h4>
                <p className="text-xs text-slate-400">Matching demographic records with State ID Registry</p>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 mx-auto shadow-neon-pass">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-100">Identity Flag Cleared!</h4>
                <p className="text-xs text-emerald-400 font-medium">Level 2 Identity status updated to "Verified via DigiLocker".</p>
                <p className="text-xs text-slate-400 mt-1">Application confidence score updated to 🟢 0.95 (Auto-Pass ready for caseworker issuance).</p>
              </div>

              <button
                onClick={handleDone}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-medium py-2.5 rounded-xl text-xs shadow-neon-pass"
              >
                Return to Dashboard Hub
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
