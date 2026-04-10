"use client";

import { useApp } from "../../../context/AppContext";
import { Dashboard } from "../../../components/Dashboard";

export default function DashboardPage() {
  const { 
    tasks, routines, notes, focusSessions, journalEntries, 
    setRoutines, setJournalEntries, setNotes, setTasks 
  } = useApp();

  return (
    <Dashboard
      tasks={tasks}
      routines={routines}
      notes={notes}
      focusSessions={focusSessions}
      journalEntries={journalEntries}
      onStartRoutine={() => {}} // TODO: Hook up routine player
      onViewChange={() => {}} // Handled by layout
      onQuickAction={() => {}} // TODO
      onExport={() => {}}
      onImport={() => {}}
    />
  );
}
