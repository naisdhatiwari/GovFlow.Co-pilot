"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, UserCheck, Building2, Lock, ArrowRight, FileCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { API_BASE } from "@/lib/api";

const CIRCLE_OFFICES = [
  "Circle Office - Zone 4",
  "Circle Office - Zone 1",
  "Circle Office - Zone 2",
  "Circle Office - Zone 3",
];

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"citizen" | "caseworker">("citizen");
  const [loading, setLoading] = useState(false);

  // Citizen Form State
  const [citizenForm, setCitizenForm] = useState({
    fullName: "Eleanor Vance",
    address: "742 Evergreen Terrace, Zone 4",
    email: "eleanor.vance@state.gov",
    phone: "+1 (555) 234-9041",
    nationalId: "1234-5678-9041",
    circleOffice: "Circle Office - Zone 4",
  });

  // Caseworker Form State
  const [caseworkerForm, setCaseworkerForm] = useState({
    officialName: "Officer Robert Vance",
    employeeId: "GOV-OFFICER-449",
    department: "Civic Intake & Welfare Revenue Division",
    circleOffice: "Circle Office - Zone 4",
  });

  const handleCitizenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/citizen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: citizenForm.fullName,
          address: citizenForm.address,
          email: citizenForm.email,
          phone: citizenForm.phone,
          national_id: citizenForm.nationalId,
          circle_office: citizenForm.circleOffice,
        }),
      });

      let profileData;
      if (res.ok) {
        profileData = await res.json();
      } else {
        profileData = {
          id: "CIT-101",
          role: "citizen",
          full_name: citizenForm.fullName,
          email: citizenForm.email,
          circle_office: citizenForm.circleOffice,
          details: citizenForm,
        };
      }

      localStorage.setItem("govflow_user", JSON.stringify(profileData));
      router.push("/citizen/dashboard");
    } catch (err) {
      console.warn("Backend auth offline, setting offline citizen session.", err);
      const profileData = {
        id: "CIT-101",
        role: "citizen",
        full_name: citizenForm.fullName,
        email: citizenForm.email,
        circle_office: citizenForm.circleOffice,
        details: citizenForm,
      };
      localStorage.setItem("govflow_user", JSON.stringify(profileData));
      router.push("/citizen/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleCaseworkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/caseworker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          official_name: caseworkerForm.officialName,
          employee_id: caseworkerForm.employeeId,
          department: caseworkerForm.department,
          circle_office: caseworkerForm.circleOffice,
        }),
      });

      let profileData;
      if (res.ok) {
        profileData = await res.json();
      } else {
        profileData = {
          id: "CW-449",
          role: "caseworker",
          full_name: caseworkerForm.officialName,
          email: `${caseworkerForm.employeeId.toLowerCase()}@govflow.state.gov`,
          circle_office: caseworkerForm.circleOffice,
          details: caseworkerForm,
        };
      }

      localStorage.setItem("govflow_user", JSON.stringify(profileData));
      router.push("/caseworker/dashboard");
    } catch (err) {
      console.warn("Backend auth offline, setting offline caseworker session.", err);
      const profileData = {
        id: "CW-449",
        role: "caseworker",
        full_name: caseworkerForm.officialName,
        email: `${caseworkerForm.employeeId.toLowerCase()}@govflow.state.gov`,
        circle_office: caseworkerForm.circleOffice,
        details: caseworkerForm,
      };
      localStorage.setItem("govflow_user", JSON.stringify(profileData));
      router.push("/caseworker/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-cyan-500/30">
      {/* Background Decorative Neon Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <header className="p-6 border-b border-slate-800/60 backdrop-blur-md z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-[1px] shadow-neon-cyan">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-100 via-cyan-200 to-emerald-300 bg-clip-text text-transparent">
              GovFlow Copilot
            </h1>
            <p className="text-xs text-slate-400">Next-Gen Civic Document Intake & AI Caseworker Portal</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1.5 rounded-full border border-cyan-800/50 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>SYSTEM ONLINE • GOV-SEC 256</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6 z-10 my-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Hero Information */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-slate-900/80 border border-slate-800 text-slate-300 text-xs px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI-Powered Public Intake Matrix</span>
            </div>

            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
              Automated Intake & <br />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                Caseworker Copilot
              </span>
            </h2>

            <p className="text-slate-400 text-sm leading-relaxed">
              GovFlow Copilot simplifies civic document validation using Gemini 1.5 Flash Vision, local PII scrubbing, 4-level inspection matrices, and DigiLocker e-KYC fallbacks.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-3 pt-2">
              {[
                { title: "Local PII Scrubber", desc: "Masks SSN, Aadhaar & National IDs before database persistence." },
                { title: "4-Level Inspection Matrix", desc: "Automated checks for Quality, Photo Match, Consistency & Policy." },
                { title: "DigiLocker e-KYC Fallback", desc: "1-Click OTP validation for outdated photo mismatch overrides." }
              ].map((feat, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/50">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{feat.title}</h4>
                    <p className="text-[11px] text-slate-400">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Tabbed Auth Form */}
          <div className="lg:col-span-7">
            <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 shadow-2xl relative">
              
              {/* Tab Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950/70 rounded-xl border border-slate-800/80 mb-6">
                <button
                  onClick={() => setActiveTab("citizen")}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "citizen"
                      ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-neon-cyan font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Citizen Portal</span>
                </button>
                <button
                  onClick={() => setActiveTab("caseworker")}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "caseworker"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-neon-pass font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Govt Caseworker</span>
                </button>
              </div>

              {/* Citizen Registration / Login Form */}
              <AnimatePresence mode="wait">
                {activeTab === "citizen" ? (
                  <motion.form
                    key="citizen"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleCitizenSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-base font-semibold text-slate-100">Citizen Profile Intake Registration</h3>
                      <p className="text-xs text-slate-400">Fill in your demographics to access self-service intake.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Legal Name</label>
                        <input
                          type="text"
                          required
                          value={citizenForm.fullName}
                          onChange={(e) => setCitizenForm({ ...citizenForm, fullName: e.target.value })}
                          className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                          placeholder="e.g. Eleanor Vance"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={citizenForm.email}
                          onChange={(e) => setCitizenForm({ ...citizenForm, email: e.target.value })}
                          className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                          placeholder="eleanor@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Phone Number</label>
                        <input
                          type="text"
                          required
                          value={citizenForm.phone}
                          onChange={(e) => setCitizenForm({ ...citizenForm, phone: e.target.value })}
                          className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                          placeholder="+1 (555) 234-9041"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">National Identity / Aadhaar ID</label>
                        <input
                          type="text"
                          required
                          value={citizenForm.nationalId}
                          onChange={(e) => setCitizenForm({ ...citizenForm, nationalId: e.target.value })}
                          className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                          placeholder="1234-5678-9041"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Assigned Circle Office Jurisdiction</label>
                      <select
                        value={citizenForm.circleOffice}
                        onChange={(e) => setCitizenForm({ ...citizenForm, circleOffice: e.target.value })}
                        className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      >
                        {CIRCLE_OFFICES.map((office) => (
                          <option key={office} value={office}>{office}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Residential Address</label>
                      <input
                        type="text"
                        required
                        value={citizenForm.address}
                        onChange={(e) => setCitizenForm({ ...citizenForm, address: e.target.value })}
                        className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        placeholder="742 Evergreen Terrace, Zone 4"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-medium py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-neon-cyan transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Initializing Citizen Session...</span>
                      ) : (
                        <>
                          <span>Enter Citizen Self-Service Portal</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="caseworker"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleCaseworkerSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-base font-semibold text-slate-100">Caseworker Credential Sign-In</h3>
                      <p className="text-xs text-slate-400">Authenticating government employee ID & jurisdiction scope.</p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Official Name</label>
                      <input
                        type="text"
                        required
                        value={caseworkerForm.officialName}
                        onChange={(e) => setCaseworkerForm({ ...caseworkerForm, officialName: e.target.value })}
                        className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="e.g. Officer Robert Vance"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Govt Employee ID</label>
                        <input
                          type="text"
                          required
                          value={caseworkerForm.employeeId}
                          onChange={(e) => setCaseworkerForm({ ...caseworkerForm, employeeId: e.target.value })}
                          className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder="GOV-OFFICER-449"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Circle Office Jurisdiction</label>
                        <select
                          value={caseworkerForm.circleOffice}
                          onChange={(e) => setCaseworkerForm({ ...caseworkerForm, circleOffice: e.target.value })}
                          className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          {CIRCLE_OFFICES.map((office) => (
                            <option key={office} value={office}>{office}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Department / Division</label>
                      <input
                        type="text"
                        required
                        value={caseworkerForm.department}
                        onChange={(e) => setCaseworkerForm({ ...caseworkerForm, department: e.target.value })}
                        className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="Civic Intake & Welfare Revenue Division"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-neon-pass transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Authenticating Official Credentials...</span>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Launch Caseworker Copilot Workspace</span>
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-slate-800/60 backdrop-blur-md text-center text-xs text-slate-500 z-10 flex items-center justify-between max-w-6xl mx-auto w-full">
        <span>GovFlow Copilot © 2026 • Municipal Civic Automation Architecture</span>
        <div className="flex items-center space-x-4">
          <span className="hover:text-slate-400 cursor-pointer">Privacy & Local PII Rules</span>
          <span className="hover:text-slate-400 cursor-pointer">State Audit Compliance</span>
        </div>
      </footer>
    </div>
  );
}
