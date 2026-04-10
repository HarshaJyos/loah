"use client";

import { useApp } from "../../../context/AppContext";
import { HabitModule } from "../../../components/HabitModule";

export default function HabitsPage() {
  const { 
    habits, addHabit, updateHabit, deleteHabit, 
    archiveHabit, unarchiveHabit, updateProgress, startHabitFocus 
  } = useApp();

  return (
    <HabitModule 
      habits={habits}
      onAddHabit={addHabit}
      onUpdateHabit={updateHabit}
      onDeleteHabit={deleteHabit}
      onArchiveHabit={archiveHabit}
      onUnarchiveHabit={unarchiveHabit}
      onUpdateProgress={updateProgress}
      onStartFocus={startHabitFocus}
    />
  );
}
