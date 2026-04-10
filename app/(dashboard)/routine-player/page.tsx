"use client";

import { useApp } from "../../../context/AppContext";
import { RoutinePlayer } from "../../../components/RoutinePlayer";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RoutinePlayerPage() {
  const { 
    activeSession, tasks, habits,
    updateSessionTime, nextStep, togglePlay, minimizeSession, exitSession, saveSession,
    updateRoutine // need for reorder if we want to allow it?
  } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!activeSession) {
      router.push("/");
    }
  }, [activeSession, router]);

  if (!activeSession) return null;

  return (
    <RoutinePlayer 
      routine={activeSession.routine}
      steps={activeSession.routine.steps}
      currentStepIndex={activeSession.currentStepIndex}
      timeElapsed={activeSession.timeElapsed}
      isPlaying={activeSession.isPlaying}
      tasks={tasks}
      habits={habits}
      onTogglePlay={togglePlay}
      onStepComplete={nextStep}
      onStepsReorder={() => {}} // TODO: implement in AppContext if needed
      onMinimize={() => {
        minimizeSession();
        router.push("/");
      }}
      onExit={exitSession}
      onSave={saveSession}
      onToggleSubtask={() => {}}
      onAdjustTime={updateSessionTime}
    />
  );
}
