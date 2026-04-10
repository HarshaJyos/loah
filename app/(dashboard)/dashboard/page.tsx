"use client";

import { useApp } from "../../../context/AppContext";
import { Dashboard } from "../../../components/Dashboard";

export default function DashboardPage() {
  const { 
    tasks, routines, notes, focusSessions, journalEntries,
    startRoutine, exportData, importData
  } = useApp();

  return (
    <Dashboard
      tasks={tasks}
      routines={routines}
      notes={notes}
      focusSessions={focusSessions}
      journalEntries={journalEntries}
      onStartRoutine={startRoutine}
      onViewChange={() => {}} // Handled by dashboard layout but prop is required
      onQuickAction={() => {}} // TODO: Add quick capture logic if needed
      onExport={exportData}
      onImport={importData}
    />
  );
}
