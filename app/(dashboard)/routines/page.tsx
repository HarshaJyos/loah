"use client";

import { useApp } from "../../../context/AppContext";
import { RoutineModule } from "../../../components/RoutineModule";

export default function RoutinesPage() {
  const { 
    routines, habits, pausedRoutines, tasks,
    addRoutine, updateRoutine, deleteRoutine, startRoutine,
    resumeRoutine, discardPaused, archiveRoutine, unarchiveRoutine
  } = useApp();

  return (
    <RoutineModule 
      routines={routines}
      habits={habits}
      pausedRoutines={pausedRoutines}
      tasks={tasks}
      onAddRoutine={addRoutine}
      onUpdateRoutine={updateRoutine}
      onDeleteRoutine={deleteRoutine}
      onStartRoutine={startRoutine}
      onResumeRoutine={resumeRoutine}
      onDiscardPaused={discardPaused}
      onArchiveRoutine={archiveRoutine}
      onUnarchiveRoutine={unarchiveRoutine}
    />
  );
}
