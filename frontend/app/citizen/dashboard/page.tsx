"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck, UserCheck, FileText, CheckCircle2, Clock, AlertTriangle,
  Upload, HelpCircle, LogOut, ArrowRight, Activity, Sparkles, Building2
} from "lucide-react";
import { fetchApplications, ApplicationItem, UserProfile } from "@/lib/api";
import IntakeWorkflow from "@/components/citizen/IntakeWorkflow";
import DocumentLifecycleHub from "@/components/citizen/DocumentLifecycleHub";
import EkycModal from "@/components/citizen/EkycModal";
import SampleGuideModal from "@/components/citizen/SampleGuideModal";

export default function CitizenDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isEkycOpen, setIsEkycOpen] = useState(false);
  const [selectedEkycApp, setSelectedEkycApp] = useState<ApplicationItem | null>(null);
  const [isSampleGuideOpen, setIsSampleGuideOpen] = useState(false);

  // Active Tab
  const [activeSubTab, setActiveSubTab] = useState<"intake" | "lifecycle">("lifecycle");

  useEffect(() => {
    const stored = localStorage.getItem("govflow_user");
    if (!stored) {
      router.push("/auth");
      return;
    }
    const u: UserProfile = JSON.parse(stored);
    setUser(u);
    loadUserApplications(u.circle_office);
  }, [router]);

  const loadUserApplications = async (circleOffice: string) => {
    setLoading(true);
    const data = await fetchApplications(circleOffice);
    setApplications(data);
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("govflow_user");
    router.push("/auth");
  };

  const triggerEkycForApp = (app: ApplicationItem) => {
    setSelectedEkycApp(app);
    setIsEkycOpen(true);
  };

  const handleApplicationUploaded = (newApp: ApplicationItem) => {
    setApplications((prev) => [newApp, ...prev]);
    if (newApp.requires_ekyc || newApp.badge === "red") {
      triggerEkycForApp(newApp);
    } else {
      setActiveSubTab("lifecycle");
    }
  };

  // KPI Metrics Calculation
  const totalUploaded = applications.length;
  const pendingCount = applications.filter((a) => a.status === "Pending").length;
  const approvedCount = applications.filter((a) => a.status === "Approved" || a.status === "Issued").length;
  const flaggedCount = applications.filter((a) => a.status === "Flagged").length;

  const healthScore = totalUploaded > 0
    ? Math.round(((approvedCount * 100) + (pendingCount * 70)) / totalUploaded)
    : 100;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30">
      
      {/* Header */}
      <header className="p-4 md:px-8 border-b border-slate-800/60 backdrop-blur-md sticky top-0 z-30 bg-[#070a12]/90 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 p-[1px]">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center space-x-2">
              <span>GovFlow Citizen Self-Service</span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                ZONE PORTAL
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Jurisdiction: {user.circle_office}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs text-cyan-400 font-medium transition-all shadow-inner"
            title="Return to Auth Portal to switch role to Caseworker"
          >
            <ArrowRight className="w-4 h-4 rotate-180 text-cyan-400" />
            <span>Back to Auth Portal</span>
          </button>

          <button
            onClick={() => setIsSampleGuideOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 transition-all"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Upload Rules & Samples</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-xs text-slate-400 hover:text-rose-300 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
        
        {/* Citizen Profile & Overview Hero Panel */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left: Profile Info */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center font-bold text-slate-950 text-lg shadow-neon-cyan">
                  {user.full_name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight">{user.full_name}</h2>
                  <p className="text-xs text-slate-400 font-mono">ID: {user.id} • {user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300 pt-2">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span className="truncate">{user.circle_office}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Profile Health Status: <strong className="text-emerald-400">{healthScore}% Optimal</strong></span>
                </div>
              </div>
            </div>

            {/* Right: Top KPI Stat Cards */}
            <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
              <div className="glass-panel p-3.5 rounded-xl border border-slate-800 text-center space-y-1">
                <p className="text-[11px] text-slate-400 font-medium">Uploaded</p>
                <p className="text-2xl font-extrabold text-white">{totalUploaded}</p>
              </div>
              <div className="glass-panel p-3.5 rounded-xl border border-amber-500/30 text-center space-y-1">
                <p className="text-[11px] text-amber-400 font-medium">Pending Review</p>
                <p className="text-2xl font-extrabold text-amber-300">{pendingCount}</p>
              </div>
              <div className="glass-panel p-3.5 rounded-xl border border-emerald-500/30 text-center space-y-1">
                <p className="text-[11px] text-emerald-400 font-medium">Approved & Issued</p>
                <p className="text-2xl font-extrabold text-emerald-300">{approvedCount}</p>
              </div>
              <div className="glass-panel p-3.5 rounded-xl border border-rose-500/30 text-center space-y-1">
                <p className="text-[11px] text-rose-400 font-medium">Action Needed</p>
                <p className="text-2xl font-extrabold text-rose-300">{flaggedCount}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveSubTab("lifecycle")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeSubTab === "lifecycle"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Document Lifecycle Hub ({applications.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("intake")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
              activeSubTab === "intake"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-neon-cyan"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Request New Document Intake</span>
          </button>
        </div>

        {/* Sub-Tab Content Views */}
        {activeSubTab === "intake" ? (
          <IntakeWorkflow
            citizenId={user.id}
            citizenName={user.full_name}
            circleOffice={user.circle_office}
            onApplicationUploaded={handleApplicationUploaded}
            onTriggerEkyc={triggerEkycForApp}
          />
        ) : (
          <DocumentLifecycleHub
            applications={applications}
            onTriggerEkyc={triggerEkycForApp}
            onRequestNew={() => setActiveSubTab("intake")}
          />
        )}

      </main>

      {/* Modals */}
      {selectedEkycApp && (
        <EkycModal
          isOpen={isEkycOpen}
          onClose={() => setIsEkycOpen(false)}
          applicationId={selectedEkycApp.id}
          citizenName={selectedEkycApp.citizen_name}
          nationalId="1234-5678-9041"
          onSuccess={() => loadUserApplications(user.circle_office)}
        />
      )}

      <SampleGuideModal
        isOpen={isSampleGuideOpen}
        onClose={() => setIsSampleGuideOpen(false)}
      />

      {/* Footer */}
      <footer className="p-4 border-t border-slate-800/60 backdrop-blur-md text-center text-xs text-slate-500">
        GovFlow Copilot Citizen Self-Service Engine • Circle Office {user.circle_office}
      </footer>
    </div>
  );
}
