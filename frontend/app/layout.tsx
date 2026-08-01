import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GovFlow Copilot | Next-Gen Civic Document Intake & AI Caseworker Copilot",
  description: "Enterprise-grade civic document intake platform with Gemini 1.5 Flash vision extraction, PII scrubbing, 4-Level Inspection Matrix, DigiLocker e-KYC fallback, and official caseworker workspace.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070a12] text-slate-100 min-h-screen antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
