import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { LogIn, Sparkles, ShieldCheck, Zap, RefreshCw } from "lucide-react";

interface HomeProps {
  onLoginSuccess: (token: string) => void;
  isLoading?: boolean;
}

export const Home: React.FC<HomeProps> = ({ onLoginSuccess, isLoading }) => {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => onLoginSuccess(tokenResponse.access_token),
    scope: "https://www.googleapis.com/auth/drive.appdata",
  });

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-bg-mist text-secondary-navy">
      {/* Background Subtle Shapes */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-surface-sage rounded-full blur-[120px] -z-10 opacity-60"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tag-lavender rounded-full blur-[120px] -z-10 opacity-30"></div>

      <main className="max-w-4xl w-full text-center space-y-12">
        {/* Header Section */}
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-secondary-navy flex items-center justify-center shadow-xl">
              <Sparkles className="text-reward-amber" size={32} />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Focus without <span className="text-primary-teal">friction.</span>
          </h1>
          <p className="text-xl md:text-2xl text-neutral-slate max-w-2xl mx-auto font-light leading-relaxed">
            A productivity sanctuary designed for interest-based nervous systems. 
            Zero shame. Faster rewards. Private by design.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="card space-y-3">
            <ShieldCheck className="text-primary-teal" size={28} />
            <h3 className="text-lg font-bold">Private Storage</h3>
            <p className="text-sm text-neutral-slate">
              Your data lives in your hidden Google Drive folder. Invisible to everyone, including us.
            </p>
          </div>
          <div className="card space-y-3">
            <Zap className="text-accent-coral" size={28} />
            <h3 className="text-lg font-bold">Instant Rewards</h3>
            <p className="text-sm text-neutral-slate">
              Micro-interactions and visual pulses turn boring maintenance into satisfying progress.
            </p>
          </div>
          <div className="card space-y-3">
            <RefreshCw className="text-tag-lavender" size={28} />
            <h3 className="text-lg font-bold">Frictionless Re-entry</h3>
            <p className="text-sm text-neutral-slate">
              Missed a week? Don't sweat it. No streaks to break, just start where you are.
            </p>
          </div>
        </div>

        {/* Auth Section */}
        <div className="pt-8">
          <button
            onClick={() => login()}
            disabled={isLoading}
            className="btn-primary btn-accent px-12 py-5 text-xl shadow-2xl hover:scale-105 mx-auto"
          >
            {isLoading ? (
              <RefreshCw className="animate-spin" size={24} />
            ) : (
              <LogIn size={24} />
            )}
            {isLoading ? "Syncing your flow..." : "Sign in with Google"}
          </button>
          <p className="mt-6 text-sm text-neutral-slate font-medium">
             Requires minimal permissions for private app storage only.
          </p>
        </div>
      </main>

      <footer className="fixed bottom-8 text-sm text-neutral-slate opacity-60">
        Built for the differently wired. &copy; 2024 ADHD Flow
      </footer>
    </div>
  );
};