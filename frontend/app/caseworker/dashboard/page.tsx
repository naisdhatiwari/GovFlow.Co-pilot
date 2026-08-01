"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Building2, Eye, FileText, Activity, ArrowRight } from "lucide-react";
import { fetchApplications, ApplicationItem, UserProfile } from "@/lib/api";
import OfficialHeader from "@/components/caseworker/OfficialHeader";
import RegionalQueue from "@/components/caseworker/RegionalQueue";
import SplitWorkspace from "@/components/caseworker/SplitWorkspace";
import NoticeGeneratorModal from "@/components/caseworker/NoticeGeneratorModal";

export default function CaseworkerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("govflow_user");
    if (!stored) {
      router.push("/auth");
      return;
    }
    const u: UserProfile = JSON.parse(stored);
    if (u.role !== "caseworker") {
      router.push("/citizen/dashboard");
      return;
    }
    setUser(u);
    loadRegionalQueue(u.circle_office);
  }, [router]);

  const loadRegionalQueue = async (circleOffice: string) => {
    setLoading(true);
    const data = await fetchApplications(circleOffice);
    setApplications(data);
    if (data.length > 0 && !selectedApp) {
      setSelectedApp(data[0]);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("govflow_user");
    router.push("/auth");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30">
      
      {/* Header Bar */}
      <header className="p-4 md:px-8 border-b border-slate-800/60 backdrop-blur-md sticky top-0 z-30 bg-[#070a12]/90 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px]">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center space-x-2">
              <span>GovFlow AI Caseworker Copilot</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                OFFICIAL WORKSPACE
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Jurisdiction Scope: {user.circle_office}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs text-cyan-400 font-medium transition-all flex items-center space-x-1.5"
            title="Return to Auth Portal to switch role to Citizen"
          >
            <ArrowRight className="w-4 h-4 rotate-180 text-cyan-400" />
            <span>Back to Auth Portal</span>
          </button>

          <button
            onClick={() => router.push("/caseworker/audit")}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs text-emerald-400 font-semibold transition-all flex items-center space-x-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Compliance Audit Logs</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
        
        {/* Official Scope Header & KPI Analytics Bar */}
        <OfficialHeader
          user={user}
          applications={applications}
          onLogout={handleLogout}
          onNavigateAudit={() => router.push("/caseworker/audit")}
        />

        {/* Split Screen Workspace Section */}
        {selectedApp ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Active Inspection Workspace: <strong className="text-cyan-400 font-mono">{selectedApp.id}</strong> ({selectedApp.citizen_name})</span>
              </h3>
            </div>

            <SplitWorkspace
              application={selectedApp}
              caseworkerId={user.details?.employee_id || user.id}
              onStatusUpdated={() => loadRegionalQueue(user.circle_office)}
              onOpenNoticeModal={() => setIsNoticeOpen(true)}
            />
          </div>
        ) : (
          <div className="glass-panel p-8 text-center text-slate-400 italic rounded-2xl">
            Select an application from the regional queue to inspect in split-screen mode.
          </div>
        )}

        {/* Regional Queue Data Table */}
        <RegionalQueue
          applications={applications}
          selectedAppId={selectedApp?.id || null}
          onSelectApp={(app) => setSelectedApp(app)}
          circleOffice={user.circle_office}
        />

      </main>

      {/* Citizen Notice Modal */}
      {selectedApp && (
        <NoticeGeneratorModal
          isOpen={isNoticeOpen}
          onClose={() => setIsNoticeOpen(false)}
          application={selectedApp}
        />
      )}

      {/* Footer */}
      <footer className="p-4 border-t border-slate-800/60 backdrop-blur-md text-center text-xs text-slate-500">
        GovFlow Copilot Caseworker Workspace • Jurisdiction Scope: {user.circle_office}
      </footer>
    </div>
  );
}
