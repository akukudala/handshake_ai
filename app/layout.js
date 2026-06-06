import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Handshake AI — Prospecting Portal",
  description:
    "AI-assisted sales prospecting: find leads, book meetings, run AI voice calls, and auto-generate meeting prep.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b border-slate-200">
          <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid place-items-center h-9 w-9 rounded-xl bg-brand-600 text-white font-bold">
                H
              </span>
              <div className="leading-tight">
                <div className="font-bold text-slate-900">Handshake AI</div>
                <div className="text-[11px] text-slate-500 -mt-0.5">
                  Prospecting Portal
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <div className="text-right leading-tight hidden sm:block">
                <div className="text-sm font-semibold text-slate-800">
                  Alex Carter
                </div>
                <div className="text-[11px] text-slate-500">
                  SF Bay Area · Sales Rep
                </div>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white grid place-items-center text-sm font-bold">
                AC
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-7">{children}</main>
        <footer className="mx-auto max-w-6xl px-5 py-8 text-center text-xs text-slate-400">
          Handshake AI · Hackathon MVP · Voice by ElevenLabs · Prep by Claude/OpenAI
        </footer>
      </body>
    </html>
  );
}
