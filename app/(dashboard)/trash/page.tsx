"use client";

import { useApp } from "../../../context/AppContext";
import { RestoreModule } from "../../../components/RestoreModule";

export default function TrashPage() {
  const { 
    tasks, routines, journalEntries, notes, dumps, projects, habits,
    restoreItem, deleteForever 
  } = useApp();

  return (
    <RestoreModule 
      tasks={tasks}
      routines={routines}
      journalEntries={journalEntries}
      notes={notes}
      dumps={dumps}
      projects={projects}
      habits={habits}
      onRestore={restoreItem}
      onDeleteForever={deleteForever}
    />
  );
}
