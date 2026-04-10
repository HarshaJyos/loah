"use client";
import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useApp } from "../../context/AppContext";
import { Layout } from "../../components/Layout";
import { MiniPlayer } from "../../components/RoutinePlayer";
import { ViewState } from "../../types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { 
    accessToken, isInitialLoading, uiScale, setUiScale, syncStatus, 
    activeSession, togglePlay, nextStep, setActiveSession, logout
  } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isInitialLoading && !accessToken) {
      router.push("/");
    }
  }, [accessToken, isInitialLoading, router]);

  useEffect(() => {
    if (activeSession && !activeSession.isMinimized && pathname !== "/routine-player") {
      router.push("/routine-player");
    }
  }, [activeSession, pathname, router]);

  const currentView = pathname.split("/").pop() as ViewState || "dashboard";

  const handleViewChange = (view: ViewState) => {
    router.push(`/${view}`);
  };

  const renderMiniPlayer = () => {
    if (!activeSession || !activeSession.isMinimized || pathname === "/routine-player") return null;

    const currentStep = activeSession.routine.steps[activeSession.currentStepIndex];
    const timeLeft = currentStep.durationSeconds - activeSession.timeElapsed;

    return (
      <MiniPlayer
        routine={activeSession.routine}
        currentStep={currentStep}
        timeElapsed={activeSession.timeElapsed}
        isPlaying={activeSession.isPlaying}
        onTogglePlay={togglePlay}
        onNext={nextStep}
        onExpand={() => {
          setActiveSession({ ...activeSession, isMinimized: false });
          router.push("/routine-player");
        }}
        timeLeft={timeLeft}
        isOvertime={timeLeft < 0}
      />
    );
  };

  if (isInitialLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-bg-mist">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-teal border-t-transparent rounded-full animate-spin"></div>
          <p className="text-secondary-navy font-bold animate-pulse">Synchronizing Focus...</p>
        </div>
      </div>
    );
  }

  if (!accessToken) return null;

  return (
    <Layout
      currentView={currentView}
      onViewChange={handleViewChange}
      uiScale={uiScale}
      onScaleChange={setUiScale}
      syncStatus={syncStatus}
      miniPlayer={renderMiniPlayer()}
      onLogout={logout}
    >
      {children}
    </Layout>
  );
}
